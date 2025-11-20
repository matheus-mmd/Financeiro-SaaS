'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../utils/mockApi';

/**
 * TopExpenses - Top 5 maiores gastos do mês
 * @param {Array} expenses - Array de { category, amount, percentage, change, color }
 */
export default function TopExpenses({ expenses, totalExpenses }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Top 5 Maiores Gastos</h3>
        </div>

        <div className="space-y-3">
          {expenses.slice(0, 5).map((expense, index) => {
            const hasIncrease = expense.change > 10;

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Ranking */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700">#{index + 1}</span>
                </div>

                {/* Cor da categoria */}
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: expense.color }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {expense.category}
                    </p>

                    {/* Alerta de aumento */}
                    {hasIncrease && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <ArrowUp className="w-3 h-3" />
                        <span>+{expense.change}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {expense.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Valor */}
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              Total das {expenses.length} categorias
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Dica */}
        {expenses.some(e => e.change > 10) && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800">
              ⚠️ Algumas categorias estão com aumento significativo vs mês anterior
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}