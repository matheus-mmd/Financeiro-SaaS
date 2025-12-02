'use client';

import React from 'react';
import { Plus } from 'lucide-react';

/**
 * FloatingActionButton (FAB) - Botão flutuante de ação
 * Aparece no canto inferior direito quando o botão principal não está visível
 *
 * @param {Function} onClick - Função a ser executada ao clicar no botão
 * @param {string} label - Label acessível para o botão
 * @param {React.ReactNode} icon - Ícone a ser exibido (padrão: Plus)
 */
export default function FloatingActionButton({
  onClick,
  label = "Adicionar novo item",
  icon = <Plus className="w-6 h-6" />
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
    >
      {icon}
      <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  );
}