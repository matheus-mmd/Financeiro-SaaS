'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/mockApi';

/**
 * SavingsRateCard - Taxa de poupança mensal
 * @param {Object} data - { savings, credits, savingsRate }
 */
export default function SavingsRateCard({ data }) {
  const { savings, credits, savingsRate } = data;

  const getRateInfo = (rate) => {
    if (rate >= 20) return { color: 'text-green-600', bg: 'bg-green-500', label: 'Excelente', emoji: '🟢' };
    if (rate >= 10) return { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Bom', emoji: '🟡' };
    if (rate >= 5) return { color: 'text-orange-600', bg: 'bg-orange-500', label: 'Abaixo do ideal', emoji: '🟠' };
    return { color: 'text-red-600', bg: 'bg-red-500', label: 'Crítico', emoji: '🔴' };
  };

  const rateInfo = getRateInfo(savingsRate);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Taxa de Poupança</h3>
        </div>

        <div className="space-y-4">
          {/* Taxa principal */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">{rateInfo.emoji}</span>
              <div className="text-left">
                <p className={`text-3xl font-bold ${rateInfo.color}`}>
                  {savingsRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">{rateInfo.label}</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all ${rateInfo.bg}`}
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium">Meta: 20%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Poupado no mês</span>
              <span className="font-semibold text-green-600">{formatCurrency(savings)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Receitas totais</span>
              <span className="font-medium text-gray-900">{formatCurrency(credits)}</span>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 {savingsRate >= 20
                ? 'Parabéns! Você está poupando acima da meta de 20%.'
                : savingsRate >= 10
                ? 'Tente aumentar sua poupança para 20% das receitas.'
                : 'Objetivo: poupar pelo menos 20% da sua receita mensal.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}