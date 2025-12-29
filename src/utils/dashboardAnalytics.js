/**
 * Funções de análise financeira para o Dashboard
 */

import { getPreviousMonth } from '../formatters/date';
import {
  MIN_GOOD_SAVINGS_RATE,
  MAX_EXPENSE_RATIO,
  MIN_RUNWAY_MONTHS,
  HEALTH_SCORE_POINTS,
  EXPENSE_INCREASE_ALERT_THRESHOLD,
  CATEGORY_INCREASE_ALERT_THRESHOLD,
  LOW_BALANCE_ALERT_THRESHOLD,
  LOW_BALANCE_MIN_DAYS_REMAINING,
  EXCELLENT_SAVINGS_RATE,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  ESSENTIAL_CATEGORIES,
  PERSONAL_CATEGORIES,
  TRANSACTION_TYPES,
} from '../constants';

// Re-exportar para manter compatibilidade
export { getPreviousMonth };

/**
 * Calcula dados financeiros de um mês específico
 * Usa APENAS transactions como fonte única de verdade (dados não estão duplicados)
 */
export const calculateMonthData = (transactions, month) => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month));

  // Receitas: APENAS transações com type_internal_name === 'income'
  const credits = monthTransactions
    .filter(t => t.type_internal_name === TRANSACTION_TYPES.INCOME)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Débitos/Despesas Mensais: APENAS transações com type_internal_name === 'expense'
  const debits = monthTransactions
    .filter(t => t.type_internal_name === TRANSACTION_TYPES.EXPENSE)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Despesas Planejadas: mesmos valores (transactions é a fonte única)
  const plannedExpenses = debits;

  // Aportes/Investimentos: APENAS transações com type_internal_name === 'investment'
  const investments = monthTransactions
    .filter(t => t.type_internal_name === TRANSACTION_TYPES.INVESTMENT)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Saldo disponível = receitas - despesas Mensais - aportes
  const balance = credits - debits - investments;

  return {
    credits,
    debits,
    expenses: debits,
    plannedExpenses,
    investments,
    balance,
  };
};

/**
 * Calcula o score de saúde financeira (0-100)
 */
export const calculateHealthScore = (currentMonthData, assets, avgExpenses) => {
  let score = 0;
  const breakdown = {
    balancePositive: false,
    savingsRate: false,
    expenseRatio: false,
    growthTrend: false,
  };

  // 1. Saldo positivo no mês?
  if (currentMonthData.balance > 0) {
    score += HEALTH_SCORE_POINTS.BALANCE_POSITIVE;
    breakdown.balancePositive = true;
  }

  // 2. Taxa de poupança acima do mínimo?
  const savings = currentMonthData.balance + currentMonthData.investments;
  const savingsRate = currentMonthData.credits > 0
    ? (savings / currentMonthData.credits) * 100
    : 0;

  if (savingsRate >= MIN_GOOD_SAVINGS_RATE) {
    score += HEALTH_SCORE_POINTS.SAVINGS_RATE;
    breakdown.savingsRate = true;
  }

  // 3. Despesas abaixo do limiar máximo?
  const expenseRatio = currentMonthData.credits > 0
    ? (currentMonthData.expenses / currentMonthData.credits) * 100
    : 100;

  if (expenseRatio < MAX_EXPENSE_RATIO) {
    score += HEALTH_SCORE_POINTS.EXPENSE_RATIO;
    breakdown.expenseRatio = true;
  }

  // 4. Patrimônio suficiente para runway mínimo?
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const runwayMonths = avgExpenses > 0 ? totalAssets / avgExpenses : 0;

  if (runwayMonths >= MIN_RUNWAY_MONTHS) {
    score += HEALTH_SCORE_POINTS.RUNWAY;
    breakdown.growthTrend = true;
  }

  return { score, breakdown };
};

/**
 * Gera alertas inteligentes baseados nos dados
 */
export const generateAlerts = (currentMonthData, previousMonthData, projectionData, expensesByCategory, categoriesData) => {
  const alerts = [];

  // Alerta: Despesas muito acima do mês anterior
  if (previousMonthData && currentMonthData.expenses > previousMonthData.expenses * EXPENSE_INCREASE_ALERT_THRESHOLD) {
    const increase = ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses * 100).toFixed(0);
    alerts.push({
      severity: 'critical',
      message: `Despesas ${increase}% acima do mês anterior`,
      action: 'Revise seus gastos e identifique o que mudou',
      icon: 'AlertTriangle',
    });
  }

  // Alerta: Vai terminar o mês no negativo
  if (projectionData && projectionData.projectedBalance < 0) {
    alerts.push({
      severity: 'critical',
      message: `Você vai terminar o mês com ${Math.abs(projectionData.projectedBalance).toFixed(2)} no negativo`,
      action: `Reduza R$ ${(Math.abs(projectionData.projectedBalance) / projectionData.daysRemaining).toFixed(2)}/dia`,
      icon: 'AlertCircle',
    });
  }

  // Alerta: Categoria com gasto muito acima da média
  expensesByCategory.forEach(cat => {
    if (cat.change > CATEGORY_INCREASE_ALERT_THRESHOLD) {
      alerts.push({
        severity: 'warning',
        message: `Categoria ${cat.category} está ${cat.change.toFixed(0)}% acima do mês anterior`,
        action: 'Verifique se há gastos atípicos nesta categoria',
        icon: 'TrendingUp',
      });
    }
  });

  // Alerta positivo: Poupando bem
  const savingsRate = currentMonthData.credits > 0
    ? ((currentMonthData.balance + currentMonthData.investments) / currentMonthData.credits) * 100
    : 0;

  if (savingsRate >= EXCELLENT_SAVINGS_RATE) {
    alerts.push({
      severity: 'success',
      message: `Parabéns! Você está poupando ${savingsRate.toFixed(1)}% da sua receita`,
      action: 'Continue assim para atingir suas metas!',
      icon: 'CheckCircle',
    });
  }

  // Alerta: Saldo disponível baixo
  if (currentMonthData.balance > 0 && currentMonthData.balance < LOW_BALANCE_ALERT_THRESHOLD && projectionData.daysRemaining > LOW_BALANCE_MIN_DAYS_REMAINING) {
    alerts.push({
      severity: 'warning',
      message: `Saldo disponível está baixo (R$ ${currentMonthData.balance.toFixed(2)})`,
      action: `Ainda faltam ${projectionData.daysRemaining} dias no mês`,
      icon: 'AlertTriangle',
    });
  }

  return alerts;
};

/**
 * Calcula projeção para fim do mês de forma clara e intuitiva
 *
 * LÓGICA DA PROJEÇÃO:
 * 1. Pegamos as receitas confirmadas do mês (já recebidas)
 * 2. Calculamos quanto já foi gasto até hoje
 * 3. Calculamos a média diária de gastos (gasto total ÷ dias passados)
 * 4. Projetamos os gastos futuros (média diária × dias restantes)
 * 5. Calculamos o saldo final esperado: receitas - gastos totais - aportes
 */
export const calculateMonthEndProjection = (transactions, currentMonth) => {
  const now = new Date();
  const [year, month] = currentMonth.split('-').map(Number);

  // PASSO 1: Calcular informações de tempo
  const daysInMonth = new Date(year, month, 0).getDate(); // Total de dias no mês
  const currentDay = now.getMonth() + 1 === month ? now.getDate() : daysInMonth; // Dia atual
  const daysRemaining = daysInMonth - currentDay; // Dias que faltam
  const daysPassed = currentDay; // Dias que já passaram

  // PASSO 2: Buscar dados reais do mês até agora
  const monthData = calculateMonthData(transactions, currentMonth);

  const confirmedIncome = monthData.credits; // Receitas já recebidas
  const currentExpenses = monthData.expenses; // Despesas já realizadas
  const investments = monthData.investments; // Aportes já feitos

  // PASSO 3: Calcular média diária de gastos (baseado no histórico até hoje)
  const avgDailyExpense = daysPassed > 0 ? currentExpenses / daysPassed : 0;

  // PASSO 4: Projetar despesas futuras
  // Se ainda faltam dias no mês, estimamos quanto será gasto com base na média
  const projectedFutureExpenses = avgDailyExpense * daysRemaining;
  const projectedTotalExpenses = currentExpenses + projectedFutureExpenses;

  // PASSO 5: Calcular saldo final projetado
  // Fórmula simples: RECEITAS - DESPESAS TOTAIS - APORTES
  const projectedBalance = confirmedIncome - projectedTotalExpenses - investments;

  return {
    // Valores reais
    credits: confirmedIncome,
    currentExpenses: currentExpenses,
    investments: investments,

    // Projeções
    projectedExpenses: projectedTotalExpenses,
    projectedBalance: projectedBalance,

    // Métricas auxiliares
    avgDailyExpense: avgDailyExpense,
    daysRemaining: daysRemaining,
    daysPassed: daysPassed,
    totalDaysInMonth: daysInMonth,

    // Projeção futura específica (quanto ainda vai gastar)
    projectedFutureExpenses: projectedFutureExpenses,
  };
};

/**
 * Calcula despesas por categoria com mudança vs mês anterior
 */
export const calculateExpensesByCategory = (expenses, previousExpenses, categories) => {
  const currentByCategory = {};
  const previousByCategory = {};

  // Agrupar despesas atuais
  expenses.forEach(e => {
    if (!currentByCategory[e.category]) {
      currentByCategory[e.category] = 0;
    }
    currentByCategory[e.category] += e.amount;
  });

  // Agrupar despesas anteriores
  previousExpenses.forEach(e => {
    if (!previousByCategory[e.category]) {
      previousByCategory[e.category] = 0;
    }
    previousByCategory[e.category] += e.amount;
  });

  // Calcular mudanças
  const result = Object.keys(currentByCategory).map(catName => {
    const currentAmount = currentByCategory[catName];
    const previousAmount = previousByCategory[catName] || 0;
    const change = previousAmount > 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

    const category = categories.find(c => c.name === catName || c.id === catName.toLowerCase());

    return {
      category: catName,
      amount: currentAmount,
      previousAmount,
      change,
      percentage: 0, // Será calculado depois com o total
      color: category?.color || '#64748b',
    };
  });

  // Calcular porcentagens
  const total = result.reduce((sum, item) => sum + item.amount, 0);
  result.forEach(item => {
    item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
  });

  return result.sort((a, b) => b.amount - a.amount);
};

/**
 * Calcula dados para a regra 50/30/20
 */
export const calculateBudgetRule503020 = (expenses, currentMonthData, categories) => {
  let essentials = 0;
  let personal = 0;

  expenses.forEach(e => {
    if (ESSENTIAL_CATEGORIES.includes(e.category)) {
      essentials += e.amount;
    } else if (PERSONAL_CATEGORIES.includes(e.category)) {
      personal += e.amount;
    }
  });

  // Poupança = saldo + investimentos
  let savings = currentMonthData.balance > 0 ? currentMonthData.balance : 0;
  savings += currentMonthData.investments;

  const totalIncome = currentMonthData.credits;

  const percentages = {
    essentials: totalIncome > 0 ? (essentials / totalIncome) * 100 : 0,
    personal: totalIncome > 0 ? (personal / totalIncome) * 100 : 0,
    savings: totalIncome > 0 ? (savings / totalIncome) * 100 : 0,
  };

  return {
    essentials,
    personal,
    savings,
    totalIncome,
    percentages,
  };
};

/**
 * Calcula a taxa de poupança (savings rate)
 * Retorna percentual e valor em reais
 */
export const calculateSavingsRate = (currentMonthData, savingsGoalPercentage = DEFAULT_SAVINGS_GOAL_PERCENTAGE) => {
  const totalIncome = currentMonthData.credits;

  // Poupança = Saldo + Investimentos
  const savings = (currentMonthData.balance > 0 ? currentMonthData.balance : 0) + currentMonthData.investments;

  // Taxa de poupança (%)
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Quanto falta para atingir a meta
  const goalAmount = totalIncome * (savingsGoalPercentage / 100);
  const amountToGoal = Math.max(0, goalAmount - savings);

  return {
    savingsRate,
    savingsAmount: savings,
    goal: savingsGoalPercentage,
    amountToGoal,
    totalIncome,
  };
};

/**
 * Calcula o orçamento diário disponível
 * Considera saldo, dias restantes e meta de poupança
 */
export const calculateDailyBudget = (currentMonthData, daysRemaining, savingsGoalPercentage = DEFAULT_SAVINGS_GOAL_PERCENTAGE) => {
  const totalIncome = currentMonthData.credits;
  const currentBalance = currentMonthData.balance;

  // Meta de poupança em reais
  const savingsGoal = totalIncome * (savingsGoalPercentage / 100);

  // Quanto já foi guardado/investido
  const alreadySaved = currentMonthData.investments;

  // Quanto ainda precisa guardar
  const remainingSavingsGoal = Math.max(0, savingsGoal - alreadySaved);

  // Saldo disponível para gastar (descontando a meta de poupança)
  const availableToSpend = currentBalance - remainingSavingsGoal;

  // Orçamento diário
  const dailyBudget = daysRemaining > 0 ? availableToSpend / daysRemaining : 0;

  return {
    dailyBudget,
    availableBalance: currentBalance,
    savingsGoal: remainingSavingsGoal,
    daysRemaining,
  };
};