import React from 'react';

/**
 * Componente Button - Botão reutilizável com variantes
 * @param {string} variant - Variante do botão: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - Tamanho: 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - Desabilita o botão
 * @param {ReactNode} children - Conteúdo do botão
 * @param {function} onClick - Callback de clique
 * @param {string} className - Classes adicionais
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = '',
  ...props
}) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
