import React from "react";
import { Card, CardContent } from "./ui/card";

/**
 * Componente StatsCard - Card de estatísticas com ícone
 * Usa Card do shadcn/ui
 */
export default function StatsCard({
  icon: Icon,
  label,
  value,
  iconColor = "blue",
  valueColor = "text-gray-900",
  subtitle,
  className = "",
}) {
  // Cores dos ícones (mapeamento para variantes)
  const iconBgColors = {
    blue: "bg-blue-100",
    red: "bg-red-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    yellow: "bg-yellow-100",
    brand: "bg-brand-100",
  };

  const iconTextColors = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    brand: "text-brand-600",
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`p-2 sm:p-3 ${iconBgColors[iconColor]} rounded-lg flex-shrink-0`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColors[iconColor]}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${valueColor} truncate`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
