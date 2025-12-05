'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency } from '../../utils';

/**
 * IncomeVsExpensesChart - Gráfico comparando Receitas x Despesas
 * Visualização mensal com gráfico de barras
 *
 * @param {Array} monthlyData - Dados mensais [{date, income, expense}, ...]
 */
export default function IncomeVsExpensesChart({
  monthlyData = []
}) {
  // Usar apenas dados mensais
  const data = monthlyData;
  // Calcular totais
  const totalIncome = data.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = data.reduce((sum, item) => sum + (item.expense || 0), 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0';

  // Custom Tooltip que aparece próximo ao cursor
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find(p => p.dataKey === 'income')?.value || 0;
      const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
      const pointBalance = income - expense;
      const pointSavingsRate = income > 0 ? ((pointBalance / income) * 100).toFixed(1) : '0.0';

      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 min-w-[220px]">
          <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
          <div className="space-y-2">
            {/* Receitas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-xs font-medium text-gray-600">Receitas</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(income)}
              </span>
            </div>

            {/* Despesas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <span className="text-xs font-medium text-gray-600">Despesas</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(expense)}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-2" />

            {/* Saldo */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Saldo</span>
              <span className={`text-sm font-bold ${
                pointBalance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(pointBalance)}
              </span>
            </div>

            {/* Taxa de Poupança */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Taxa poupança</span>
              <span className={`text-sm font-bold ${
                parseFloat(pointSavingsRate) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {pointSavingsRate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Receitas x Despesas</h2>
        </div>

        {/* Gráfico de Barras */}
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
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
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                  }}
                  width={45}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />

                <Bar dataKey="income" fill="url(#colorIncome)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="url(#colorExpense)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className="text-sm text-gray-400">Sem dados disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}