'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * FABMenu - Floating Action Button com menu de ações
 * Botão flutuante que expande para mostrar múltiplas ações
 *
 * @param {Array} actions - Array de objetos com { icon, label, onClick }
 * @param {React.ReactNode} primaryIcon - Ícone do botão principal (padrão: Plus)
 * @param {string} primaryLabel - Label do botão principal para o tooltip
 */
export default function FABMenu({
  actions = [],
  primaryIcon = <Plus className="w-6 h-6" />,
  primaryLabel = "Ações"
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Overlay quando menu está aberto - z-20 para ficar atrás do Sidebar (z-50) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container dos botões - z-30 mesmo nível do container principal */}
      <div className="relative z-30">
        {/* Botões de ação secundários */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col items-end gap-3 mb-2">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-end gap-3 group"
              >
                {/* Label do botão secundário (tooltip à esquerda) */}
                <span className="relative bg-gray-900 text-white text-sm px-3 py-2 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {action.label}
                  {/* Seta apontando para o botão */}
                  <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
                </span>

                {/* Botão secundário - sempre alinhado à direita */}
                <button
                  onClick={() => handleActionClick(action)}
                  aria-label={action.label}
                  className="flex-shrink-0 w-12 h-12
                    bg-white dark:bg-gray-800
                    text-brand-600 dark:text-brand-400
                    rounded-xl
                    shadow-lg hover:shadow-xl
                    transition-all duration-200 ease-out
                    transform hover:scale-105 active:scale-95
                    flex items-center justify-center
                    border border-gray-200 dark:border-gray-700
                    animate-in fade-in slide-in-from-bottom-2"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botão principal (FAB) - SEM animações no carregamento */}
        <button
          onClick={toggleMenu}
          aria-label={isOpen ? "Fechar menu" : primaryLabel}
          aria-expanded={isOpen}
          className="relative w-14 h-14
            bg-gradient-to-br from-brand-500 to-brand-600
            hover:from-brand-600 hover:to-brand-700
            text-white rounded-2xl
            shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40
            transition-all duration-200 ease-out
            transform hover:scale-105 active:scale-95
            flex items-center justify-center group"
        >
          {/* Ícone do botão principal com rotação suave */}
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            {isOpen ? <X className="w-6 h-6" /> : primaryIcon}
          </div>

          {/* Tooltip do botão principal - sempre visível no hover quando fechado */}
          {!isOpen && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2
              bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-xl
              whitespace-nowrap shadow-lg
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              pointer-events-none z-10">
              {primaryLabel}
              {/* Seta apontando para o botão */}
              <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2
                border-4 border-transparent border-l-gray-900" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}