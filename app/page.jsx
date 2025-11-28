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

// Novos componentes de análise
import FinancialHealthScore from "../src/components/dashboard/FinancialHealthScore";
import MonthEndProjection from "../src/components/dashboard/MonthEndProjection";
import RunwayCard from "../src/components/dashboard/RunwayCard";
import BudgetRule503020 from "../src/components/dashboard/BudgetRule503020";
import CategoryBreakdownCard from "../src/components/dashboard/CategoryBreakdownCard";
import IncomeVsExpensesChart from "../src/components/dashboard/IncomeVsExpensesChart";

// Funções de análise
import {
  getPreviousMonth,
  calculateMonthData,
  calculateHealthScore,
  generateAlerts,
  calculateMonthEndProjection,
  calculateExpensesByCategory,
  calculateBudgetRule503020,
} from "../src/utils/dashboardAnalytics";

/**
 * Página Dashboard - Visão geral do controle financeiro com análises inteligentes
 * Exibe resumo mensal, análises comparativas, projeções e insights acionáveis
 */
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
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
          categoriesRes,
          assetTypesRes,
          transactionTypesRes,
          transactionsRes,
          targetsRes,
          assetsRes,
        ] = await Promise.all([
          fetchData("/api/expenses"),
          fetchData("/api/categories"),
          fetchData("/api/assetTypes"),
          fetchData("/api/transactionTypes"),
          fetchData("/api/transactions"),
          fetchData("/api/targets"),
          fetchData("/api/assets"),
        ]);

        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
        setAssetTypes(assetTypesRes.data);
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

  // Mês atual para filtros
  const currentMonth = "2025-11";
  const previousMonth = getPreviousMonth(currentMonth);

  // Calcular dados dos meses atual e anterior
  const currentMonthExpenses = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
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

  // Calcular score de saúde financeira
  const { score, breakdown } = useMemo(() =>
    calculateHealthScore(currentMonthData, assets, avgMonthlyExpenses),
    [currentMonthData, assets, avgMonthlyExpenses]
  );

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

    return sorted.slice(0, 10);
  }, [transactions, currentMonth]);

  // Preparar dados para CategoryBreakdownCard - Receitas por Categoria
  const incomeByCategory = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth) && t.type === 'credit'
    );

    const grouped = currentMonthTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.category || 'Outros';
      const existing = acc.find(item => item.name === categoryName);

      if (existing) {
        existing.value += Math.abs(transaction.amount);
      } else {
        const category = categories.find(c => c.name === categoryName || c.id === categoryName.toLowerCase());
        acc.push({
          name: categoryName,
          value: Math.abs(transaction.amount),
          color: category?.color || "#10b981",
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

  // Preparar dados para IncomeVsExpensesChart - Evolução ao longo do mês
  const incomeVsExpensesData = useMemo(() => {
    // Agrupar transações por dia do mês atual
    const dailyData = {};

    // Processar receitas
    transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'credit')
      .forEach(t => {
        const day = t.date.split('-')[2];
        if (!dailyData[day]) {
          dailyData[day] = { date: day, income: 0, expense: 0 };
        }
        dailyData[day].income += Math.abs(t.amount);
      });

    // Processar despesas
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
        const assetType = assetTypes.find((t) => t.name === asset.type);
        acc.push({
          name: asset.type,
          value: asset.value,
          color: assetType?.color || "#64748b",
        });
      }
      return acc;
    }, []),
  [assets, assetTypes]);

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

  const getTransactionTypeByInternalName = (type) => {
    const typeMap = {
      credit: 1,
      debit: 2,
      investment: 3,
    };
    const typeId = typeMap[type];
    return transactionTypes.find((t) => t.id === typeId);
  };

  const transactionColumns = [
    {
      key: "description",
      label: "Descrição",
      sortable: true,
    },
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (row) => {
        const transactionType = getTransactionTypeByInternalName(row.type);
        const iconMap = {
          credit: ArrowUpRight,
          debit: ArrowDownRight,
          investment: TrendingUp,
        };
        const Icon = iconMap[row.type] || ArrowDownRight;

        return (
          <Badge
            variant="default"
            style={{
              backgroundColor: transactionType?.color || "#64748b",
              color: "white",
            }}
          >
            <span className="flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {transactionType?.name || "Desconhecido"}
            </span>
          </Badge>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span>
          {formatCurrency(Math.abs(row.amount))}
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

      {/* NOVO: Linha superior com Score e Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialHealthScore score={score} breakdown={breakdown} />
        <MonthEndProjection data={projectionData} />
      </div>

      {/* Cards de resumo tradicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        <StatsCard
          icon={ArrowUpRight}
          label="Créditos Mensais"
          value={formatCurrency(currentMonthData.credits)}
          iconColor="green"
          valueColor="text-green-600"
        />
        <StatsCard
          icon={TrendingDown}
          label="Despesas Mensais"
          value={formatCurrency(currentMonthData.expenses)}
          subtitle={
            currentMonthData.debits > currentMonthData.expenses
              ? `⚠️ Acima do previsto (+${formatCurrency(currentMonthData.debits - currentMonthData.expenses)})`
              : currentMonthData.debits < currentMonthData.expenses
              ? `✓ Abaixo do previsto (-${formatCurrency(currentMonthData.expenses - currentMonthData.debits)})`
              : `✓ Igual ao previsto`
          }
          iconColor="red"
          valueColor="text-red-600"
        />
        <StatsCard
          icon={Target}
          label="Aportes Mensais"
          value={formatCurrency(currentMonthData.investments)}
          iconColor="blue"
          valueColor="text-blue-600"
        />
        <StatsCard
          icon={Wallet}
          label="Saldo Disponível"
          value={formatCurrency(currentMonthData.balance)}
          subtitle="Créditos - Despesas - Aportes"
          iconColor={currentMonthData.balance >= 0 ? "blue" : "red"}
          valueColor={currentMonthData.balance >= 0 ? "text-blue-600" : "text-red-600"}
        />
        <StatsCard
          icon={PiggyBank}
          label="Patrimônio Total"
          value={formatCurrency(totalAssets)}
          subtitle={`${assets.length} ativo(s)`}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* NOVO: Métricas de runway e regra 50/30/20 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RunwayCard data={runwayData} />
        <BudgetRule503020 data={budgetRule503020Data} />
      </div>

      {/* NOVO: Gráfico de Receitas x Despesas com métricas */}
      <IncomeVsExpensesChart
        data={incomeVsExpensesData}
        period="PERÍODO ATUAL"
      />

      {/* NOVO: Card de Categorias (Receitas/Despesas) */}
      <CategoryBreakdownCard
        incomeData={incomeByCategory}
        expenseData={currentMonthExpensesByCategory}
      />

      {/* Tabela de transações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Transações Recentes ({recentTransactions.length})
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
              <Label>Tipo de Transação</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("type", "credit")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === "credit"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ArrowUpRight className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    Crédito
                  </span>
                  <span className="block text-xs text-gray-500">Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("type", "debit")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === "debit"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ArrowDownRight className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    Débito
                  </span>
                  <span className="block text-xs text-gray-500">Saída</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("type", "investment")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === "investment"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    Aporte
                  </span>
                  <span className="block text-xs text-gray-500">Aplicação</span>
                </button>
              </div>
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