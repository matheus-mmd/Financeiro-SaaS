'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Menu, LogOut, ChevronDown, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/**
 * Gera iniciais a partir do nome
 */
const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/**
 * Componente Topbar - Barra superior moderna com informações do usuário
 * @param {object} user - Dados do usuário
 * @param {boolean} isSidebarCollapsed - Estado do menu lateral
 * @param {function} onToggleSidebar - Função para alternar menu lateral
 * @param {boolean} isMobileSidebarOpen - Estado do menu mobile
 * @param {function} onToggleMobileSidebar - Função para alternar menu mobile
 * @param {function} onLogout - Função para fazer logout
 */
export default function Topbar({
  user,
  isSidebarCollapsed,
  onToggleSidebar,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
        {/* Left section - Menu buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
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

        {/* Center - Global Search */}
        <div className="flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        {/* Right section - Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications button (placeholder) */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                    <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 leading-tight">
                      {user.name}
                    </span>
                    {user.email && (
                      <span className="text-xs text-gray-500 leading-tight">
                        {user.email}
                      </span>
                    )}
                  </div>

                  <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border border-gray-100">
                <DropdownMenuLabel className="px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}