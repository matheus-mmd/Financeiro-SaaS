"use client";

import React, { useCallback, useEffect, lazy, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import DashboardSkeleton from "../../src/components/DashboardSkeleton";
import { formatCurrency } from "../../src/utils";
import { Wallet, TrendingDown, ArrowUpRight, PiggyBank, Coins, Heart, Percent, CalendarDays, Clock } from "lucide-react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDashboard } from "../../src/lib/supabase/hooks/useDashboard";
import { useSettings } from "../../src/lib/supabase/hooks/useSettings";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Button } from "../../src/components/ui/button";

// OTIMIZAÇÃO: Lazy load dos componentes pesados de gráficos
const CategoryBreakdownCard = lazy(() => import("../../src/components/dashboard/CategoryBreakdownCard"));
const IncomeVsExpensesChart = lazy(() => import("../../src/components/dashboard/IncomeVsExpensesChart"));

// Skeleton para os gráficos enquanto carregam
const ChartSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-sm">
    <CardContent className="p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-[400px] bg-gray-100 dark:bg-slate-800 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Formata data e hora para exibição DD/MM/YYYY às HH:MM
 */
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Página Dashboard - Visão geral do controle financeiro
 * OTIMIZADA: Usa hook useDashboard para centralizar lógica e reduzir cálculos no client
 */
export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [period, setPeriod] = useState('monthly');

  // Hook customizado que centraliza toda a lógica do dashboard
  const { loading, error, metrics, categoryData, chartData } = useDashboard();

  // Hook de settings com cache (mesmo comportamento da tela de Configuracoes)
  const {
    settings,
    loading: settingsLoading,
    subscriptionInfo,
    trialDaysRemaining,
  } = useSettings();

  const handleAuthFailure = useCallback(async () => {
    await signOut();
    router.replace('/');
  }, [router, signOut]);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  // Redirecionar para setup se não completou a configuração inicial
  useEffect(() => {
    if (!authLoading && user && profile && profile.setup_completed === false) {
      router.replace('/configurar-perfil');
    }
  }, [authLoading, user, profile, router]);

  // Tratar erro de autenticação
  useEffect(() => {
    if (error?.message === 'AUTH_REQUIRED') {
      handleAuthFailure();
    }
  }, [error, handleAuthFailure]);

  // Mostrar skeleton enquanto carregando
  if (!authLoading && !user) {
    return null;
  }

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  // Destructure metrics para facilitar o uso
  const {
    currentMonthData,
    currentMonthIncomeCount,
    totalAssets,
    healthScoreData,
    savingsRateData,
    dailyBudgetData,
    daysRemaining,
    incomeComparison,
  } = metrics;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 💎 STATUS DA ASSINATURA - Renderiza com skeleton se carregando */}
      <Card>
        <CardContent className="p-4">
          {settingsLoading && !settings ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 animate-pulse">
              <div className="p-3 bg-gray-200 dark:bg-slate-700 rounded-full w-12 h-12" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-48" />
              </div>
              <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded w-28" />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-700">
                  {subscriptionInfo?.label || "Carregando..."}
                </p>
                <p className="text-sm text-amber-600">
                  {subscriptionInfo?.expired
                    ? "Seu periodo de teste expirou"
                    : `Menos de ${trialDaysRemaining} dias restantes • Expira em ${formatDateTime(settings?.trial_ends_at)}`}
                </p>
              </div>
              <Button
                onClick={() => router.push("/escolher-plano")}
                className="bg-brand-500 hover:bg-brand-600"
              >
                Fazer upgrade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Dashboard"
          description="Visão geral do seu controle financeiro"
        />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="semester">Semestral</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 📊 VISÃO GERAL - Cards Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visão Geral</h2>
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
            icon={PiggyBank}
            label="Patrimônio Total"
            value={formatCurrency(totalAssets)}
            subtitle={`Somando todos os ativos`}
            iconColor="purple"
            valueColor="text-purple-600"
          />
        </div>
      </div>

      {/* 💰 ANÁLISE MENSAL - Receitas, Despesas e Patrimônio */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análise Mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
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
            label="Patrimônio Mensal"
            value={formatCurrency(currentMonthData.investments)}
            subtitle={incomeComparison.current > 0 ? `${((currentMonthData.investments / incomeComparison.current) * 100).toFixed(1)}% da receita` : "Sem receitas"}
            iconColor="purple"
            valueColor="text-purple-600"
          />
        </div>
      </div>

      {/* 📈 GRÁFICOS E ANÁLISES */}
      <div className="space-y-4">
        <Suspense fallback={<ChartSkeleton />}>
          <IncomeVsExpensesChart
            monthlyData={chartData.monthly}
            quarterlyData={chartData.quarterly}
            semesterData={chartData.semester}
            yearlyData={chartData.yearly}
            period={period}
          />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <CategoryBreakdownCard
            incomeData={categoryData.income}
            expenseData={categoryData.expenses}
            investmentData={categoryData.investments}
          />
        </Suspense>
      </div>
    </div>
  );
}