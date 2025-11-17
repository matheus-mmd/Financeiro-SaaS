import React from "react";
import { Card, CardContent } from "./ui/card";
import { formatCurrency } from "../utils/mockApi";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Componente BalanceCard - Exibe informação de saldo/valor monetário
 * Usa Card do shadcn/ui
 */
export default function BalanceCard({
  title,
  amount,
  trend,
  subtitle,
  icon: Icon,
  className = "",
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900">
              {formatCurrency(amount)}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-brand-50 rounded-lg">
              <Icon className="w-6 h-6 text-brand-500" />
            </div>
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 mt-3 text-sm ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {trend === "up" ? "Aumento" : "Redução"} este mês
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
