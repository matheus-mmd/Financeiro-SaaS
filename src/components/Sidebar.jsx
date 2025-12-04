"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Target,
  Layers,
  PiggyBank,
  X,
  ChevronLeft,
} from "lucide-react";

/**
 * Componente Sidebar - Menu lateral de navegação moderno e responsivo
 *
 * Implementa padrões de UI/UX modernos:
 * - Animação suave sem quebra de texto usando width fixo + overflow-hidden
 * - Mobile: Overlay com transição slide-in
 * - Desktop: Sidebar com transição de largura suave
 * - Ícones tooltips quando colapsado
 */
export default function Sidebar({
  isCollapsed = false,
  isOpen = false,
  onClose,
  onToggleCollapse,
}) {
  const pathname = usePathname();

  // Menu items com ícones modernos e consistentes
  const menuItems = [
    {
      path: "/",
      icon: LayoutGrid,
      label: "Dashboard",
      description: "Visão geral"
    },
    {
      path: "/transacoes",
      icon: ArrowLeftRight,
      label: "Transações",
      description: "Movimentações"
    },
    {
      path: "/despesas",
      icon: Wallet,
      label: "Despesas",
      description: "Gastos"
    },
    {
      path: "/receitas",
      icon: TrendingUp,
      label: "Receitas",
      description: "Entradas"
    },
    {
      path: "/patrimonio-ativos",
      icon: PiggyBank,
      label: "Patrimônio",
      description: "Ativos"
    },
    {
      path: "/metas",
      icon: Target,
      label: "Metas",
      description: "Objetivos"
    },
    {
      path: "/categorias",
      icon: Layers,
      label: "Categorias",
      description: "Organização"
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Overlay para mobile - fade in/out suave */}
      <div
        className={`
          lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40
          transition-opacity duration-300 ease-out
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Principal */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white border-r border-gray-100
          flex flex-col
          shadow-xl lg:shadow-none
          transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          w-72
        `}
      >
        {/* Header com Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <div className={`
            flex items-center gap-3 overflow-hidden
            transition-all duration-300 ease-out
            ${isCollapsed ? "lg:w-10 lg:justify-center" : "w-full"}
          `}>
            {/* Logo Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <span className="text-white font-bold text-lg">F</span>
            </div>

            {/* Logo Text - fades out instead of breaking */}
            <div className={`
              flex flex-col min-w-0 overflow-hidden
              transition-all duration-300 ease-out
              ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}
            `}>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Financeiro
              </h1>
              <p className="text-[10px] text-gray-500 whitespace-nowrap -mt-0.5">
                Controle Pessoal
              </p>
            </div>
          </div>

          {/* Botão fechar (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3" aria-label="Menu principal">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 ease-out
                      ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
                      ${
                        active
                          ? "bg-brand-50 text-brand-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Icon container com indicador ativo */}
                    <div className={`
                      relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                      transition-all duration-200 ease-out
                      ${active
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                      }
                    `}>
                      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                    </div>

                    {/* Label com transição suave */}
                    <div className={`
                      flex flex-col min-w-0 overflow-hidden
                      transition-all duration-300 ease-out
                      ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}
                    `}>
                      <span className={`
                        text-sm whitespace-nowrap
                        ${active ? "font-semibold" : "font-medium"}
                      `}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap -mt-0.5">
                        {item.description}
                      </span>
                    </div>

                    {/* Indicador de item ativo */}
                    {active && (
                      <div className={`
                        absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8
                        bg-brand-500 rounded-l-full
                        transition-all duration-200
                        ${isCollapsed ? "lg:hidden" : ""}
                      `} />
                    )}

                    {/* Tooltip para modo colapsado (desktop only) */}
                    <div className={`
                      absolute left-full ml-3 px-3 py-2
                      bg-gray-900 text-white text-sm font-medium
                      rounded-lg shadow-lg
                      opacity-0 pointer-events-none
                      transition-all duration-200
                      whitespace-nowrap z-50
                      ${isCollapsed ? "lg:group-hover:opacity-100" : "lg:hidden"}
                    `}>
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
                        border-4 border-transparent border-r-gray-900" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botão de colapsar (desktop only) */}
        <div className="hidden lg:block p-3 border-t border-gray-100">
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-gray-500 hover:bg-gray-50 hover:text-gray-700
              transition-all duration-200 ease-out
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <div className={`
              w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center
              transition-transform duration-300 ease-out
              ${isCollapsed ? "rotate-180" : ""}
            `}>
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className={`
              text-sm font-medium whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-out
              ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}>
              Recolher menu
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className={`
          flex-shrink-0 px-4 py-3 border-t border-gray-100
          overflow-hidden
          transition-all duration-300 ease-out
          ${isCollapsed ? "lg:opacity-0 lg:h-0 lg:py-0 lg:border-0" : "opacity-100"}
        `}>
          <p className="text-[10px] text-gray-400 text-center whitespace-nowrap">
            © 2025 Financeiro SaaS
          </p>
        </div>
      </aside>
    </>
  );
}