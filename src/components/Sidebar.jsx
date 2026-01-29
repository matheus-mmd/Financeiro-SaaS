"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  ArrowLeftRight,
  Target,
  Layers,
  PiggyBank,
  X,
  Landmark,
  Receipt,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, User, Mail } from "lucide-react";
import { prefetchRoute } from "../lib/prefetch";

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

export default function Sidebar({
  isCollapsed = false,
  isOpen = false,
  onClose,
  user = null,
  onLogout,
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Handler para prefetch de dados ao passar o mouse no link
  const handleMouseEnter = useCallback((path) => {
    // Prefetch da rota Next.js
    router.prefetch(path);
    // Prefetch dos dados da rota
    prefetchRoute(path);
  }, [router]);

  const menuItems = [
    { path: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { path: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
    { path: "/patrimonio-ativos", icon: PiggyBank, label: "Patrimônio" },
    { path: "/metas", icon: Target, label: "Metas" },
    { path: "/contas", icon: Landmark, label: "Contas" },
    { path: "/categorias", icon: Layers, label: "Categorias" },
    { path: "/orcamento-categoria", icon: Receipt, label: "Orçamento" },
    { path: "/configuracoes", icon: Settings, label: "Configurações" },
  ];

  const isActive = (path) => pathname === path;

  // Largura colapsada: 72px, Ícone: 40px, Padding: (72-40)/2 = 16px (px-4)
  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`
          lg:hidden fixed inset-0 bg-black/50 z-40
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
          flex flex-col
          shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo icon - sempre fixo */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>

            {/* Logo texto - oculto por overflow */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? "lg:w-0" : "lg:w-40"}
              w-40
            `}>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                Financeiro
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap -mt-0.5">
                Controle Pessoal
              </p>
            </div>
          </div>

          {/* Botão fechar (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <TooltipProvider delayDuration={200}>
            <ul className="space-y-1 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.path}
                          onClick={onClose}
                          onMouseEnter={() => handleMouseEnter(item.path)}
                          className={`
                            group relative flex items-center gap-3 h-11 rounded-xl
                            transition-colors duration-200
                            ${active
                              ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                            }
                          `}
                          aria-current={active ? "page" : undefined}
                        >
                          {/* Ícone - posição fixa, sempre centralizado */}
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                            transition-colors duration-200
                            ${active
                              ? "bg-brand-500 text-white"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-slate-600"
                            }
                          `}>
                            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                          </div>

                          {/* Label - oculto por overflow quando colapsado */}
                          <div className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${isCollapsed ? "lg:w-0" : "lg:w-32"}
                            w-32
                          `}>
                            <span className={`
                              text-sm whitespace-nowrap block
                              ${active ? "font-semibold" : "font-medium"}
                            `}>
                              {item.label}
                            </span>
                          </div>

                          {/* Indicador ativo */}
                          {active && !isCollapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-l-full hidden lg:block" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Informações do usuário e Logout */}
        {user && (
          <div className={`
            flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-slate-700
            transition-all duration-300 ease-in-out
          `}>
            {/* Quando colapsado: Avatar clicável com dropdown */}
            {isCollapsed ? (
              <div className="hidden lg:flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full">
                      <Avatar className="w-10 h-10 ring-2 ring-gray-100 dark:ring-slate-700 cursor-pointer hover:ring-brand-300 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        {user.email && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Quando expandido: Layout normal */
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10 ring-2 ring-gray-100 dark:ring-slate-700 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Nome e Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Botão Logout */}
                <button
                  onClick={onLogout}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}