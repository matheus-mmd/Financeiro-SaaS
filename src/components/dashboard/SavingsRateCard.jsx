import React from 'react';
import { Card, CardContent } from '../ui/card';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils';

/**
 * Card de Taxa de Poupança
 * Mostra a taxa de poupança atual vs meta com progresso visual
 */
export default function SavingsRateCard({ savingsRate, goal = 20, amountToGoal, income }) {
  const percentage = Math.min((savingsRate / goal) * 100, 100);
  const isAboveGoal = savingsRate >= goal;
  const difference = Math.abs(savingsRate - goal);

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 border-r-4 ${isAboveGoal ? 'border-r-success-500' : 'border-r-brand-500'}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl shadow-sm ${isAboveGoal ? 'bg-success-50' : 'bg-brand-50'}`}>
            <PiggyBank className={`w-5 h-5 ${isAboveGoal ? 'text-success-600' : 'text-brand-600'}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Taxa de Poupança</h3>
        </div>

        {/* Taxa atual e meta */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${isAboveGoal ? 'text-success-600' : 'text-brand-600'}`}>
            {savingsRate.toFixed(1)}%
          </span>
          <span className="text-lg text-gray-400">→ Meta: {goal}%</span>
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isAboveGoal ? 'bg-success-500' : 'bg-brand-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isAboveGoal ? (
            <>
              <TrendingUp className="w-4 h-4 text-success-600" />
              <span className="text-sm text-success-600 font-medium">
                {difference.toFixed(1)}% acima da meta!
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {amountToGoal > 0
                  ? `Faltam ${formatCurrency(amountToGoal)} para a meta`
                  : 'Economize mais para atingir a meta'
                }
              </span>
            </>
          )}
        </div>

        {/* Informação adicional */}
        {savingsRate > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Você está poupando {formatCurrency(income * (savingsRate / 100))} por mês
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}