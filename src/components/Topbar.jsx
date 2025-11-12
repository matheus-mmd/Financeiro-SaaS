import React from 'react';
import Avatar from './Avatar';
import Badge from './Badge';
import { formatCurrency } from '../utils/mockApi';
import { Wallet } from 'lucide-react';

/**
 * Componente Topbar - Barra superior com resumo rápido
 * @param {object} user - Dados do usuário
 * @param {number} balance - Saldo disponível
 */
export default function Topbar({ user, balance }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Saldo rápido */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-brand-50 rounded-lg">
            <Wallet className="w-5 h-5 text-brand-500" />
            <div>
              <p className="text-xs text-gray-500">Saldo disponível</p>
              <p className="text-lg font-semibold text-brand-600">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

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
