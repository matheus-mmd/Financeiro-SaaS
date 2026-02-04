"use client"

import React, { useMemo, memo } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { formatCurrency } from '../../utils';

/**
 * IncomeVsExpensesChart - Gráfico comparando Receitas x Despesas x Patrimônio
 * Visualização por período (anual, semestral, trimestral, mensal) com gráfico de barras estilo shadcn/ui
 * Memoizado para evitar re-renders desnecessários
 *
 * @param {Array} monthlyData - Dados mensais [{date, income, expense, investment}, ...]
 * @param {Array} quarterlyData - Dados trimestrais [{date, income, expense, investment}, ...]
 * @param {Array} semesterData - Dados semestrais [{date, income, expense, investment}, ...]
 * @param {Array} yearlyData - Dados anuais [{date, income, expense, investment}, ...]
 * @param {string} period - Período selecionado (monthly, quarterly, semester, yearly)
 */
const IncomeVsExpensesChart = memo(function IncomeVsExpensesChart({
  monthlyData = [],
  quarterlyData = [],
  semesterData = [],
  yearlyData = [],
  period = 'monthly'
}) {

  // Selecionar dados baseado no período escolhido
  const data = useMemo(() =>
    period === 'monthly' ? monthlyData :
    period === 'quarterly' ? quarterlyData :
    period === 'semester' ? semesterData :
    yearlyData,
    [period, monthlyData, quarterlyData, semesterData, yearlyData]
  );

  // Calcular totais
  const totalIncome = useMemo(() =>
    data.reduce((sum, item) => sum + (item.income || 0), 0),
    [data]
  );

  const totalExpense = useMemo(() =>
    data.reduce((sum, item) => sum + (item.expense || 0), 0),
    [data]
  );

  const totalInvestment = useMemo(() =>
    data.reduce((sum, item) => sum + (item.investment || 0), 0),
    [data]
  );

  const balance = useMemo(() =>
    totalIncome - totalExpense - totalInvestment,
    [totalIncome, totalExpense, totalInvestment]
  );

  const savingsRate = useMemo(() =>
    totalIncome > 0 ? (((totalInvestment + balance) / totalIncome) * 100).toFixed(1) : '0.0',
    [totalIncome, totalInvestment, balance]
  );

  // Configuração do chart seguindo padrão shadcn
  const chartConfig = {
    income: {
      label: "Receitas",
      color: "#10b981", // green-500
    },
    expense: {
      label: "Despesas",
      color: "#ef4444", // red-500
    },
    investment: {
      label: "Patrimônio",
      color: "#a855f7", // purple-500
    },
  }

  // Formatar valor para exibição no tooltip
  const formatValue = (value) => {
    return formatCurrency(value);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Receitas x Despesas x Patrimônio
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.6}/>
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs text-gray-500"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs text-gray-500"
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />

              <Bar
                dataKey="income"
                fill="url(#colorIncome)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="url(#colorExpense)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="investment"
                fill="url(#colorInvestment)"
                radius={[4, 4, 0, 0]}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const labels = {
                        income: "Receitas",
                        expense: "Despesas",
                        investment: "Patrimônio"
                      };
                      return (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="text-xs font-medium text-gray-600">
                            {labels[name] || name}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatValue(value)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className="text-sm text-gray-400">Sem dados disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default IncomeVsExpensesChart;