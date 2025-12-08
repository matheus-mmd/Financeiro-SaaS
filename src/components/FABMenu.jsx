'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * FABMenu - Floating Action Button com menu de ações
 * Botão flutuante que expande para mostrar múltiplas ações
 *
 * @param {Array} actions - Array de objetos com { icon, label, onClick }
 * @param {React.ReactNode} primaryIcon - Ícone do botão principal (padrão: Plus)
 * @param {string} primaryLabel - Label do botão principal
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Overlay quando menu está aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container dos botões */}
      <div className="relative z-50">
        {/* Botões de ação secundários */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center gap-3 group">
                {/* Label do botão secundário */}
                <span className="bg-gray-900 text-white text-sm px-3 py-2 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {action.label}
                </span>

                {/* Botão secundário */}
                <button
                  onClick={() => handleActionClick(action)}
                  aria-label={action.label}
                  className="w-12 h-12
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

        {/* Botão principal (FAB) */}
        <button
          onClick={toggleMenu}
          aria-label={isOpen ? "Fechar menu" : primaryLabel}
          aria-expanded={isOpen}
          className="w-14 h-14
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

          {/* Tooltip do botão principal */}
          {!isOpen && (
            <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              {primaryLabel}
              <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}