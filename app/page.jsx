"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PageHeader from "../src/components/PageHeader";
import StatsCard from "../src/components/StatsCard";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../src/components/ui/dialog";
import DashboardSkeleton from "../src/components/DashboardSkeleton";
import DatePicker from "../src/components/DatePicker";
import Table from "../src/components/Table";
import { formatCurrency, formatDate } from "../src/utils";
import { getTransactions } from "../src/lib/supabase/api/transactions";
import { getAssets } from "../src/lib/supabase/api/assets";
import { getCategories } from "../src/lib/supabase/api/categories";
import { TRANSACTION_TYPE_IDS } from "../src/constants";
import { getIconComponent } from "../src/components/IconPicker";
import { Wallet, TrendingDown, ArrowUpRight, PiggyBank, Coins, Heart, Percent, CalendarDays } from "lucide-react";

// Componentes de análise do dashboard
import CategoryBreakdownCard from "../src/components/dashboard/CategoryBreakdownCard";
import IncomeVsExpensesChart from "../src/components/dashboard/IncomeVsExpensesChart";

// Funções de análise
import {
  getPreviousMonth,
  calculateMonthData,
  calculateHealthScore,
  calculateSavingsRate,
  calculateDailyBudget,
} from "../src/utils/dashboardAnalytics";

/**
 * Página Dashboard - Visão geral do controle financeiro
 * Exibe resumo mensal, análises comparativas e insights
 */
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "debit",
    date: new Date(),
  });

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        const [
          expensesRes,
          incomesRes,
          categoriesRes,
          transactionsRes,
          assetsRes,
        ] = await Promise.all([
          getTransactions({ transaction_type_id: TRANSACTION_TYPE_IDS.EXPENSE }),
          getTransactions({ transaction_type_id: TRANSACTION_TYPE_IDS.INCOME }),
          getCategories(),
          getTransactions(),
          getAssets(),
        ]);

        // Verificar se componente ainda está montado antes de atualizar state
        if (!isMounted) return;

        if (expensesRes.error) throw expensesRes.error;
        if (incomesRes.error) throw incomesRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (transactionsRes.error) throw transactionsRes.error;
        if (assetsRes.error) throw assetsRes.error;

        // Map Supabase fields to component fields
        const mappedExpenses = (expensesRes.data || []).map((e) => ({
          ...e,
          date: e.transaction_date,
          title: e.description,
          category: e.category_name,
        }));

        const mappedIncomes = (incomesRes.data || []).map((i) => ({
          ...i,
          date: i.transaction_date,
          title: i.description,
          category: i.category_name,
        }));

        const mappedTransactions = (transactionsRes.data || []).map((t) => ({
          ...t,
          date: t.transaction_date,
          description: t.description,
          type_internal_name: t.transaction_type_internal_name,
        }));

        const mappedAssets = (assetsRes.data || []).map((a) => ({
          ...a,
          date: a.valuation_date,
        }));

        setExpenses(mappedExpenses);
        setIncomes(mappedIncomes);
        setCategories(categoriesRes.data || []);
        setTransactions(mappedTransactions);
        setAssets(mappedAssets);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Erro ao carregar dashboard:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup: cancelar requisições se usuário sair da página
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // Mês atual para filtros
  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const previousMonth = useMemo(() => getPreviousMonth(currentMonth), [currentMonth]);

  // Calcular dados dos meses atual e anterior
  const currentMonthExpenses = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const currentMonthIncomes = useMemo(() =>
    incomes.filter((i) => i.date.startsWith(currentMonth)),
    [incomes, currentMonth]
  );

  const currentMonthData = useMemo(() =>
    calculateMonthData(transactions, currentMonth),
    [transactions, currentMonth]
  );

  // Calcular patrimônio total
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calcular média de despesas mensais (últimos 3 meses) - APENAS de transactions
  const avgMonthlyExpenses = useMemo(() => {
    const months = [currentMonth, previousMonth, getPreviousMonth(previousMonth)];
    let totalExpenses = 0;
    let count = 0;

    months.forEach(month => {
      const monthExpenses = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      if (monthExpenses > 0) {
        totalExpenses += monthExpenses;
        count++;
      }
    });

    return count > 0 ? totalExpenses / count : currentMonthData.expenses;
  }, [transactions, currentMonth, previousMonth, currentMonthData.expenses]);

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
    const currentIncome = transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const previousIncome = transactions
      .filter(t => t.date.startsWith(previousMonth) && t.type_internal_name === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const change = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    return { current: currentIncome, previous: previousIncome, change };
  }, [transactions, currentMonth, previousMonth]);

  // Filtrar e ordenar transações do mês atual para a tabela
  const recentTransactions = useMemo(() => {
    const currentMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );

    const sorted = [...currentMonthTransactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      return Math.abs(b.amount) - Math.abs(a.amount);
    });

    return sorted;
  }, [transactions, currentMonth]);

  // Preparar dados para CategoryBreakdownCard - Receitas por Categoria
  // Usa APENAS transactions (fonte única de verdade)
  const incomeByCategory = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth) &&
      t.type_internal_name === 'income'
    );

    const grouped = currentMonthTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.category_name || 'Outros';
      const existing = acc.find(item => item.name === categoryName);

      if (existing) {
        existing.value += Math.abs(transaction.amount);
      } else {
        const category = categories.find(c => c.name === categoryName || c.id === transaction.category_id);
        acc.push({
          name: categoryName,
          value: Math.abs(transaction.amount),
          color: category?.color || transaction.category_color || "#10b981",
          icon: category?.icon || transaction.category_icon || "Tag",
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [transactions, currentMonth, categories]);

  // Preparar dados para CategoryBreakdownCard - Investimentos/Aportes por Categoria
  const investmentsByCategory = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth) &&
      t.type_internal_name === 'investment'
    );

    const grouped = currentMonthTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.category_name || 'Outros';
      const existing = acc.find(item => item.name === categoryName);

      if (existing) {
        existing.value += Math.abs(transaction.amount);
      } else {
        const category = categories.find(c => c.name === categoryName || c.id === transaction.category_id);
        acc.push({
          name: categoryName,
          value: Math.abs(transaction.amount),
          color: category?.color || transaction.category_color || "#06b6d4",
          icon: category?.icon || transaction.category_icon || "TrendingUp",
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [transactions, currentMonth, categories]);

  // Preparar dados para CategoryBreakdownCard - Despesas por Categoria do mês atual
  // Usa APENAS transactions (fonte única de verdade)
  const currentMonthExpensesByCategory = useMemo(() => {
    const monthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth) &&
      t.type_internal_name === 'expense'
    );

    const grouped = monthTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.category_name || 'Outros';
      const existing = acc.find(item => item.name === categoryName);
      if (existing) {
        existing.value += Math.abs(transaction.amount);
      } else {
        const category = categories.find(c => c.name === categoryName || c.id === transaction.category_id);
        acc.push({
          name: categoryName,
          value: Math.abs(transaction.amount),
          color: category?.color || transaction.category_color || "#6366f1",
          icon: category?.icon || transaction.category_icon || "Tag",
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [transactions, currentMonth, categories]);

  // Preparar dados DIÁRIOS para IncomeVsExpensesChart
  // Usa APENAS transactions (fonte única de verdade)
  const incomeVsExpensesDailyData = useMemo(() => {
    const dailyData = {};

    // Receitas: APENAS transactions com type_internal_name === 'income'
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'income')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0, investment: 0 };
        }
        dailyData[day].income += Math.abs(t.amount);
      });

    // Despesas: APENAS transactions com type_internal_name === 'expense'
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'expense')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0, investment: 0 };
        }
        dailyData[day].expense += Math.abs(t.amount);
      });

    // Aportes/Investimentos: APENAS transactions com type_internal_name === 'investment'
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'investment')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0, investment: 0 };
        }
        dailyData[day].investment += Math.abs(t.amount);
      });

    return Object.values(dailyData)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .map(d => ({
        ...d,
        date: `${d.date}`,
      }));
  }, [transactions, currentMonth]);

  // Preparar dados MENSAIS para IncomeVsExpensesChart
  // Usa APENAS transactions (fonte única de verdade)
  const incomeVsExpensesMonthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      let tempMonth = currentMonth;
      for (let j = 0; j < i; j++) {
        tempMonth = getPreviousMonth(tempMonth);
      }
      months.push(tempMonth);
    }

    return months.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      // Receitas: APENAS transactions (tipo income)
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas: APENAS transactions (tipo expense)
      const monthExpense = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: monthExpense,
      };
    });
  }, [transactions, currentMonth]);

  // Preparar dados TRIMESTRAIS para IncomeVsExpensesChart (3 meses do trimestre atual)
  // Usa APENAS transactions (fonte única de verdade)
  const incomeVsExpensesQuarterlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12

    // Determinar trimestre atual (Q1, Q2, Q3, Q4)
    const currentQuarter = Math.ceil(currentMonthNum / 3);

    // Meses do trimestre atual
    const startMonth = (currentQuarter - 1) * 3 + 1;
    const quarterMonths = [
      `${currentYear}-${String(startMonth).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 1).padStart(2, '0')}`,
      `${currentYear}-${String(startMonth + 2).padStart(2, '0')}`,
    ];

    return quarterMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      // Receitas: APENAS transactions (tipo income)
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas: APENAS transactions (tipo expense)
      const monthExpense = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Aportes/Investimentos: APENAS transactions (tipo investment)
      const monthInvestment = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'investment')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: monthExpense,
        investment: monthInvestment,
      };
    });
  }, [transactions, currentMonth]);

  // Preparar dados SEMESTRAIS para IncomeVsExpensesChart (6 meses do semestre atual)
  // Usa APENAS transactions (fonte única de verdade)
  const incomeVsExpensesSemesterData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // 1-12

    // Determinar semestre atual (1 ou 2)
    const currentSemester = currentMonthNum <= 6 ? 1 : 2;

    // Meses do semestre atual
    const startMonth = currentSemester === 1 ? 1 : 7;
    const semesterMonths = [];
    for (let m = 0; m < 6; m++) {
      semesterMonths.push(`${currentYear}-${String(startMonth + m).padStart(2, '0')}`);
    }

    return semesterMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      // Receitas: APENAS transactions (tipo income)
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas: APENAS transactions (tipo expense)
      const monthExpense = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Aportes/Investimentos: APENAS transactions (tipo investment)
      const monthInvestment = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'investment')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: monthExpense,
        investment: monthInvestment,
      };
    });
  }, [transactions, currentMonth]);

  const incomeVsExpensesYearlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Todos os 12 meses do ano atual
    const yearlyMonths = [];
    for (let m = 1; m <= 12; m++) {
      yearlyMonths.push(`${currentYear}-${String(m).padStart(2, '0')}`);
    }

    return yearlyMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      // Receitas: APENAS transactions (tipo income)
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas: APENAS transactions (tipo expense)
      const monthExpense = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Aportes/Investimentos: APENAS transactions (tipo investment)
      const monthInvestment = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'investment')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: monthExpense,
        investment: monthInvestment,
      };
    });
  }, [transactions, currentMonth]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    const [year, month, day] = transaction.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type,
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let amount = parseFloat(formData.amount);
    if (formData.type === "debit" || formData.type === "investment") {
      amount = -Math.abs(amount);
    } else {
      amount = Math.abs(amount);
    }

    const dateString = formData.date.toISOString().split("T")[0];

    const transactionData = {
      id: editingTransaction?.id || Date.now(),
      description: formData.description,
      amount: amount,
      type: formData.type,
      date: dateString,
    };

    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id ? transactionData : t
        )
      );
    } else {
      setTransactions([transactionData, ...transactions]);
    }

    setModalOpen(false);
    setFormData({
      description: "",
      amount: "",
      type: "debit",
      date: new Date(),
    });
  };

  if (loading) {
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
                : `${currentMonthIncomes.length} receita(s)`
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
          monthlyData={incomeVsExpensesDailyData}
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


      {/* Dialog de editar transação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Salário, Compra de mercado..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}