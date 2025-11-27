import React from 'react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

/**
 * Componente ProgressBar - Barra de progresso para metas
 * @param {number} progress - Valor atual
 * @param {number} goal - Valor objetivo
 * @param {string} variant - Cor: 'brand' | 'success' | 'warning'
 */
export default function ProgressBar({ progress, goal, variant = 'brand', showPercentage = true, className }) {
  const percentage = Math.min(Math.round((progress / goal) * 100), 100);

  const variantClasses = {
    brand: '[&>div]:bg-brand-500',
    success: '[&>div]:bg-green-500',
    warning: '[&>div]:bg-yellow-500',
  };

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{percentage}% completo</span>
          <span>{progress.toLocaleString('pt-BR')} / {goal.toLocaleString('pt-BR')}</span>
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(
          'h-3 bg-gray-200',
          variantClasses[variant]
        )}
      />
    </div>
  );
}
