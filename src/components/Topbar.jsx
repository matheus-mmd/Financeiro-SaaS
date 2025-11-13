import React from 'react';
import Avatar from './Avatar';

/**
 * Componente Topbar - Barra superior com resumo rápido
 * @param {object} user - Dados do usuário
 * @param {number} balance - Saldo disponível
 */
export default function Topbar({ user, balance }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end">
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
