"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PageHeader from "../src/components/PageHeader";
import StatsCard from "../src/components/StatsCard";
import { Card, CardContent } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
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
import { fetchData, formatCurrency, formatDate } from "../src/utils";
import { Wallet, TrendingDown, ArrowUpRight, Target, PiggyBank, ArrowDownRight, TrendingUp } from "lucide-react";

// Componentes de análise do dashboard
import MonthEndProjection from "../src/components/dashboard/MonthEndProjection";
import RunwayCard from "../src/components/dashboard/RunwayCard";
import BudgetRule503020 from "../src/components/dashboard/BudgetRule503020";
import CategoryBreakdownCard from "../src/components/dashboard/CategoryBreakdownCard";
import IncomeVsExpensesChart from "../src/components/dashboard/IncomeVsExpensesChart";
import FinancialHealthCard from "../src/components/dashboard/FinancialHealthCard";
import SavingsRateCard from "../src/components/dashboard/SavingsRateCard";
import DailyBudgetCard from "../src/components/dashboard/DailyBudgetCard";
import GoalsProgressCard from "../src/components/dashboard/GoalsProgressCard";
import AlertsSection from "../src/components/dashboard/AlertsSection";

// Funções de análise
import {
  getPreviousMonth,
  calculateMonthData,
  generateAlerts,
  calculateMonthEndProjection,
  calculateExpensesByCategory,
  calculateBudgetRule503020,
  calculateHealthScore,
  calculateSavingsRate,
  calculateDailyBudget,
} from "../src/utils/dashboardAnalytics";

/**
 * Página Dashboard - Visão geral do controle financeiro com análises inteligentes
 * Exibe resumo mensal, análises comparativas, projeções e insights acionáveis
 */
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [targets, setTargets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExpenseIndex, setActiveExpenseIndex] = useState(null);
  const [activeInvestmentIndex, setActiveInvestmentIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "debit",
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          expensesRes,
          incomesRes,
          categoriesRes,
          transactionTypesRes,
          transactionsRes,
          targetsRes,
          assetsRes,
        ] = await Promise.all([
          fetchData("/api/expenses"),
          fetchData("/api/incomes"),
          fetchData("/api/categories"),
          fetchData("/api/transactionTypes"),
          fetchData("/api/transactions"),
          fetchData("/api/targets"),
          fetchData("/api/assets"),
        ]);

        setExpenses(expensesRes.data);
        setIncomes(incomesRes.data);
        setCategories(categoriesRes.data);
        setTransactionTypes(transactionTypesRes.data);
        setTransactions(transactionsRes.data);
        setTargets(
          targetsRes.data.filter((t) => t.status === "in_progress").slice(0, 2)
        );
        setAssets(assetsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mês atual para filtros - dinamicamente calculado
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

  const previousMonthExpenses = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(previousMonth)),
    [expenses, previousMonth]
  );

  const currentMonthData = useMemo(() =>
    calculateMonthData(transactions, currentMonthExpenses, currentMonth),
    [transactions, currentMonthExpenses, currentMonth]
  );

  const previousMonthData = useMemo(() =>
    calculateMonthData(transactions, previousMonthExpenses, previousMonth),
    [transactions, previousMonthExpenses, previousMonth]
  );

  // Calcular projeção de fim de mês
  const projectionData = useMemo(() =>
    calculateMonthEndProjection(transactions, expenses, currentMonth),
    [transactions, expenses, currentMonth]
  );

  // Calcular despesas por categoria com variação
  const expensesByCategoryWithChange = useMemo(() =>
    calculateExpensesByCategory(currentMonthExpenses, previousMonthExpenses, categories),
    [currentMonthExpenses, previousMonthExpenses, categories]
  );

  // Calcular patrimônio total e métricas
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calcular média de despesas mensais (últimos 3 meses)
  const avgMonthlyExpenses = useMemo(() => {
    const months = [currentMonth, previousMonth, getPreviousMonth(previousMonth)];
    let totalExpenses = 0;
    let count = 0;

    months.forEach(month => {
      const monthExpenses = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);

      if (monthExpenses > 0) {
        totalExpenses += monthExpenses;
        count++;
      }
    });

    return count > 0 ? totalExpenses / count : currentMonthData.expenses;
  }, [expenses, currentMonth, previousMonth, currentMonthData.expenses]);

  // Gerar alertas inteligentes
  const alerts = useMemo(() =>
    generateAlerts(
      currentMonthData,
      previousMonthData,
      projectionData,
      expensesByCategoryWithChange,
      categories
    ),
    [currentMonthData, previousMonthData, projectionData, expensesByCategoryWithChange, categories]
  );

  // Calcular runway financeiro
  const runwayMonths = avgMonthlyExpenses > 0 ? totalAssets / avgMonthlyExpenses : 0;
  const runwayData = {
    totalAssets: totalAssets,
    avgMonthlyExpenses: avgMonthlyExpenses,
    runwayMonths: runwayMonths,
  };

  // Calcular dados da regra 50/30/20
  const budgetRule503020Data = useMemo(() =>
    calculateBudgetRule503020(currentMonthExpenses, currentMonthData, categories),
    [currentMonthExpenses, currentMonthData, categories]
  );

  // Calcular Health Score
  const healthScoreData = useMemo(() =>
    calculateHealthScore(currentMonthData, assets, avgMonthlyExpenses),
    [currentMonthData, assets, avgMonthlyExpenses]
  );

  // Calcular Taxa de Poupança
  const savingsRateData = useMemo(() =>
    calculateSavingsRate(currentMonthData, 20), // Meta de 20%
    [currentMonthData]
  );

  // Calcular Orçamento Diário
  const dailyBudgetData = useMemo(() =>
    calculateDailyBudget(currentMonthData, projectionData.daysRemaining, 20),
    [currentMonthData, projectionData.daysRemaining]
  );

  // Calcular comparações mês a mês para os cards
  const incomeComparison = useMemo(() => {
    const currentIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const previousIncome = incomes.filter(i => i.date.startsWith(previousMonth)).reduce((sum, i) => sum + i.amount, 0);
    const change = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    return { current: currentIncome, previous: previousIncome, change };
  }, [currentMonthIncomes, incomes, previousMonth]);

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

    // Retornar todas as transações do mês - o componente Table controla a paginação
    return sorted;
  }, [transactions, currentMonth]);

  // Preparar dados para CategoryBreakdownCard - Receitas por Categoria
  // Incluindo receitas (income) e aportes (investment)
  const incomeByCategory = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth) &&
      (t.type_internal_name === 'income' || t.type_internal_name === 'investment')
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
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [transactions, currentMonth, categories]);

  // Preparar dados para CategoryBreakdownCard - Despesas por Categoria do mês atual
  const currentMonthExpensesByCategory = useMemo(() => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

    const grouped = monthExpenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        const category = categories.find(c =>
          c.name === expense.category || c.id === expense.category.toLowerCase()
        );
        acc.push({
          name: expense.category,
          value: expense.amount,
          color: category?.color || "#6366f1",
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [expenses, currentMonth, categories]);

  // Preparar dados DIÁRIOS para IncomeVsExpensesChart - Evolução ao longo do mês
  const incomeVsExpensesDailyData = useMemo(() => {
    // Agrupar transações por dia do mês atual
    const dailyData = {};

    // Processar receitas
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'income')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].income += Math.abs(t.amount);
      });

    // Processar despesas (incluindo de expenses e transactions com tipo expense)
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'expense')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].expense += Math.abs(t.amount);
      });

    expenses
      .filter(e => e.date.startsWith(currentMonth))
      .forEach(e => {
        const day = e.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].expense += e.amount;
      });

    // Converter para array e ordenar por dia
    return Object.values(dailyData)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .map(d => ({
        ...d,
        date: `${d.date}`,
      }));
  }, [transactions, expenses, currentMonth]);

  // Preparar dados MENSAIS para IncomeVsExpensesChart - Comparação de últimos meses
  const incomeVsExpensesMonthlyData = useMemo(() => {
    // Criar lista dos últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
      let tempMonth = currentMonth;
      for (let j = 0; j < i; j++) {
        tempMonth = getPreviousMonth(tempMonth);
      }
      months.push(tempMonth);
    }

    // Calcular receitas e despesas para cada mês
    return months.map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'short' });

      // Receitas do mês
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas do mês (transactions + expenses)
      const monthExpenseFromTransactions = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const monthExpenseFromExpenses = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);

      const totalExpense = monthExpenseFromTransactions + monthExpenseFromExpenses;

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: totalExpense,
      };
    });
  }, [transactions, expenses, currentMonth]);

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

  // OTIMIZAÇÃO: Memoizar cálculos pesados para evitar recálculo em cada render
  // Preparar dados para gráfico de despesas por categoria
  const expensesByCategory = useMemo(() =>
    expenses.reduce((acc, expense) => {
      const existing = acc.find((item) => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        const category = categories.find(
          (c) =>
            c.name === expense.category || c.id === expense.category.toLowerCase()
        );
        acc.push({
          name: expense.category,
          value: expense.amount,
          color: category?.color || "#64748b",
        });
      }
      return acc;
    }, []),
  [expenses, categories]);

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + e.amount, 0),
  [expenses]);

  // Agrupar patrimônio e ativos por tipo
  const assetsByType = useMemo(() =>
    assets.reduce((acc, asset) => {
      const existing = acc.find((item) => item.name === asset.type);
      if (existing) {
        existing.value += asset.value;
      } else {
        // Usar type_color que já vem enriquecido do enrichAssets
        acc.push({
          name: asset.type,
          value: asset.value,
          color: asset.type_color || "#64748b",
        });
      }
      return acc;
    }, []),
  [assets]);

  const totalInvestmentsValue = assets.reduce((sum, a) => sum + a.value, 0);

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
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.category_color }}
          />
          <span className="text-sm font-medium text-gray-900">
            {row.category_name}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span className={row.amount >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral inteligente do seu controle financeiro"
      />

      {/* 🚨 ALERTAS CRÍTICOS */}
      {alerts.length > 0 && <AlertsSection alerts={alerts} />}

      {/* 📊 VISÃO GERAL - Cards Principais de Tomada de Decisão */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-w-0">
          <FinancialHealthCard
            score={healthScoreData.score}
            breakdown={healthScoreData.breakdown}
          />
          <SavingsRateCard
            savingsRate={savingsRateData.savingsRate}
            goal={savingsRateData.goal}
            amountToGoal={savingsRateData.amountToGoal}
            income={savingsRateData.totalIncome}
          />
          <DailyBudgetCard
            availableBalance={dailyBudgetData.availableBalance}
            daysRemaining={dailyBudgetData.daysRemaining}
            savingsGoal={dailyBudgetData.savingsGoal}
          />
          <StatsCard
            icon={Wallet}
            label="Saldo Disponível"
            value={formatCurrency(currentMonthData.balance)}
            subtitle={`${formatCurrency(dailyBudgetData.dailyBudget)}/dia pelos próximos ${dailyBudgetData.daysRemaining} dias`}
            iconColor={currentMonthData.balance >= 0 ? "blue" : "red"}
            valueColor={currentMonthData.balance >= 0 ? "text-blue-600" : "text-red-600"}
          />
        </div>
      </div>

      {/* 💰 ANÁLISE MENSAL - Receitas, Despesas e Aportes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Análise Mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
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
            valueColor="text-green-600"
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
            valueColor="text-red-600"
          />
          <StatsCard
            icon={Target}
            label="Aportes Mensais"
            value={formatCurrency(currentMonthData.investments)}
            subtitle={`${((currentMonthData.investments / incomeComparison.current) * 100).toFixed(1)}% da receita`}
            iconColor="blue"
            valueColor="text-blue-600"
          />
        </div>
      </div>

      {/* 🎯 PROGRESSO DE METAS E PATRIMÔNIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsProgressCard goals={targets} />
        <StatsCard
          icon={PiggyBank}
          label="Patrimônio Total"
          value={formatCurrency(totalAssets)}
          subtitle={`Runway: ${runwayMonths.toFixed(1)} meses • ${assets.length} ativo(s)`}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* 📈 PROJEÇÃO E ANÁLISES DETALHADAS */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Análises e Projeções</h2>
        <div className="space-y-6">
          <MonthEndProjection data={projectionData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RunwayCard data={runwayData} />
            <BudgetRule503020 data={budgetRule503020Data} />
          </div>

          <IncomeVsExpensesChart
            dailyData={incomeVsExpensesDailyData}
            monthlyData={incomeVsExpensesMonthlyData}
            period="PERÍODO ATUAL"
          />

          <CategoryBreakdownCard
            incomeData={incomeByCategory}
            expenseData={currentMonthExpensesByCategory}
          />
        </div>
      </div>

      {/* Tabela de transações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Transações Recentes
            </h2>
            <Link
              href="/transacoes"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Ver todas as transações →
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Nenhuma transação encontrada.
              </p>
            </div>
          ) : (
            <Table
              columns={transactionColumns}
              data={recentTransactions}
              pageSize={10}
              onRowClick={handleEditTransaction}
            />
          )}
        </CardContent>
      </Card>

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