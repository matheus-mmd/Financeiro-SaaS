import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
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
 * Componente Topbar - Barra superior com informações do usuário
 * @param {object} user - Dados do usuário
 * @param {boolean} isSidebarCollapsed - Estado do menu lateral
 * @param {function} onToggleSidebar - Função para alternar menu lateral
 * @param {boolean} isMobileSidebarOpen - Estado do menu mobile
 * @param {function} onToggleMobileSidebar - Função para alternar menu mobile
 * @param {function} onLogout - Função para fazer logout
 */
export default function Topbar({ user, isSidebarCollapsed, onToggleSidebar, isMobileSidebarOpen, onToggleMobileSidebar, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button - Sempre visível */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

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

        {/* Global Search */}
        <GlobalSearch />

        {/* User info */}
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-brand-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    {user.email && (
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}