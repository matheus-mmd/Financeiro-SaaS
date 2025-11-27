"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { PieChart, CheckCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils";

/**
 * BudgetRule503020 - Análise da regra 50/30/20
 * @param {Object} data - { essentials, personal, savings, totalIncome, percentages }
 */
export default function BudgetRule503020({ data }) {
  const { essentials, personal, savings, totalIncome, percentages } = data;

  const categories = [
    {
      name: "Essenciais",
      current: percentages.essentials,
      ideal: 50,
      amount: essentials,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      name: "Pessoais",
      current: percentages.personal,
      ideal: 30,
      amount: personal,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      name: "Poupança",
      current: percentages.savings,
      ideal: 20,
      amount: savings,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
  ];

  const isOnTrack = (current, ideal) => {
    const diff = Math.abs(current - ideal);
    if (diff <= 5) return "perfect";
    if (diff <= 10) return "good";
    return "needs-improvement";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Regra 50/30/20</h3>
        </div>

        {/* Gráfico de barras horizontal */}
        <div className="mb-6">
          <div className="flex h-8 rounded-lg overflow-hidden">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className={`${cat.color} flex items-center justify-center`}
                style={{ width: `${cat.current}%` }}
              >
                {cat.current > 10 && (
                  <span className="text-xs font-bold text-white">
                    {cat.current.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Detalhes de cada categoria */}
        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const status = isOnTrack(cat.current, cat.ideal);
            const diff = cat.current - cat.ideal;

            return (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="font-medium text-gray-900">
                      {cat.name}
                    </span>

                    {status === "perfect" && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {status === "needs-improvement" && (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                  </div>

                  <span className={`font-semibold ${cat.textColor}`}>
                    {formatCurrency(cat.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={cat.color}
                      style={{ width: `${(cat.current / cat.ideal) * 100}%` }}
                      className={`h-2 rounded-full ${cat.color}`}
                    />
                  </div>

                  <span className="text-xs text-gray-500 font-medium w-20 text-right">
                    {cat.current.toFixed(1)}% / {cat.ideal}%
                  </span>
                </div>

                {/* Feedback */}
                {status === "needs-improvement" && (
                  <p className="text-xs text-orange-700 mt-2">
                    {diff > 0
                      ? `🔴 ${Math.abs(diff).toFixed(1)}% acima do ideal`
                      : `⚠️ ${Math.abs(diff).toFixed(1)}% abaixo do ideal`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Receita total */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Receita mensal</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(totalIncome)}
            </span>
          </div>
        </div>

        {/* Dica geral */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 Regra 50/30/20: 50% essenciais, 30% pessoais, 20%
            poupança/investimentos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
