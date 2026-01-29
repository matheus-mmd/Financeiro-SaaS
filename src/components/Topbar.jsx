'use client';

import React from 'react';
import { Menu, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';

/**
 * Componente Topbar - Barra superior moderna
 * @param {boolean} isSidebarCollapsed - Estado do menu lateral
 * @param {function} onToggleSidebar - Função para alternar menu lateral
 * @param {boolean} isMobileSidebarOpen - Estado do menu mobile
 * @param {function} onToggleMobileSidebar - Função para alternar menu mobile
 */
export default function Topbar({
  isSidebarCollapsed,
  onToggleSidebar,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
        {/* Left section - Menu buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Right section - Notifications */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          {/* Notifications button (placeholder) */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>
        </div>
      </div>
    </header>
  );
}