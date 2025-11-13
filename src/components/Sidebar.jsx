import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  TrendingUp,
  Target,
  BarChart3,
  User,
  Menu,
  X
} from 'lucide-react';

/**
 * Componente Sidebar - Menu lateral de navegação
 * Responsivo: colapsável em mobile
 */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
    { path: '/despesas', icon: Receipt, label: 'Despesas' },
    { path: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
    { path: '/metas', icon: Target, label: 'Metas' },
    { path: '/comparador', icon: BarChart3, label: 'Comparador' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          lg:hidden fixed top-4 z-50 p-2 bg-white rounded-lg shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'left-60' : 'left-4'}
        `}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <div className="relative w-6 h-6">
          <Menu
            className={`
              absolute inset-0 w-6 h-6 transition-opacity duration-200
              ${isOpen ? 'opacity-0' : 'opacity-100'}
            `}
          />
          <X
            className={`
              absolute inset-0 w-6 h-6 transition-opacity duration-200
              ${isOpen ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-brand-500 leading-tight">
              Financeiro
            </h1>
            <p className="text-xs text-gray-500 mt-1">Controle Pessoal</p>
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-4 space-y-1" aria-label="Menu principal">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${active
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2025 Financeiro SaaS
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
