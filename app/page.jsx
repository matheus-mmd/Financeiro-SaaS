"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "../src/components/PageHeader";
import StatsCard from "../src/components/StatsCard";
import { Card, CardContent } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import Spinner from "../src/components/Spinner";
import Table from "../src/components/Table";
import DoughnutChart from "../src/components/charts/DoughnutChart";
import LineChart from "../src/components/charts/LineChart";
import ProgressBar from "../src/components/ProgressBar";
import { fetchMock, formatCurrency, formatDate } from "../src/utils/mockApi";
import { Wallet, TrendingDown, ArrowUpRight, Target, Eye, DollarSign, PiggyBank } from "lucide-react";

/**
 * Página Dashboard - Visão geral do controle financeiro
 * Exibe resumo mensal, gráficos de despesas e evolução, transações e metas
 */
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [targets, setTargets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          userRes,
          expensesRes,
          categoriesRes,
          transactionsRes,
          targetsRes,
          assetsRes,
          budgetRes,
        ] = await Promise.all([
          fetchMock("/api/user"),
          fetchMock("/api/expenses"),
          fetchMock("/api/categories"),
          fetchMock("/api/transactions"),
          fetchMock("/api/targets"),
          fetchMock("/api/assets"),
          fetchMock("/api/budget"),
        ]);

        setUser(userRes.data);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
        setTransactions(transactionsRes.data);
        setTargets(
          targetsRes.data.filter((t) => t.status === "in_progress").slice(0, 2)
        );
        setAssets(assetsRes.data);
        setBudget(budgetRes.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calcular Despesas Mensais do mês atual
  const currentMonth = "2025-11";
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

  // Calcular Saldo Disponível: Créditos - Despesas - Investimentos
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
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "description",
      label: "Descrição",
      sortable: true,
    },
    {
      key: "type",
      label: "Tipo",
      render: (row) => (
        <Badge variant={row.type === "credit" ? "default" : "destructive"}>
          {row.type === "credit" ? "Crédito" : "Débito"}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.type === "credit"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {formatCurrency(Math.abs(row.amount))}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <Link
          href="/transacoes"
          className="p-1 hover:bg-gray-100 rounded transition-colors inline-block"
          aria-label="Ver transação"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Link>
      ),
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
          label="Total de Créditos"
          value={formatCurrency(totalCredits)}
          iconColor="green"
          valueColor="text-green-600"
        />
        <StatsCard
          icon={TrendingDown}
          label="Despesas Mensais"
          value={formatCurrency(monthly_expenses_total)}
          subtitle={
            budget && monthly_expenses_total > budget.monthly_expenses_limit
              ? `⚠️ Acima do previsto (${formatCurrency(budget.monthly_expenses_limit)})`
              : budget
              ? `✓ Dentro do previsto (${formatCurrency(budget.monthly_expenses_limit)})`
              : ""
          }
          iconColor="red"
          valueColor="text-red-600"
        />
        <StatsCard
          icon={Wallet}
          label="Saldo Disponível"
          value={formatCurrency(availableBalance)}
          subtitle="Créditos - Despesas - Investimentos"
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
        <StatsCard
          icon={Target}
          label="Investimentos Mensais"
          value={formatCurrency(totalInvestments)}
          iconColor="blue"
          valueColor="text-blue-600"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de despesas por categoria */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Despesas por Categoria
            </h2>
            <div className="h-[300px] sm:h-[350px]">
              <DoughnutChart data={expensesByCategory} />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de evolução de saldo */}
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
      </div>

      {/* Listas de Despesas e Investimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de despesas por categoria */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Despesas por Categoria
            </h2>
            <div className="space-y-3">
              {expensesByCategory
                .sort((a, b) => b.value - a.value)
                .map((item) => {
                  const category = categories.find(
                    (c) =>
                      c.name === item.name || c.id === item.name.toLowerCase()
                  );
                  const percentage = ((item.value / totalExpenses) * 100).toFixed(1);

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: category?.color || "#64748b",
                          }}
                        />
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {percentage}%
                        </span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Lista de investimentos por tipo */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Investimentos por Tipo
            </h2>
            <div className="space-y-3">
              {assetsByType
                .sort((a, b) => b.value - a.value)
                .map((item) => {
                  const percentage = (
                    (item.value / totalInvestmentsValue) *
                    100
                  ).toFixed(1);

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {percentage}%
                        </span>
                        <span className="font-semibold text-green-600">
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

      {/* Ativos e Patrimônio */}
      {assets.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                Patrimônio e Ativos
              </h2>
              <Link
                href="/investimentos"
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-gray-500">{asset.type}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(asset.yield * 100).toFixed(2)}% a.m.
                    </Badge>
                  </div>
                  <p className="text-xl font-semibold text-purple-600">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metas em andamento (preview) */}
      {targets.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                Metas em Andamento
              </h2>
              <Link
                href="/metas"
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-4">
              {targets.map((target) => (
                <div key={target.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">
                      {target.title}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(target.progress)} /{" "}
                      {formatCurrency(target.goal)}
                    </span>
                  </div>
                  <ProgressBar progress={target.progress} goal={target.goal} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de transações */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transações Recentes
          </h2>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Nenhuma transação encontrada.
              </p>
            </div>
          ) : (
            <Table
              columns={transactionColumns}
              data={transactions}
              pageSize={5}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}