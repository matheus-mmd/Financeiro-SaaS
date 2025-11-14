import React from 'react';
import Card from './Card';

/**
 * Componente StatsCard - Card de estatística reutilizável
 * @param {ReactNode} icon - Ícone (componente Lucide React)
 * @param {string} label - Label/descrição da estatística
 * @param {string|number} value - Valor principal da estatística
 * @param {string} iconColor - Cor do ícone (ex: 'blue', 'green', 'red')
 * @param {string} valueColor - Cor do valor (ex: 'text-blue-600')
 * @param {string} subtitle - Texto adicional abaixo do valor (opcional)
 * @param {string} className - Classes adicionais
 */
export default function StatsCard({
  icon: Icon,
  label,
  value,
  iconColor = 'blue',
  valueColor = 'text-gray-900',
  subtitle,
  className = '',
}) {
  const iconBgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    brand: 'bg-brand-500/10',
  };

  const iconTextColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    brand: 'text-brand-600',
  };

  return (
    <Card className={`p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 ${iconBgColors[iconColor] || iconBgColors.blue} rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColors[iconColor] || iconTextColors.blue}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
          <p className={`text-xl sm:text-2xl font-bold ${valueColor} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
