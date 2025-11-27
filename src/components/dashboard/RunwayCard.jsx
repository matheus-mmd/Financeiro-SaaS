"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Clock, Shield } from "lucide-react";
import { formatCurrency } from "../../utils";

/**
 * RunwayCard - Quantos meses você aguenta com suas reservas
 * @param {Object} data - { totalAssets, avgMonthlyExpenses, runwayMonths }
 */
export default function RunwayCard({ data }) {
  const { totalAssets, avgMonthlyExpenses, runwayMonths } = data;

  const getRunwayInfo = (months) => {
    if (months >= 12)
      return {
        color: "text-green-600",
        bg: "bg-green-500",
        label: "Seguro",
        emoji: "🟢",
        icon: Shield,
      };
    if (months >= 6)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-500",
        label: "Razoável",
        emoji: "🟡",
        icon: Clock,
      };
    if (months >= 3)
      return {
        color: "text-orange-600",
        bg: "bg-orange-500",
        label: "Atenção",
        emoji: "🟠",
        icon: Clock,
      };
    return {
      color: "text-red-600",
      bg: "bg-red-500",
      label: "Emergência",
      emoji: "🔴",
      icon: Clock,
    };
  };

  const runwayInfo = getRunwayInfo(runwayMonths);
  const IconComponent = runwayInfo.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <IconComponent className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Runway Financeiro</h3>
        </div>

        <div className="space-y-4">
          {/* Runway principal */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">{runwayInfo.emoji}</span>
              <div className="text-left">
                <p className={`text-3xl font-bold ${runwayInfo.color}`}>
                  {runwayMonths.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">
                  {runwayMonths === 1 ? "mês" : "meses"}
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-gray-600 mt-2">
              {runwayInfo.label} - Colchão de segurança
            </p>

            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all ${runwayInfo.bg}`}
                style={{
                  width: `${Math.min((runwayMonths / 12) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0m</span>
              <span className="font-medium">Meta: 12m</span>
              <span>24m</span>
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Patrimônio total</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalAssets)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Despesa média mensal</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(avgMonthlyExpenses)}
              </span>
            </div>
          </div>

          {/* Dica */}
          <div
            className={`${
              runwayMonths >= 12
                ? "bg-green-50 border-green-200"
                : runwayMonths >= 6
                ? "bg-yellow-50 border-yellow-200"
                : runwayMonths >= 3
                ? "bg-orange-50 border-orange-200"
                : "bg-red-50 border-red-200"
            } border rounded-lg p-3`}
          >
            <p
              className={`text-xs ${
                runwayMonths >= 12
                  ? "text-green-800"
                  : runwayMonths >= 6
                  ? "text-yellow-800"
                  : runwayMonths >= 3
                  ? "text-orange-800"
                  : "text-red-800"
              }`}
            >
              💡{" "}
              {runwayMonths >= 12
                ? "Excelente! Você tem mais de 1 ano de reserva de emergência."
                : runwayMonths >= 6
                ? "Bom! Trabalhe para chegar em 12 meses de reserva."
                : runwayMonths >= 3
                ? "Aumente sua reserva de emergência para pelo menos 6 meses."
                : "URGENTE: Priorize construir uma reserva de emergência!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
