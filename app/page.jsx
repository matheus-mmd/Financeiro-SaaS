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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../src/components/ui/dialog";
import Spinner from "../src/components/Spinner";
import DatePicker from "../src/components/DatePicker";
import Table from "../src/components/Table";
import DoughnutChart from "../src/components/charts/DoughnutChart";
import LineChart from "../src/components/charts/LineChart";
import ProgressBar from "../src/components/ProgressBar";
import { fetchMock, formatCurrency, formatDate } from "../src/utils/mockApi";
import { Wallet, TrendingDown, ArrowUpRight, Target, Eye, DollarSign, PiggyBank, ArrowDownRight, TrendingUp } from "lucide-react";

/**
 * Página Dashboard - Visão geral do controle financeiro
 * Exibe resumo mensal, gráficos de despesas e evolução, transações e metas
 */
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
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
          transactionsRes,
          targetsRes,
          assetsRes,
        ] = await Promise.all([
          fetchMock("/api/expenses"),
          fetchMock("/api/categories"),
          fetchMock("/api/transactions"),
          fetchMock("/api/targets"),
          fetchMock("/api/assets"),
        ]);

        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
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

  // Filtrar e ordenar transações do mês atual para a tabela
  const recentTransactions = useMemo(() => {
    // Filtrar apenas transações do mês atual
    const currentMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );

    // Ordenar por data (mais recente primeiro) e depois por valor (maior primeiro)
    const sorted = [...currentMonthTransactions].sort((a, b) => {
      // Primeiro ordenar por data (descendente - mais recente primeiro)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      // Se as datas forem iguais, ordenar por valor (maior primeiro)
      return Math.abs(b.amount) - Math.abs(a.amount);
    });

    // Limitar a 10 itens
    return sorted.slice(0, 10);
  }, [transactions, currentMonth]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    // Converter string de data para Date object
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

    // Aportes e débitos são negativos (saída), créditos são positivos (entrada)
    let amount = parseFloat(formData.amount);
    if (formData.type === "debit" || formData.type === "investment") {
      amount = -Math.abs(amount);
    } else {
      amount = Math.abs(amount);
    }

    // Converter Date object para string YYYY-MM-DD
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
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calcular Despesas Mensais do mês atual
  const monthly_expenses_total = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  // Calcular total de créditos do mês atual
  const totalCredits = transactions
    .filter((t) => t.type === "credit" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular total de débitos do mês atual
  const totalDebits = transactions
    .filter((t) => t.type === "debit" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calcular total de investimentos do mês atual
  const totalInvestments = transactions
    .filter((t) => t.type === "investment" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calcular Saldo Disponível: Créditos - Despesas - Aportes
  const availableBalance = totalCredits - monthly_expenses_total - totalInvestments;

  // Calcular Patrimônio Total (soma de todos os assets)
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calcular evolução do saldo dinamicamente baseado nas transações
  const calculateBalanceEvolution = () => {
    const INITIAL_BALANCE = 12500; // Saldo inicial em Junho
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Agrupar transações por mês
    const transactionsByMonth = {};
    transactions.forEach((t) => {
      const yearMonth = t.date.substring(0, 7); // "2025-06"
      if (!transactionsByMonth[yearMonth]) {
        transactionsByMonth[yearMonth] = { credits: 0, debits: 0, investments: 0 };
      }

      if (t.type === "credit") {
        transactionsByMonth[yearMonth].credits += t.amount;
      } else if (t.type === "debit") {
        transactionsByMonth[yearMonth].debits += Math.abs(t.amount);
      } else if (t.type === "investment") {
        transactionsByMonth[yearMonth].investments += t.amount;
      }
    });

    // Calcular saldo acumulado mês a mês
    let accumulatedBalance = INITIAL_BALANCE;
    const evolution = [];

    // Ordenar meses
    const sortedMonths = Object.keys(transactionsByMonth).sort();

    sortedMonths.forEach((yearMonth) => {
      const [year, month] = yearMonth.split("-");
      const monthIndex = parseInt(month) - 1;
      const monthData = transactionsByMonth[yearMonth];

      // Calcular variação do mês: receitas - despesas - investimentos
      const monthlyChange = monthData.credits - monthData.debits - monthData.investments;
      accumulatedBalance += monthlyChange;

      evolution.push({
        date: monthNames[monthIndex],
        value: Math.round(accumulatedBalance)
      });
    });

    return evolution;
  };

  const calculatedBalanceEvolution = calculateBalanceEvolution();

  // Calcular porcentagem de crescimento do saldo (baseado em evolução calculada)
  const balanceGrowthPercentage = (() => {
    if (calculatedBalanceEvolution.length < 2) return 0;
    const firstValue = calculatedBalanceEvolution[0].value;
    const lastValue = calculatedBalanceEvolution[calculatedBalanceEvolution.length - 1].value;
    return ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  })();

  // Preparar dados para gráfico de despesas por categoria
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      // Buscar cor da categoria
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
  }, []);

  // Calcular total de despesas para porcentagens
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Agrupar investimentos por tipo
  const assetsByType = assets.reduce((acc, asset) => {
    const existing = acc.find((item) => item.name === asset.type);
    if (existing) {
      existing.value += asset.value;
    } else {
      // Cores para cada tipo de investimento
      const typeColors = {
        Poupança: "#22c55e",
        CDB: "#3b82f6",
        "Tesouro Direto": "#f59e0b",
        Ações: "#ef4444",
        Fundos: "#8b5cf6",
        Criptomoedas: "#ec4899",
        Outros: "#64748b",
      };
      acc.push({
        name: asset.type,
        value: asset.value,
        color: typeColors[asset.type] || "#64748b",
      });
    }
    return acc;
  }, []);

  // Calcular total de investimentos para porcentagens
  const totalInvestmentsValue = assets.reduce((sum, a) => sum + a.value, 0);

  // Configuração de colunas da tabela de transações
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
        if (row.type === "credit") {
          return (
            <Badge variant="default" className="bg-green-500">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Crédito
              </span>
            </Badge>
          );
        } else if (row.type === "investment") {
          return (
            <Badge variant="default" className="bg-blue-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Aporte
              </span>
            </Badge>
          );
        } else {
          return (
            <Badge variant="destructive">
              <span className="flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                Débito
              </span>
            </Badge>
          );
        }
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
        description="Visão geral do seu controle financeiro"
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        <StatsCard
          icon={ArrowUpRight}
          label="Créditos Mensais"
          value={formatCurrency(totalCredits)}
          iconColor="green"
          valueColor="text-green-600"
        />
        <StatsCard
          icon={TrendingDown}
          label="Despesas Mensais"
          value={formatCurrency(monthly_expenses_total)}
          subtitle={
            totalDebits > monthly_expenses_total
              ? `⚠️ Acima do previsto (+${formatCurrency(totalDebits - monthly_expenses_total)})`
              : totalDebits < monthly_expenses_total
              ? `✓ Abaixo do previsto (-${formatCurrency(monthly_expenses_total - totalDebits)})`
              : `✓ Igual ao previsto`
          }
          iconColor="red"
          valueColor="text-red-600"
        />
        <StatsCard
          icon={Target}
          label="Aportes Mensais"
          value={formatCurrency(totalInvestments)}
          iconColor="blue"
          valueColor="text-blue-600"
        />
        <StatsCard
          icon={Wallet}
          label="Saldo Disponível"
          value={formatCurrency(availableBalance)}
          subtitle="Créditos - Despesas - Aportes"
          iconColor={availableBalance >= 0 ? "blue" : "red"}
          valueColor={availableBalance >= 0 ? "text-blue-600" : "text-red-600"}
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

      {/* Gráfico de Evolução do Saldo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Evolução do Saldo
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Últimos {calculatedBalanceEvolution.length} meses</span>
              <div className={`flex items-center gap-1 font-semibold ${balanceGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight className="w-4 h-4" />
                <span>{balanceGrowthPercentage >= 0 ? '+' : ''}{balanceGrowthPercentage}%</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] sm:h-[350px]">
            <LineChart data={calculatedBalanceEvolution} />
          </div>
        </CardContent>
      </Card>

      {/* Listas de Despesas e Patrimônio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por categoria com gráfico e lista */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Despesas por Categoria
            </h2>

            {/* Gráfico de Pizza */}
            <div className="h-[300px] mb-6">
              <DoughnutChart
                data={expensesByCategory}
                showLegend={false}
                externalActiveIndex={activeExpenseIndex}
                onIndexChange={setActiveExpenseIndex}
              />
            </div>

            {/* Lista de categorias */}
            <div className="space-y-3">
              {expensesByCategory
                .sort((a, b) => b.value - a.value)
                .map((item, index) => {
                  const category = categories.find(
                    (c) =>
                      c.name === item.name || c.id === item.name.toLowerCase()
                  );
                  const percentage = ((item.value / totalExpenses) * 100).toFixed(1);
                  const isActive = activeExpenseIndex === index;

                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gray-100 shadow-sm scale-105 ring-2 ring-gray-200'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                      onMouseEnter={() => setActiveExpenseIndex(index)}
                      onMouseLeave={() => setActiveExpenseIndex(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full transition-all duration-200 ${
                            isActive ? 'shadow-md scale-125' : 'shadow-sm'
                          }`}
                          style={{
                            backgroundColor: category?.color || "#64748b",
                          }}
                        />
                        <span className={`font-medium transition-colors duration-200 ${
                          isActive ? 'text-gray-900 font-semibold' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold transition-all duration-200 ${
                          isActive ? 'text-gray-900 scale-110' : 'text-gray-500'
                        }`}>
                          {percentage}%
                        </span>
                        <span className={`font-semibold text-red-600 transition-all duration-200 ${
                          isActive ? 'scale-105' : ''
                        }`}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Patrimônio por tipo com gráfico e lista */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Patrimônio por Tipo
            </h2>

            {/* Gráfico de Pizza */}
            <div className="h-[300px] mb-6">
              <DoughnutChart
                data={assetsByType}
                showLegend={false}
                externalActiveIndex={activeInvestmentIndex}
                onIndexChange={setActiveInvestmentIndex}
              />
            </div>

            {/* Lista de investimentos */}
            <div className="space-y-3">
              {assetsByType
                .sort((a, b) => b.value - a.value)
                .map((item, index) => {
                  const percentage = (
                    (item.value / totalInvestmentsValue) *
                    100
                  ).toFixed(1);
                  const isActive = activeInvestmentIndex === index;

                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gray-100 shadow-sm scale-105 ring-2 ring-gray-200'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                      onMouseEnter={() => setActiveInvestmentIndex(index)}
                      onMouseLeave={() => setActiveInvestmentIndex(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full transition-all duration-200 ${
                            isActive ? 'shadow-md scale-125' : 'shadow-sm'
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`font-medium transition-colors duration-200 ${
                          isActive ? 'text-gray-900 font-semibold' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold transition-all duration-200 ${
                          isActive ? 'text-gray-900 scale-110' : 'text-gray-500'
                        }`}>
                          {percentage}%
                        </span>
                        <span className={`font-semibold text-green-600 transition-all duration-200 ${
                          isActive ? 'scale-105' : ''
                        }`}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

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