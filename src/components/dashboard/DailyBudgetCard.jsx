import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Wallet, Calendar, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils';

/**
 * Card "Posso Gastar?" - Disponível por Dia
 * Mostra quanto o usuário pode gastar por dia mantendo suas metas
 */
export default function DailyBudgetCard({ availableBalance, daysRemaining, savingsGoal = 0 }) {
  // Calcular quanto pode gastar por dia
  const balanceAfterSavings = availableBalance - savingsGoal;
  const dailyBudget = daysRemaining > 0 ? balanceAfterSavings / daysRemaining : 0;

  // Determinar se está em situação de alerta
  const isLow = dailyBudget < 50;
  const isCritical = dailyBudget < 20 || dailyBudget < 0;

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
      isCritical ? 'border-red-200 border-2' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isCritical ? 'bg-red-50' : isLow ? 'bg-yellow-50' : 'bg-blue-50'
          }`}>
            <Wallet className={`w-5 h-5 ${
              isCritical ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-blue-600'
            }`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Disponível por Dia</h3>
        </div>

        {/* Valor disponível por dia */}
        <div className="mb-3">
          <div className={`text-4xl font-bold ${
            isCritical ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {dailyBudget >= 0 ? formatCurrency(dailyBudget) : formatCurrency(0)}
            <span className="text-lg text-gray-400">/dia</span>
          </div>
        </div>

        {/* Dias restantes */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Para os próximos <span className="font-semibold">{daysRemaining}</span> dias
          </span>
        </div>

        {/* Alertas e informações */}
        {isCritical && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-600">
              <p className="font-medium">Atenção: Orçamento apertado!</p>
              <p className="mt-1">Considere reduzir despesas ou adiar compras não essenciais.</p>
            </div>
          </div>
        )}

        {!isCritical && isLow && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-700">
              Orçamento está apertado. Monitore seus gastos com atenção.
            </div>
          </div>
        )}

        {!isCritical && !isLow && savingsGoal > 0 && (
          <div className="text-xs text-gray-500">
            Mantendo sua meta de economizar {formatCurrency(savingsGoal)} este mês
          </div>
        )}
      </CardContent>
    </Card>
  );
}
