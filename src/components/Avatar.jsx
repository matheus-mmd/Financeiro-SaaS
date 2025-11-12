import React from 'react';

/**
 * Componente Avatar - Exibe foto ou iniciais do usuário
 * @param {string} src - URL da imagem
 * @param {string} alt - Texto alternativo
 * @param {string} name - Nome para gerar iniciais
 * @param {string} size - Tamanho: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  // Gera iniciais a partir do nome
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
