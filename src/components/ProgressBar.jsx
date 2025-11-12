import React from 'react';

/**
 * Componente ProgressBar - Barra de progresso para metas
 * @param {number} progress - Valor atual
 * @param {number} goal - Valor objetivo
 * @param {string} variant - Cor: 'brand' | 'success' | 'warning'
 */
export default function ProgressBar({ progress, goal, variant = 'brand', showPercentage = true }) {
  const percentage = Math.min(Math.round((progress / goal) * 100), 100);

  const variants = {
    brand: 'bg-brand-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{percentage}% completo</span>
          <span>{progress.toLocaleString('pt-BR')} / {goal.toLocaleString('pt-BR')}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${variants[variant]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
