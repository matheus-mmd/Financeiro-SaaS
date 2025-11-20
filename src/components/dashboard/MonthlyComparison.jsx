'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ArrowUp, ArrowDown, Minus, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/mockApi';

/**
 * MonthlyComparison - Comparativo mês atual vs mês anterior
 * @param {Object} current - Dados do mês atual { credits, expenses, investments, balance }
 * @param {Object} previous - Dados do mês anterior { credits, expenses, investments, balance }
 */
export default function MonthlyComparison({ current, previous }) {
  const calculateChange = (currentValue, previousValue) => {
    if (previousValue === 0) return { percent: 0, absolute: currentValue, trend: 'neutral' };

    const absolute = currentValue - previousValue;
    const percent = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;

    let trend = 'neutral';
    if (percent > 5) trend = 'up';
    else if (percent < -5) trend = 'down';

    return { percent, absolute, trend };
  };

  const renderMetric = (label, currentValue, previousValue, isPositiveBetter = true) => {
    const change = calculateChange(currentValue, previousValue);

    // Para despesas, verde é quando diminui
    const isGood = isPositiveBetter
      ? change.trend === 'up'
      : change.trend === 'down';

    const isBad = isPositiveBetter
      ? change.trend === 'down'
      : change.trend === 'up';

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(currentValue)}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1">
            {change.trend === 'up' && (
              <ArrowUp className={`w-4 h-4 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
            )}
            {change.trend === 'down' && (
              <ArrowDown className={`w-4 h-4 ${isBad ? 'text-red-600' : 'text-green-600'}`} />
            )}
            {change.trend === 'neutral' && (
              <Minus className="w-4 h-4 text-gray-400" />
            )}

            <span className={`text-sm font-medium ${
              isGood && change.trend !== 'neutral' ? 'text-green-600' :
              isBad && change.trend !== 'neutral' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {change.percent > 0 ? '+' : ''}{change.percent.toFixed(1)}%
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {change.absolute > 0 ? '+' : ''}{formatCurrency(change.absolute)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Comparativo Mensal</h3>
          <span className="text-xs text-gray-500 ml-auto">vs mês anterior</span>
        </div>

        <div className="space-y-3">
          {renderMetric('Receitas', current.credits, previous.credits, true)}
          {renderMetric('Despesas', current.expenses, previous.expenses, false)}
          {renderMetric('Aportes', current.investments, previous.investments, true)}
          {renderMetric('Saldo', current.balance, previous.balance, true)}
        </div>
      </CardContent>
    </Card>
  );
}