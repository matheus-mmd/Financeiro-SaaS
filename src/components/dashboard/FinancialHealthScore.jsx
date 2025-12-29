"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, Heart } from "lucide-react";

/**
 * FinancialHealthScore - Indicador de saúde financeira (0-100)
 * @param {number} score - Score de 0 a 100
 * @param {Object} breakdown - Detalhamento { balancePositive, savingsRate, expenseRatio, growthTrend }
 */
export default function FinancialHealthScore({ score, breakdown }) {
  const getScoreColor = (score) => {
    if (score >= 80)
      return {
        color: "text-green-600",
        bg: "bg-green-500",
        label: "Excelente",
        emoji: "🟢",
      };
    if (score >= 60)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-500",
        label: "Bom",
        emoji: "🟡",
      };
    if (score >= 40)
      return {
        color: "text-orange-600",
        bg: "bg-orange-500",
        label: "Atenção",
        emoji: "🟠",
      };
    return {
      color: "text-red-600",
      bg: "bg-red-500",
      label: "Crítico",
      emoji: "🔴",
    };
  };

  const scoreInfo = getScoreColor(score);
  const percentage = Math.min(score, 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Saúde Financeira</h3>
        </div>

        <div className="space-y-4">
          {/* Score visual */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - percentage / 100)
                  }`}
                  className={scoreInfo.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreInfo.color}`}>
                  {Math.round(score)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{scoreInfo.emoji}</span>
                <span className={`text-lg font-semibold ${scoreInfo.color}`}>
                  {scoreInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {score >= 80 && "Continue assim! Sua situação está ótima."}
                {score >= 60 &&
                  score < 80 &&
                  "Bom trabalho! Há espaço para melhorar."}
                {score >= 40 &&
                  score < 60 &&
                  "Atenção necessária. Faça ajustes."}
                {score < 40 && "Situação crítica. Ação urgente necessária."}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {breakdown && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Componentes do Score
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      breakdown.balancePositive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-gray-600">Saldo positivo</span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      breakdown.savingsRate ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-gray-600">Taxa poupança</span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      breakdown.expenseRatio ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-gray-600">Despesas controladas</span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      breakdown.growthTrend ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-gray-600">Tendência positiva</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}