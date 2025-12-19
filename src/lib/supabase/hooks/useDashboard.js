/**
 * Hook customizado para gerenciar dados do Dashboard
 * Otimizado para reduzir cálculos no client e usar queries otimizadas do backend
 *
 * CACHE: Usa sessionStorage para persistir dados entre navegações
 * - Carrega dados em cache instantaneamente ao montar
 * - Busca dados frescos em background
 * - Atualiza cache quando dados frescos chegam
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getTransactions } from '../api/transactions';
import { getAssets } from '../api/assets';
import { getCategories } from '../api/categories';
import {
  getPreviousMonth,
  calculateHealthScore,
  calculateSavingsRate,
  calculateDailyBudget,
} from '../../../utils/dashboardAnalytics';

// Chave do cache no sessionStorage
const CACHE_KEY = 'dashboard_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Utilitário para gerenciar cache no sessionStorage
 */
const dashboardCache = {
  get: () => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_TTL;

      // Retorna dados mesmo expirados (stale-while-revalidate)
      return { data, isStale: isExpired };
    } catch {
      return null;
    }
  },

  set: (data) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore storage errors (quota exceeded, etc)
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore errors
    }
  },
};

/**
 * Hook useDashboard
 * Centraliza toda a lógica de carregamento e cálculo do dashboard
 *
 * @returns {Object} { data, loading, error, refresh, isFromCache }
 */
export function useDashboard() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);

  // Função para aplicar dados (do cache ou da API)
  const applyData = useCallback((categoriesData, transactionsData, assetsData) => {
    // Mapear transações
    const mappedTransactions = (transactionsData || []).map((t) => ({
      ...t,
      date: t.transaction_date || t.date,
      description: t.description,
      type_internal_name: t.transaction_type_internal_name || t.type_internal_name,
    }));

    // Mapear ativos
    const mappedAssets = (assetsData || []).map((a) => ({
      ...a,
      date: a.valuation_date || a.date,
    }));

    setCategories(categoriesData || []);
    setTransactions(mappedTransactions);
    setAssets(mappedAssets);
  }, []);

  // Carregar dados do dashboard (da API)
  const loadDashboardData = useCallback(async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      // Timeout de segurança
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar dados do dashboard')), 10000);
      });

      // Carregar dados em paralelo
      const dataPromise = Promise.all([
        getTransactions({ limit: 500 }),
        getCategories(),
        getAssets(),
      ]);

      const [transactionsRes, categoriesRes, assetsRes] = await Promise.race([
        dataPromise,
        timeoutPromise,
      ]);

      // Verificar erros de autenticação
      if (transactionsRes?.error?.code === 'AUTH_REQUIRED' ||
        categoriesRes?.error?.code === 'AUTH_REQUIRED' ||
        assetsRes?.error?.code === 'AUTH_REQUIRED') {
        throw new Error('AUTH_REQUIRED');
      }

      // Log de erros sem interromper
      if (transactionsRes?.error) {
        console.error('[useDashboard] Erro ao carregar transações:', transactionsRes.error);
      }
      if (categoriesRes?.error) {
        console.error('[useDashboard] Erro ao carregar categorias:', categoriesRes.error);
      }
      if (assetsRes?.error) {
        console.error('[useDashboard] Erro ao carregar ativos:', assetsRes.error);
      }

      const categoriesData = categoriesRes?.data || [];
      const transactionsData = transactionsRes?.data || [];
      const assetsData = assetsRes?.data || [];

      // Aplicar dados
      applyData(categoriesData, transactionsData, assetsData);

      // Salvar no cache
      dashboardCache.set({
        categories: categoriesData,
        transactions: transactionsData,
        assets: assetsData,
      });

      setIsFromCache(false);
    } catch (err) {
      setError(err);
      console.error('[useDashboard] Erro ao carregar dashboard:', err);

      // Se não temos dados em cache, setar dados vazios
      if (categories.length === 0 && transactions.length === 0) {
        setCategories([]);
        setTransactions([]);
        setAssets([]);
      }
    } finally {
      setLoading(false);
    }
  }, [applyData, categories.length, transactions.length]);

  // Carregar dados ao montar: primeiro do cache, depois da API
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // 1. Tentar carregar do cache primeiro (instantâneo)
    const cached = dashboardCache.get();

    if (cached?.data) {
      const { categories: cachedCategories, transactions: cachedTransactions, assets: cachedAssets } = cached.data;

      // Aplicar dados do cache imediatamente
      applyData(cachedCategories, cachedTransactions, cachedAssets);
      setIsFromCache(true);
      setLoading(false);

      // 2. Se cache não está stale, não precisa recarregar
      if (!cached.isStale) {
        return;
      }

      // 3. Se cache está stale, buscar dados frescos em background
      loadDashboardData(true); // skipLoadingState = true
    } else {
      // Sem cache, carregar normalmente
      loadDashboardData(false);
    }
  }, [applyData, loadDashboardData]);

  // Mês atual
  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const previousMonth = useMemo(() => getPreviousMonth(currentMonth), [currentMonth]);

  // Lookup de categorias otimizado
  const categoryLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  // Agregar transações por mês e categoria
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

  // Dados do mês atual
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

  // Contagem de receitas do mês
  const currentMonthIncomeCount = useMemo(() => (
    transactionsAggregates.currentMonthTransactions.filter((t) => t.type_internal_name === "income").length
  ), [transactionsAggregates]);

  // Patrimônio total
  const totalAssets = useMemo(() =>
    assets.reduce((sum, asset) => sum + asset.value, 0),
    [assets]
  );

  // Média de despesas mensais (últimos 3 meses)
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

  // Health Score
  const healthScoreData = useMemo(() =>
    calculateHealthScore(currentMonthData, assets, avgMonthlyExpenses),
    [currentMonthData, assets, avgMonthlyExpenses]
  );

  // Taxa de poupança
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

  // Orçamento diário
  const dailyBudgetData = useMemo(() =>
    calculateDailyBudget(currentMonthData, daysRemaining, 20),
    [currentMonthData, daysRemaining]
  );

  // Comparação mensal de receitas
  const incomeComparison = useMemo(() => {
    const currentIncome = transactionsAggregates.totalsByMonth.get(currentMonth)?.income || 0;
    const previousIncome = transactionsAggregates.totalsByMonth.get(previousMonth)?.income || 0;
    const change = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    return { current: currentIncome, previous: previousIncome, change };
  }, [transactionsAggregates, currentMonth, previousMonth]);

  // Dados por categoria
  const categoryData = useMemo(() => ({
    income: Array.from(transactionsAggregates.categoryBreakdowns.income.values()),
    expenses: Array.from(transactionsAggregates.categoryBreakdowns.expense.values()),
    investments: Array.from(transactionsAggregates.categoryBreakdowns.investment.values()),
  }), [transactionsAggregates]);

  // Dados para gráficos mensais/trimestrais/semestrais/anuais
  const chartData = useMemo(() => {
    const defaultTotals = { income: 0, expense: 0, investment: 0 };

    // Dados mensais (últimos 6 meses)
    const monthlyData = [];
    let pointer = currentMonth;
    monthlyData.unshift(pointer);
    for (let i = 1; i < 6; i++) {
      pointer = getPreviousMonth(pointer);
      monthlyData.unshift(pointer);
    }

    const monthly = monthlyData.map((month) => {
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

    // Dados trimestrais
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonthNum / 3);
    const startMonth = (currentQuarter - 1) * 3 + 1;

    const quarterMonths = [
      `${currentYear}-${String(startMonth).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 1).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 2).padStart(2, '0')}`,
    ];

    const quarterly = quarterMonths.map((month) => {
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

    // Dados semestrais
    const currentSemester = currentMonthNum <= 6 ? 1 : 2;
    const semesterStartMonth = currentSemester === 1 ? 1 : 7;

    const semesterMonths = [];
    for (let m = 0; m < 6; m++) {
      semesterMonths.push(`${currentYear}-${String(semesterStartMonth + m).padStart(2, '0')}`);
    }

    const semester = semesterMonths.map((month) => {
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

    // Dados anuais
    const yearlyMonths = [];
    for (let m = 1; m <= 12; m++) {
      yearlyMonths.push(`${currentYear}-${String(m).padStart(2, '0')}`);
    }

    const yearly = yearlyMonths.map((month) => {
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

    return { monthly, quarterly, semester, yearly };
  }, [transactionsAggregates, currentMonth]);

  // Função para forçar refresh (limpa cache e recarrega)
  const forceRefresh = useCallback(() => {
    dashboardCache.clear();
    return loadDashboardData(false);
  }, [loadDashboardData]);

  return {
    loading,
    error,
    isFromCache, // Indica se os dados atuais são do cache
    refresh: loadDashboardData,
    forceRefresh, // Limpa cache e força recarregamento
    clearCache: dashboardCache.clear, // Apenas limpa o cache

    // Dados brutos
    rawData: {
      categories,
      transactions,
      assets,
    },

    // Métricas principais
    metrics: {
      currentMonthData,
      currentMonthIncomeCount,
      totalAssets,
      avgMonthlyExpenses,
      healthScoreData,
      savingsRateData,
      dailyBudgetData,
      daysRemaining,
      incomeComparison,
    },

    // Dados para componentes
    categoryData,
    chartData,
  };
}