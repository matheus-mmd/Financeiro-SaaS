"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils";

/**
 * MonthEndProjection - Projeção para fim do mês
 * @param {Object} data - { credits, currentExpenses, projectedExpenses, investments, projectedBalance, daysRemaining, avgDailyExpense }
 */
export default function MonthEndProjection({ data }) {
  const {
    credits,
    currentExpenses,
    projectedExpenses,
    investments,
    projectedBalance,
    daysRemaining,
    avgDailyExpense,
    totalDaysInMonth,
  } = data;

  const isNegative = projectedBalance < 0;
  const isWarning = projectedBalance < 500 && projectedBalance >= 0;

  // Calcular quanto precisa economizar por dia para terminar no zero
  const neededDailyReduction =
    isNegative && daysRemaining > 0
      ? Math.abs(projectedBalance) / daysRemaining
      : 0;

  const progressPercentage =
    ((totalDaysInMonth - daysRemaining) / totalDaysInMonth) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Projeção Fim do Mês</h3>
          <span className="text-xs text-gray-500 ml-auto">
            Faltam {daysRemaining} dias
          </span>
        </div>

        {/* Barra de progresso do mês */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso do mês</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Projeção */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Receitas confirmadas</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(credits)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Despesas até agora</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(currentExpenses)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm border-t pt-2">
            <span className="text-gray-600">Despesas projetadas</span>
            <span className="font-semibold text-orange-600">
              {formatCurrency(projectedExpenses)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Aportes</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(investments)}
            </span>
          </div>

          {/* Saldo projetado */}
          <div
            className={`p-4 rounded-lg border-2 ${
              isNegative
                ? "bg-red-50 border-red-200"
                : isWarning
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Saldo estimado</span>
              <span
                className={`text-xl font-bold ${
                  isNegative
                    ? "text-red-600"
                    : isWarning
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {formatCurrency(projectedBalance)}
              </span>
            </div>

            {isNegative && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-800">
                      💡 Para terminar no zero:
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Reduza{" "}
                      <span className="font-semibold">
                        {formatCurrency(neededDailyReduction)}/dia
                      </span>{" "}
                      nos próximos {daysRemaining} dias
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isWarning && !isNegative && (
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Atenção: saldo baixo para fim do mês
              </p>
            )}
          </div>

          {/* Média diária */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <span>Média de gastos: </span>
            <span className="font-semibold text-gray-700">
              {formatCurrency(avgDailyExpense)}/dia
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
