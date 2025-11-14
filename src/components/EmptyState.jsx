import React from 'react';
import Card from './Card';

/**
 * Componente EmptyState - Estado vazio reutilizável
 * @param {ReactNode} icon - Ícone (componente Lucide React)
 * @param {string} title - Título do estado vazio
 * @param {string} description - Descrição do estado vazio
 * @param {ReactNode} action - Botão ou ação (opcional)
 * @param {string} className - Classes adicionais
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <Card className={`p-8 sm:p-12 text-center ${className}`}>
      {Icon && (
        <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
      )}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </Card>
  );
}
