"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Receipt,
  TrendingUp,
  Target,
  Tag,
  CircleDollarSign,
  X,
} from "lucide-react";

/**
 * Componente Sidebar - Menu lateral de navegação moderno e responsivo
 * Segue padrões de UI/UX modernos (Material UI, Tailwind UI)
 * - Mobile: Overlay que não quebra o layout
 * - Desktop: Sidebar fixa que não causa reflow
 * - Transições suaves e otimizadas
 */
export default function Sidebar({
  isCollapsed = false,
  isOpen = false,
  onClose,
}) {
  const pathname = usePathname();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/transacoes", icon: ArrowRightLeft, label: "Transações" },
    { path: "/despesas", icon: Receipt, label: "Despesas" },
    { path: "/receitas", icon: CircleDollarSign, label: "Receitas" },
    { path: "/patrimonio-ativos", icon: TrendingUp, label: "Patrimônio e Ativos" },
    { path: "/metas", icon: Target, label: "Metas" },
    { path: "/categorias", icon: Tag, label: "Categorias" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Overlay para mobile - aparece quando menu está aberto */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          bg-white border-r border-gray-200
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          w-64
        `}
      >
        {/* Header com Logo */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-gray-200 flex-shrink-0">
          <div className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
            <h1 className="text-2xl font-bold text-brand-500 leading-tight">
              Financeiro
            </h1>
            <p className="text-xs text-gray-500 mt-1">Controle Pessoal</p>
          </div>

          {/* Logo colapsado (desktop) */}
          <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? "" : "lg:hidden"}`}>
            <div className="text-2xl font-bold text-brand-500">F</div>
          </div>

          {/* Botão fechar (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Menu principal">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isCollapsed ? "lg:justify-center lg:px-3" : ""}
                  ${
                    active
                      ? "bg-brand-50 text-brand-600 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                aria-current={active ? "page" : undefined}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`flex-shrink-0 p-4 border-t border-gray-200 transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
          <p className="text-xs text-gray-500 text-center">
            © 2025 Financeiro SaaS
          </p>
        </div>
      </aside>
    </>
  );
}