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
  // Cores dos ícones (mapeamento para variantes) - Novas cores modernas
  const iconBgColors = {
    blue: "bg-brand-100",
    red: "bg-danger-100",
    green: "bg-success-100",
    purple: "bg-accent-100",
    yellow: "bg-warning-100",
    brand: "bg-brand-100",
    info: "bg-info-100",
  };

  const iconTextColors = {
    blue: "text-brand-600",
    red: "text-danger-600",
    green: "text-success-600",
    purple: "text-accent-600",
    yellow: "text-warning-600",
    brand: "text-brand-600",
    info: "text-info-600",
  };

  const borderColors = {
    blue: "border-r-brand-500",
    red: "border-r-danger-500",
    green: "border-r-success-500",
    purple: "border-r-accent-500",
    yellow: "border-r-warning-500",
    brand: "border-r-brand-500",
    info: "border-r-info-500",
  };

  return (
    <Card className={`border-r-4 ${borderColors[iconColor]} ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`p-2 sm:p-3 ${iconBgColors[iconColor]} rounded-xl flex-shrink-0 shadow-sm`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColors[iconColor]}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{label}</p>
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