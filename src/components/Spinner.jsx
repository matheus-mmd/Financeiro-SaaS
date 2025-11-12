import React from 'react';

/**
 * Componente Spinner - Indicador de carregamento
 * @param {string} size - Tamanho: 'sm' | 'md' | 'lg'
 * @param {string} color - Cor: 'brand' | 'white' | 'gray'
 */
export default function Spinner({ size = 'md', color = 'brand', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    brand: 'border-brand-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  return (
    <div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
