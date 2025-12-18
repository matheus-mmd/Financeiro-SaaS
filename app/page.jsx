"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../src/components/PageHeader";
import StatsCard from "../src/components/StatsCard";
import DashboardSkeleton from "../src/components/DashboardSkeleton";
import { formatCurrency } from "../src/utils";
import { getTransactions } from "../src/lib/supabase/api/transactions";
import { getAssets } from "../src/lib/supabase/api/assets";
import { getCategories } from "../src/lib/supabase/api/categories";
import { getIconComponent } from "../src/components/IconPicker";
import { Wallet, TrendingDown, ArrowUpRight, PiggyBank, Coins, Heart, Percent, CalendarDays } from "lucide-react";
import { useAuth } from "../src/contexts/AuthContext";

// Componentes de análise do dashboard
import CategoryBreakdownCard from "../src/components/dashboard/CategoryBreakdownCard";
import IncomeVsExpensesChart from "../src/components/dashboard/IncomeVsExpensesChart";

// Funções de análise
import {
  getPreviousMonth,
  calculateHealthScore,
  calculateSavingsRate,
  calculateDailyBudget,
} from "../src/utils/dashboardAnalytics";

/**
 * Página Dashboard - Visão geral do controle financeiro
 * Exibe resumo mensal, análises comparativas e insights
 */
export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAuthFailure = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [router, signOut]);

  useEffect(() => {
    // CORREÇÃO CRÍTICA: Aguardar auth estar pronto antes de carregar dados
    // Isso previne erros 400 causados por RLS quando queries são feitas sem autenticação
    if (authLoading) {
      return; // Aguardar auth terminar de carregar
    }

    if (!user) {
      // Usuário não autenticado - não carregar dados
      setLoading(false);
      router.replace('/login');
      return;
    }

    let isMounted = true;
    let timeoutId;

    const loadData = async () => {
      try {
        // Timeout de 10 segundos para prevenir loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Timeout ao carregar dados do dashboard'));
          }, 10000);
        });

        // OTIMIZAÇÃO: Apenas 3 chamadas ao invés de 5
        // - getTransactions() traz todas as transações (filtrar localmente por tipo)
        // - getCategories() para informações de categorias
        // - getAssets() para patrimônio
        const dataPromise = Promise.all([
          getTransactions({ limit: 500 }),
          getCategories(),
          getAssets(),
        ]);

        const [transactionsRes, categoriesRes, assetsRes] = await Promise.race([
          dataPromise,
          timeoutPromise,
        ]);

        if (timeoutId) clearTimeout(timeoutId);
        if (!isMounted) return;

        // Log de erros sem interromper o fluxo
        if (transactionsRes?.error?.code === 'AUTH_REQUIRED' ||
          categoriesRes?.error?.code === 'AUTH_REQUIRED' ||
          assetsRes?.error?.code === 'AUTH_REQUIRED') {
          await handleAuthFailure();
          return;
        }

        if (transactionsRes?.error) {
          console.error("[Dashboard] Erro ao carregar transações:", transactionsRes.error);
        }
        if (categoriesRes?.error) {
          console.error("[Dashboard] Erro ao carregar categorias:", categoriesRes.error);
        }
        if (assetsRes?.error) {
          console.error("[Dashboard] Erro ao carregar ativos:", assetsRes.error);
        }

        // Mapear transações
        const mappedTransactions = (transactionsRes?.data || []).map((t) => ({
          ...t,
          date: t.transaction_date,
          description: t.description,
          type_internal_name: t.transaction_type_internal_name,
        }));

        const mappedAssets = (assetsRes?.data || []).map((a) => ({
          ...a,
          date: a.valuation_date,
        }));

        setCategories(categoriesRes?.data || []);
        setTransactions(mappedTransactions);
        setAssets(mappedAssets);
      } catch (error) {
        if (error?.code === 'AUTH_REQUIRED') {
          await handleAuthFailure();
          return;
        }
        if (error.name !== 'AbortError') {
          console.error("[Dashboard] Erro ao carregar dashboard:", error);
          // Mesmo com erro, setar dados vazios para não quebrar UI
          setCategories([]);
          setTransactions([]);
          setAssets([]);
        }
      } finally {
        // CORREÇÃO CRÍTICA: SEMPRE liberar loading, mesmo com erro
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup: cancelar requisições se usuário sair da página
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [authLoading, user, handleAuthFailure, router]); // CORREÇÃO: Adicionar authLoading e user como deps para re-carregar quando auth mudar

  // Mês atual para filtros
  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const previousMonth = useMemo(() => getPreviousMonth(currentMonth), [currentMonth]);

  const categoryLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  const transactionsAggregates = useMemo(() => {
    const totalsByMonth = new Map();
    const categoryBreakdowns = {
      income: new Map(),
      expense: new Map(),
      investment: new Map(),
    };
    const currentMonthTransactions = [];

    const defaults = {
      income: { color: "#10b981", icon: "Tag" },
      expense: { color: "#6366f1", icon: "Tag" },
      investment: { color: "#06b6d4", icon: "TrendingUp" },
    };

    transactions.forEach((transaction) => {
      if (!transaction?.date) return;

      const month = transaction.date.slice(0, 7);
      const amount = Math.abs(transaction.amount || 0);
      const type = transaction.type_internal_name;

      if (!totalsByMonth.has(month)) {
        totalsByMonth.set(month, { income: 0, expense: 0, investment: 0 });
      }

      if (type === "income" || type === "expense" || type === "investment") {
        const monthEntry = totalsByMonth.get(month);
        monthEntry[type] += amount;

        if (month === currentMonth) {
          currentMonthTransactions.push(transaction);

          const categoryMeta = categoryLookup.get(transaction.category_id);
          const breakdownMap = categoryBreakdowns[type];
          const name = transaction.category_name || categoryMeta?.name || "Outros";

          const existing = breakdownMap.get(name) || {
            name,
            value: 0,
            color: categoryMeta?.color || transaction.category_color || defaults[type].color,
            icon: categoryMeta?.icon || transaction.category_icon || defaults[type].icon,
          };
          existing.value += amount;
          breakdownMap.set(name, existing);
        }
      }
    });

    return { totalsByMonth, categoryBreakdowns, currentMonthTransactions };
  }, [transactions, currentMonth, categoryLookup]);

  const currentMonthData = useMemo(() => {
    const totals = transactionsAggregates.totalsByMonth.get(currentMonth) || { income: 0, expense: 0, investment: 0 };
    const credits = totals.income;
    const debits = totals.expense;
    const investments = totals.investment;
    const balance = credits - debits - investments;

    return {
      credits,
      debits,
      expenses: debits,
      plannedExpenses: debits,
      investments,
      balance,
    };
  }, [transactionsAggregates, currentMonth]);

  const currentMonthIncomeCount = useMemo(() => (
    transactionsAggregates.currentMonthTransactions.filter((t) => t.type_internal_name === "income").length
  ), [transactionsAggregates]);

  // Calcular patrimônio total
  const totalAssets = useMemo(() =>
    assets.reduce((sum, asset) => sum + asset.value, 0),
    [assets]
  );

  // Calcular média de despesas mensais (últimos 3 meses) - APENAS de transactions
  const avgMonthlyExpenses = useMemo(() => {
    const months = [currentMonth, previousMonth, getPreviousMonth(previousMonth)];
    const expenses = months
      .map((month) => transactionsAggregates.totalsByMonth.get(month)?.expense || 0)
      .filter((value) => value > 0);

    if (expenses.length === 0) {
      return currentMonthData.expenses;
    }

    const total = expenses.reduce((sum, value) => sum + value, 0);
    return total / expenses.length;
  }, [transactionsAggregates, currentMonth, previousMonth, currentMonthData.expenses]);

  // Calcular Health Score
  const healthScoreData = useMemo(() =>
    calculateHealthScore(currentMonthData, assets, avgMonthlyExpenses),
    [currentMonthData, assets, avgMonthlyExpenses]
  );

  // Calcular Taxa de Poupança
  const savingsRateData = useMemo(() =>
    calculateSavingsRate(currentMonthData, 20),
    [currentMonthData]
  );

  // Dias restantes no mês
  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  }, []);

  // Calcular Orçamento Diário
  const dailyBudgetData = useMemo(() =>
    calculateDailyBudget(currentMonthData, daysRemaining, 20),
    [currentMonthData, daysRemaining]
  );

  // Calcular comparações mês a mês para os cards - APENAS de transactions
  const incomeComparison = useMemo(() => {
    const currentIncome = transactionsAggregates.totalsByMonth.get(currentMonth)?.income || 0;
    const previousIncome = transactionsAggregates.totalsByMonth.get(previousMonth)?.income || 0;
    const change = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    return { current: currentIncome, previous: previousIncome, change };
  }, [transactionsAggregates, currentMonth, previousMonth]);

  // Preparar dados para CategoryBreakdownCard
  const incomeByCategory = useMemo(() =>
    Array.from(transactionsAggregates.categoryBreakdowns.income.values()),
    [transactionsAggregates]
  );

  const investmentsByCategory = useMemo(() =>
    Array.from(transactionsAggregates.categoryBreakdowns.investment.values()),
    [transactionsAggregates]
  );

  const currentMonthExpensesByCategory = useMemo(() =>
    Array.from(transactionsAggregates.categoryBreakdowns.expense.values()),
    [transactionsAggregates]
  );

  // Preparar dados para IncomeVsExpensesChart
  const incomeVsExpensesMonthlyData = useMemo(() => {
    const defaultTotals = { income: 0, expense: 0, investment: 0 };
    const months = [];
    let pointer = currentMonth;
    months.unshift(pointer);
    for (let i = 1; i < 6; i++) {
      pointer = getPreviousMonth(pointer);
      months.unshift(pointer);
    }

    return months.map((month) => {
      const totals = transactionsAggregates.totalsByMonth.get(month) || defaultTotals;
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: totals.income,
        expense: totals.expense,
        investment: totals.investment,
      };
    });
  }, [transactionsAggregates, currentMonth]);

  const incomeVsExpensesQuarterlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonthNum / 3);
    const startMonth = (currentQuarter - 1) * 3 + 1;
    const defaultTotals = { income: 0, expense: 0, investment: 0 };

    const quarterMonths = [
      `${currentYear}-${String(startMonth).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 1).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 2).padStart(2, '0')}`,
    ];

    return quarterMonths.map((month) => {
      const totals = transactionsAggregates.totalsByMonth.get(month) || defaultTotals;
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: totals.income,
        expense: totals.expense,
        investment: totals.investment,
      };
    });
  }, [transactionsAggregates]);

  const incomeVsExpensesSemesterData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentSemester = currentMonthNum <= 6 ? 1 : 2;
    const startMonth = currentSemester === 1 ? 1 : 7;
    const defaultTotals = { income: 0, expense: 0, investment: 0 };

    const semesterMonths = [];
    for (let m = 0; m < 6; m++) {
      semesterMonths.push(`${currentYear}-${String(startMonth + m).padStart(2, '0')}`);
    }

    return semesterMonths.map((month) => {
      const totals = transactionsAggregates.totalsByMonth.get(month) || defaultTotals;
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: totals.income,
        expense: totals.expense,
        investment: totals.investment,
      };
    });
  }, [transactionsAggregates]);

  const incomeVsExpensesYearlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const defaultTotals = { income: 0, expense: 0, investment: 0 };

    const yearlyMonths = [];
    for (let m = 1; m <= 12; m++) {
      yearlyMonths.push(`${currentYear}-${String(m).padStart(2, '0')}`);
    }

    return yearlyMonths.map((month) => {
      const totals = transactionsAggregates.totalsByMonth.get(month) || defaultTotals;
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: totals.income,
        expense: totals.expense,
        investment: totals.investment,
      };
    });
  }, [transactionsAggregates]);

  // Mostrar skeleton enquanto auth ou dados estiverem carregando
  if (!authLoading && !user) {
    return null;
  }

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  const transactionColumns = [
    {
      key: "description",
      label: "Descrição",
      sortable: true,
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      render: (row) => {
        const IconComponent = getIconComponent(row.category_icon || "Tag");
        return (
          <div className="flex items-center gap-2">
            <div
              className="p-1 rounded flex-shrink-0"
              style={{ backgroundColor: row.category_color + '20' }}
            >
              <IconComponent
                className="w-4 h-4"
                style={{ color: row.category_color }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {row.category_name}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span className={row.amount >= 0 ? "text-success-600 font-medium" : "text-danger-600 font-medium"}>
          {row.amount >= 0 ? "+" : "-"} {formatCurrency(Math.abs(row.amount))}
        </span>
      ),
    },
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu controle financeiro"
      />

      {/* 📊 VISÃO GERAL - Cards Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
          <StatsCard
            icon={Heart}
            label="Saúde Financeira"
            value={`${healthScoreData.score}/100`}
            subtitle={
              healthScoreData.score >= 80 ? "Excelente" :
              healthScoreData.score >= 60 ? "Bom" :
              healthScoreData.score >= 40 ? "Regular" : "Precisa atenção"
            }
            iconColor={
              healthScoreData.score >= 80 ? "green" :
              healthScoreData.score >= 60 ? "blue" :
              healthScoreData.score >= 40 ? "yellow" : "red"
            }
            valueColor={
              healthScoreData.score >= 80 ? "text-success-600" :
              healthScoreData.score >= 60 ? "text-brand-600" :
              healthScoreData.score >= 40 ? "text-warning-600" : "text-danger-600"
            }
          />
          <StatsCard
            icon={Percent}
            label="Taxa de Poupança"
            value={`${savingsRateData.savingsRate.toFixed(1)}%`}
            subtitle={
              savingsRateData.savingsRate >= savingsRateData.goal
                ? `Meta de ${savingsRateData.goal}% atingida`
                : `Faltam ${formatCurrency(savingsRateData.amountToGoal)} para meta`
            }
            iconColor={savingsRateData.savingsRate >= savingsRateData.goal ? "green" : "yellow"}
            valueColor={savingsRateData.savingsRate >= savingsRateData.goal ? "text-success-600" : "text-warning-600"}
          />
          <StatsCard
            icon={CalendarDays}
            label="Disponível por Dia"
            value={formatCurrency(dailyBudgetData.dailyBudget)}
            subtitle={`${dailyBudgetData.daysRemaining} dias restantes no mês`}
            iconColor={dailyBudgetData.dailyBudget > 0 ? "purple" : "red"}
            valueColor={dailyBudgetData.dailyBudget > 0 ? "text-accent-600" : "text-danger-600"}
          />
          <StatsCard
            icon={Wallet}
            label="Saldo Disponível"
            value={formatCurrency(currentMonthData.balance)}
            subtitle={`${formatCurrency(dailyBudgetData.dailyBudget)}/dia pelos próximos ${dailyBudgetData.daysRemaining} dias`}
            iconColor={currentMonthData.balance >= 0 ? "blue" : "red"}
            valueColor={currentMonthData.balance >= 0 ? "text-brand-600" : "text-danger-600"}
          />
        </div>
      </div>

      {/* 💰 ANÁLISE MENSAL - Receitas, Despesas e Aportes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Análise Mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
          <StatsCard
            icon={ArrowUpRight}
            label="Receitas Mensais"
            value={formatCurrency(incomeComparison.current)}
            subtitle={
              incomeComparison.change !== 0
                ? `vs mês anterior: ${incomeComparison.change > 0 ? '+' : ''}${incomeComparison.change.toFixed(1)}% ${incomeComparison.change > 0 ? '↗️' : '↘️'}`
                : `${currentMonthIncomeCount} receita(s)`
            }
            iconColor="green"
            valueColor="text-success-600"
          />
          <StatsCard
            icon={TrendingDown}
            label="Despesas Reais"
            value={formatCurrency(currentMonthData.debits)}
            subtitle={
              currentMonthData.plannedExpenses > 0
                ? currentMonthData.debits > currentMonthData.plannedExpenses
                  ? `⚠️ Acima do planejado (+${formatCurrency(currentMonthData.debits - currentMonthData.plannedExpenses)})`
                  : currentMonthData.debits < currentMonthData.plannedExpenses
                  ? `✓ Abaixo do planejado (-${formatCurrency(currentMonthData.plannedExpenses - currentMonthData.debits)})`
                  : `✓ Igual ao planejado (${formatCurrency(currentMonthData.plannedExpenses)})`
                : `Planejado: ${formatCurrency(currentMonthData.plannedExpenses)}`
            }
            iconColor="red"
            valueColor="text-danger-600"
          />
          <StatsCard
            icon={Coins}
            label="Aportes Mensais"
            value={formatCurrency(currentMonthData.investments)}
            subtitle={incomeComparison.current > 0 ? `${((currentMonthData.investments / incomeComparison.current) * 100).toFixed(1)}% da receita` : "Sem receitas"}
            iconColor="info"
            valueColor="text-info-600"
          />
          <StatsCard
            icon={PiggyBank}
            label="Patrimônio Total"
            value={formatCurrency(totalAssets)}
            subtitle={`${assets.length} ativo(s)`}
            iconColor="purple"
            valueColor="text-accent-600"
          />
        </div>
      </div>

      {/* 📈 GRÁFICOS E ANÁLISES */}
      <div className="space-y-4">
        <IncomeVsExpensesChart
          monthlyData={incomeVsExpensesMonthlyData}
          quarterlyData={incomeVsExpensesQuarterlyData}
          semesterData={incomeVsExpensesSemesterData}
          yearlyData={incomeVsExpensesYearlyData}
        />

        <CategoryBreakdownCard
          incomeData={incomeByCategory}
          expenseData={currentMonthExpensesByCategory}
          investmentData={investmentsByCategory}
        />
      </div>
    </div>
  );
}