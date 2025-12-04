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
 * Componente Sidebar - Menu lateral de navegação
 *
 * Solução para animação suave:
 * - Ícones ficam sempre fixos na mesma posição
 * - Apenas a largura da sidebar anima
 * - Texto fica oculto por clip (overflow-hidden) sem transição de opacity/width
 * - Estrutura interna fixa, sem justify-center dinâmico
 */
export default function Sidebar({
  isCollapsed = false,
  isOpen = false,
  onClose,
  onToggleCollapse,
}) {
  const pathname = usePathname();

  const menuItems = [
    { path: "/", icon: LayoutGrid, label: "Dashboard" },
    { path: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
    { path: "/despesas", icon: Wallet, label: "Despesas" },
    { path: "/receitas", icon: TrendingUp, label: "Receitas" },
    { path: "/patrimonio-ativos", icon: PiggyBank, label: "Patrimônio" },
    { path: "/metas", icon: Target, label: "Metas" },
    { path: "/categorias", icon: Layers, label: "Categorias" },
  ];

  const isActive = (path) => pathname === path;

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
          bg-white border-r border-gray-200
          flex flex-col
          shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {/* Logo - sempre alinhado à esquerda */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>

            {/* Texto do logo - oculto por overflow quando colapsado */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? "lg:w-0" : "lg:w-40"}
              w-40
            `}>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Financeiro
              </h1>
              <p className="text-xs text-gray-500 whitespace-nowrap -mt-0.5">
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
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
                      group relative flex items-center gap-3 h-11 px-2 rounded-xl
                      transition-colors duration-200
                      ${active
                        ? "bg-brand-50 text-brand-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Ícone - sempre fixo, nunca muda de posição */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                      transition-colors duration-200
                      ${active
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
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

                    {/* Tooltip (colapsado) */}
                    {isCollapsed && (
                      <div className="
                        absolute left-full ml-3 px-3 py-2
                        bg-gray-900 text-white text-sm font-medium
                        rounded-lg shadow-lg whitespace-nowrap z-50
                        opacity-0 pointer-events-none
                        group-hover:opacity-100
                        transition-opacity duration-200
                        hidden lg:block
                      ">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botão de colapsar (desktop) */}
        <div className="hidden lg:block p-3 border-t border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-3 h-11 px-2 w-full rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center
              transition-transform duration-300
              ${isCollapsed ? "rotate-180" : ""}
            `}>
              <ChevronLeft className="w-5 h-5" />
            </div>

            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isCollapsed ? "w-0" : "w-32"}
            `}>
              <span className="text-sm font-medium whitespace-nowrap">
                Recolher menu
              </span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className={`
          flex-shrink-0 px-4 py-3 border-t border-gray-200
          overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:h-0 lg:py-0 lg:border-0 lg:opacity-0" : "h-auto opacity-100"}
        `}>
          <p className="text-xs text-gray-400 text-center whitespace-nowrap">
            © 2025 Financeiro SaaS
          </p>
        </div>
      </aside>
    </>
  );
}