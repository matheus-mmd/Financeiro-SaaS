'use client';

import React from 'react';

/**
 * Variantes disponíveis para o IconContainer
 */
const variants = {
  // Cores primárias
  brand: {
    base: 'bg-brand-100 text-brand-600',
    solid: 'bg-brand-500 text-white shadow-lg shadow-brand-500/30',
    outline: 'bg-transparent border-2 border-brand-500 text-brand-500',
    gradient: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30',
  },
  accent: {
    base: 'bg-accent-100 text-accent-600',
    solid: 'bg-accent-500 text-white shadow-lg shadow-accent-500/30',
    outline: 'bg-transparent border-2 border-accent-500 text-accent-500',
    gradient: 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30',
  },
  // Status
  success: {
    base: 'bg-success-100 text-success-600',
    solid: 'bg-success-500 text-white shadow-lg shadow-success-500/30',
    outline: 'bg-transparent border-2 border-success-500 text-success-500',
    gradient: 'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-lg shadow-success-500/30',
  },
  warning: {
    base: 'bg-warning-100 text-warning-600',
    solid: 'bg-warning-500 text-white shadow-lg shadow-warning-500/30',
    outline: 'bg-transparent border-2 border-warning-500 text-warning-500',
    gradient: 'bg-gradient-to-br from-warning-500 to-warning-600 text-white shadow-lg shadow-warning-500/30',
  },
  danger: {
    base: 'bg-danger-100 text-danger-600',
    solid: 'bg-danger-500 text-white shadow-lg shadow-danger-500/30',
    outline: 'bg-transparent border-2 border-danger-500 text-danger-500',
    gradient: 'bg-gradient-to-br from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/30',
  },
  info: {
    base: 'bg-info-100 text-info-600',
    solid: 'bg-info-500 text-white shadow-lg shadow-info-500/30',
    outline: 'bg-transparent border-2 border-info-500 text-info-500',
    gradient: 'bg-gradient-to-br from-info-500 to-info-600 text-white shadow-lg shadow-info-500/30',
  },
  // Neutros
  gray: {
    base: 'bg-gray-100 text-gray-600',
    solid: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30',
    outline: 'bg-transparent border-2 border-gray-400 text-gray-500',
    gradient: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30',
  },
  // Específicos para transações
  income: {
    base: 'bg-emerald-100 text-emerald-600',
    solid: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
  },
  expense: {
    base: 'bg-rose-100 text-rose-600',
    solid: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
    gradient: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30',
  },
  investment: {
    base: 'bg-violet-100 text-violet-600',
    solid: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30',
    gradient: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30',
  },
};

/**
 * Tamanhos disponíveis
 */
const sizes = {
  xs: 'w-6 h-6 rounded-md',
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-14 h-14 rounded-2xl',
  '2xl': 'w-16 h-16 rounded-2xl',
};

/**
 * Tamanhos de ícone
 */
const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
  '2xl': 'w-8 h-8',
};

/**
 * IconContainer - Container reutilizável para ícones com estilo consistente
 *
 * @param {React.ElementType} icon - Componente de ícone (ex: ArrowUpDown do lucide-react)
 * @param {string} variant - Variante de cor (brand, accent, success, warning, danger, info, gray, income, expense, investment)
 * @param {string} style - Estilo (base, solid, outline, gradient)
 * @param {string} size - Tamanho (xs, sm, md, lg, xl, 2xl)
 * @param {string} className - Classes adicionais
 * @param {boolean} pulse - Adiciona animação de pulso
 */
export default function IconContainer({
  icon: Icon,
  variant = 'brand',
  style = 'base',
  size = 'md',
  className = '',
  pulse = false,
  children,
  ...props
}) {
  const variantStyles = variants[variant] || variants.brand;
  const styleClass = variantStyles[style] || variantStyles.base;
  const sizeClass = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <div
      className={`
        flex items-center justify-center flex-shrink-0
        ${sizeClass}
        ${styleClass}
        ${pulse ? 'animate-pulse' : ''}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {Icon ? (
        <Icon className={iconSize} strokeWidth={2} />
      ) : (
        children
      )}
    </div>
  );
}

/**
 * Exporta as variantes e tamanhos para uso externo
 */
export { variants, sizes, iconSizes };