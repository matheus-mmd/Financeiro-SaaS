/**
 * Funções de análise financeira para o Dashboard
 */

/**
 * Calcula o mês anterior baseado no mês atual
 */
export const getPreviousMonth = (currentMonth) => {
  const [year, month] = currentMonth.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};

/**
 * Calcula dados financeiros de um mês específico
 */
export const calculateMonthData = (transactions, expenses, month) => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month));
  const monthExpenses = expenses.filter(e => e.date.startsWith(month));

  const credits = monthTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const debits = monthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const investments = monthTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const balance = credits - totalExpenses - investments;

  return {
    credits,
    debits,
    expenses: totalExpenses,
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

  // 1. Saldo positivo no mês? +25 pontos
  if (currentMonthData.balance > 0) {
    score += 25;
    breakdown.balancePositive = true;
  }

  // 2. Taxa de poupança > 10%? +25 pontos
  const savings = currentMonthData.balance + currentMonthData.investments;
  const savingsRate = currentMonthData.credits > 0
    ? (savings / currentMonthData.credits) * 100
    : 0;

  if (savingsRate >= 10) {
    score += 25;
    breakdown.savingsRate = true;
  }

  // 3. Despesas < 70% da receita? +25 pontos
  const expenseRatio = currentMonthData.credits > 0
    ? (currentMonthData.expenses / currentMonthData.credits) * 100
    : 100;

  if (expenseRatio < 70) {
    score += 25;
    breakdown.expenseRatio = true;
  }

  // 4. Patrimônio suficiente (>3 meses de despesas)? +25 pontos
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const runwayMonths = avgExpenses > 0 ? totalAssets / avgExpenses : 0;

  if (runwayMonths >= 3) {
    score += 25;
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
  if (previousMonthData && currentMonthData.expenses > previousMonthData.expenses * 1.2) {
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
    if (cat.change > 40) {
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

  if (savingsRate >= 20) {
    alerts.push({
      severity: 'success',
      message: `Parabéns! Você está poupando ${savingsRate.toFixed(1)}% da sua receita`,
      action: 'Continue assim para atingir suas metas!',
      icon: 'CheckCircle',
    });
  }

  // Alerta: Saldo disponível baixo
  if (currentMonthData.balance > 0 && currentMonthData.balance < 500 && projectionData.daysRemaining > 5) {
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
 * Calcula projeção para fim do mês
 */
export const calculateMonthEndProjection = (transactions, expenses, currentMonth) => {
  const now = new Date();
  const [year, month] = currentMonth.split('-').map(Number);

  // Calcular dias do mês
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = now.getMonth() + 1 === month ? now.getDate() : daysInMonth;
  const daysRemaining = daysInMonth - currentDay;

  // Dados atuais do mês
  const monthData = calculateMonthData(transactions, expenses, currentMonth);

  // Calcular média diária de despesas
  const avgDailyExpense = currentDay > 0 ? monthData.expenses / currentDay : 0;

  // Projetar despesas para o resto do mês
  const projectedAdditionalExpenses = avgDailyExpense * daysRemaining;
  const projectedExpenses = monthData.expenses + projectedAdditionalExpenses;

  // Projetar saldo final
  const projectedBalance = monthData.credits - projectedExpenses - monthData.investments;

  return {
    credits: monthData.credits,
    currentExpenses: monthData.expenses,
    projectedExpenses,
    investments: monthData.investments,
    projectedBalance,
    daysRemaining,
    avgDailyExpense,
    totalDaysInMonth: daysInMonth,
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
  // Categorias essenciais (moradia, transporte, alimentação, saúde)
  const essentialCategories = ['Moradia', 'Transporte', 'Alimentação', 'Saúde'];

  // Categorias pessoais (lazer, educação, outros)
  const personalCategories = ['Lazer', 'Educação', 'Outros'];

  let essentials = 0;
  let personal = 0;

  expenses.forEach(e => {
    if (essentialCategories.includes(e.category)) {
      essentials += e.amount;
    } else if (personalCategories.includes(e.category)) {
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