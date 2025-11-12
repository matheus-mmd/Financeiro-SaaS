import React from 'react';

/**
 * Componente Card - Container para conteúdo
 * @param {ReactNode} children - Conteúdo do card
 * @param {string} className - Classes adicionais
 * @param {boolean} hover - Adiciona efeito hover
 * @param {function} onClick - Callback de clique (torna o card clicável)
 */
export default function Card({ children, className = '', hover = false, onClick }) {
  const baseClasses = 'bg-white rounded-2xl shadow-sm transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      {children}
    </div>
  );
}
