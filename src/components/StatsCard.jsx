import React, { memo } from "react";
import { Card, CardContent } from "./ui/card";

/**
 * Componente StatsCard - Card de estatísticas moderno com ícone
 * Usa Card do shadcn/ui com design atualizado
 * Memoizado para evitar re-renders desnecessários
 */
const StatsCard = memo(function StatsCard({
  icon: Icon,
  label,
  value,
  iconColor = "blue",
  valueColor = "text-gray-900",
  subtitle,
  className = "",
}) {
  // Configuração de cores por variante - Design moderno com gradientes
  const colorConfig = {
    blue: {
      iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
      iconText: "text-white",
      border: "border-l-brand-500",
      shadow: "shadow-brand-500/20",
    },
    brand: {
      iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
      iconText: "text-white",
      border: "border-l-brand-500",
      shadow: "shadow-brand-500/20",
    },
    red: {
      iconBg: "bg-gradient-to-br from-rose-500 to-rose-600",
      iconText: "text-white",
      border: "border-l-rose-500",
      shadow: "shadow-rose-500/20",
    },
    green: {
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconText: "text-white",
      border: "border-l-emerald-500",
      shadow: "shadow-emerald-500/20",
    },
    purple: {
      iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
      iconText: "text-white",
      border: "border-l-violet-500",
      shadow: "shadow-violet-500/20",
    },
    yellow: {
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconText: "text-white",
      border: "border-l-amber-500",
      shadow: "shadow-amber-500/20",
    },
    info: {
      iconBg: "bg-gradient-to-br from-sky-500 to-sky-600",
      iconText: "text-white",
      border: "border-l-sky-500",
      shadow: "shadow-sky-500/20",
    },
    gray: {
      iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
      iconText: "text-white",
      border: "border-l-gray-500",
      shadow: "shadow-gray-500/20",
    },
  };

  const config = colorConfig[iconColor] || colorConfig.blue;

  return (
    <Card className={`border-l-4 ${config.border} hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Icon container com gradiente */}
          <div className={`
            flex-shrink-0 w-11 h-11 rounded-xl
            flex items-center justify-center
            ${config.iconBg}
            shadow-lg ${config.shadow}
          `}>
            <Icon className={`w-5 h-5 ${config.iconText}`} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5 truncate">
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-bold ${valueColor} truncate`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default StatsCard;