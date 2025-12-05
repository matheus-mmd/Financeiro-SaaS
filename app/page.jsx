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
import { fetchData, formatCurrency, formatDate } from "../src/utils";
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
    const loadData = async () => {
      try {
        const [
          expensesRes,
          incomesRes,
          categoriesRes,
          transactionsRes,
          assetsRes,
        ] = await Promise.all([
          fetchData("/api/expenses"),
          fetchData("/api/incomes"),
          fetchData("/api/categories"),
          fetchData("/api/transactions"),
          fetchData("/api/assets"),
        ]);

        setExpenses(expensesRes.data);
        setIncomes(incomesRes.data);
        setCategories(categoriesRes.data);
        setTransactions(transactionsRes.data);
        setAssets(assetsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
    calculateMonthData(transactions, currentMonthExpenses, currentMonth),
    [transactions, currentMonthExpenses, currentMonth]
  );

  // Calcular patrimônio total
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

    return sorted;
  }, [transactions, currentMonth]);

  // Preparar dados para CategoryBreakdownCard - Receitas por Categoria
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
          icon: category?.icon || transaction.category_icon || "Tag",
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
          icon: category?.icon || expense.category_icon || "Tag",
        });
      }
      return acc;
    }, []);

    return grouped;
  }, [expenses, currentMonth, categories]);

  // Preparar dados DIÁRIOS para IncomeVsExpensesChart
  const incomeVsExpensesDailyData = useMemo(() => {
    const dailyData = {};

    // Receitas vêm de transactions com type_internal_name === 'income'
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type_internal_name === 'income')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].income += Math.abs(t.amount);
      });

    // Despesas vêm APENAS da tabela expenses (evita duplicação)
    expenses
      .filter(e => e.date.startsWith(currentMonth))
      .forEach(e => {
        const day = e.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].expense += e.amount;
      });

    return Object.values(dailyData)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .map(d => ({
        ...d,
        date: `${d.date}`,
      }));
  }, [transactions, expenses, currentMonth]);

  // Preparar dados MENSAIS para IncomeVsExpensesChart
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

      // Receitas vêm de transactions com type_internal_name === 'income'
      const monthIncome = transactions
        .filter(t => t.date.startsWith(month) && t.type_internal_name === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Despesas vêm APENAS da tabela expenses (evita duplicação)
      const monthExpense = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        date: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income: monthIncome,
        expense: monthExpense,
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
          dailyData={incomeVsExpensesDailyData}
          monthlyData={incomeVsExpensesMonthlyData}
        />

        <CategoryBreakdownCard
          incomeData={incomeByCategory}
          expenseData={currentMonthExpensesByCategory}
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