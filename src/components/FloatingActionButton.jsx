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
      className="fixed bottom-6 right-6 z-50 w-14 h-14
        bg-gradient-to-br from-brand-500 to-brand-600
        hover:from-brand-600 hover:to-brand-700
        text-white rounded-2xl
        shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40
        transition-all duration-200 ease-out
        transform hover:scale-105 active:scale-95
        flex items-center justify-center group"
    >
      {icon}
      <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
        {label}
        <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
      </span>
    </button>
  );
}