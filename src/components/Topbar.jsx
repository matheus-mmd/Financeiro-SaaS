import React from 'react';
import Avatar from './Avatar';
import { Menu, X } from 'lucide-react';

/**
 * Componente Topbar - Barra superior com resumo rápido
 * @param {object} user - Dados do usuário
 * @param {number} balance - Saldo disponível
 * @param {boolean} isSidebarCollapsed - Estado do menu lateral
 * @param {function} onToggleSidebar - Função para alternar menu lateral
 */
export default function Topbar({ user, balance, isSidebarCollapsed, onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Sidebar toggle button - Desktop only */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Comprimir menu'}
          title={isSidebarCollapsed ? 'Expandir menu' : 'Comprimir menu'}
        >
          {isSidebarCollapsed ? (
            <>
              <Menu className="w-5 h-5" />
            </>
          ) : (
            <>
              <X className="w-5 h-5" />
            </>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            {user.partner && (
              <p className="text-xs text-gray-500">& {user.partner}</p>
            )}
          </div>
          <Avatar name={user.name} size="md" />
        </div>
      </div>
    </header>
  );
}
