import React from 'react';

/**
 * Componente PageHeader - Cabeçalho reutilizável para páginas
 * @param {string} title - Título principal da página
 * @param {string} description - Descrição/subtítulo da página
 * @param {ReactNode} actions - Botões ou ações do lado direito
 * @param {string} className - Classes adicionais
 */
export default function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
