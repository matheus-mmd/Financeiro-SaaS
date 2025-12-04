'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency } from '../../utils';
import SegmentedControl from '../ui/segmented-control';

/**
 * IncomeVsExpensesChart - Gráfico comparando Receitas x Despesas
 * Suporta visualização diária (gráfico de área) e mensal (gráfico de barras)
 *
 * @param {Array} dailyData - Dados diários [{date, income, expense}, ...]
 * @param {Array} monthlyData - Dados mensais [{date, income, expense}, ...]
 * @param {string} period - Período de exibição (ex: "PERÍODO ATUAL")
 */
export default function IncomeVsExpensesChart({
  dailyData = [],
  monthlyData = [],
  period = "PERÍODO ATUAL"
}) {
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' ou 'monthly'

  // Selecionar dados com base no modo de visualização
  const data = viewMode === 'daily' ? dailyData : monthlyData;
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

      // Determinar título do tooltip baseado no modo
      const title = viewMode === 'daily' ? `Dia ${label}` : label;

      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 min-w-[220px]">
          <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
          <div className="space-y-2">
            {/* Receitas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-600">Receitas</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(income)}
              </span>
            </div>

            {/* Despesas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
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
                pointBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(pointBalance)}
              </span>
            </div>

            {/* Taxa de Poupança */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Taxa poupança</span>
              <span className={`text-sm font-bold ${
                parseFloat(pointSavingsRate) >= 0 ? 'text-green-600' : 'text-red-600'
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
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Receitas x Despesas</h2>
                <p className="text-sm text-gray-500 mt-0.5">{period}</p>
              </div>
            </div>

            {/* Resumo Total */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Saldo Total</p>
              <p className={`text-xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Taxa: <span className="font-semibold">{savingsRate}%</span>
              </p>
            </div>
          </div>

          {/* Toggle de visualização */}
          <div className="flex justify-center">
            <SegmentedControl
              options={[
                { label: 'Mensal', value: 'monthly' },
                { label: 'Diário', value: 'daily' }
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
        </div>

        {/* Gráfico - Alterna entre Barras (mensal) e Área (diário) */}
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {viewMode === 'monthly' ? (
              // Gráfico de Barras para visualização mensal
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
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.6}/>
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
            ) : (
              // Gráfico de Área para visualização diária
              <AreaChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
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

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorIncome)"
                  dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f97316"
                  strokeWidth={3}
                  fill="url(#colorExpense)"
                  dot={{ fill: '#f97316', stroke: '#fff', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
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