"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  TrendingUp,
  Target,
  BarChart3,
  User,
  X,
} from "lucide-react";

/**
 * Componente Sidebar - Menu lateral de navegação
 * Responsivo: colapsável em mobile, comprimível em desktop
 */
export default function Sidebar({
  isCollapsed = false,
  isOpen = false,
  onClose,
}) {
  const pathname = usePathname();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
    { path: "/despesas", icon: Receipt, label: "Despesas" },
    { path: "/patrimonio-ativos", icon: TrendingUp, label: "Patrimônio e Ativos" },
    { path: "/metas", icon: Target, label: "Metas" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Botão X que acompanha o menu lateral mobile */}
      <button
        onClick={onClose}
        className={`
          lg:hidden fixed top-4 z-50 p-2 bg-white rounded-lg shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? "left-60" : "-left-20"}
        `}
        aria-label="Fechar menu"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`flex items-center h-[72px] border-b border-gray-200 ${
              isCollapsed ? "justify-center px-4" : "px-6"
            }`}
          >
            {!isCollapsed ? (
              <div>
                <h1 className="text-2xl font-bold text-brand-500 leading-tight">
                  Financeiro
                </h1>
                <p className="text-xs text-gray-500 mt-1">Controle Pessoal</p>
              </div>
            ) : (
              <div className="text-2xl font-bold text-brand-500">F</div>
            )}
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-4 space-y-1" aria-label="Menu principal">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-lg
                    transition-colors duration-200
                    ${isCollapsed ? "justify-center px-4 py-3" : "px-4 py-3"}
                    ${
                      active
                        ? "bg-brand-50 text-brand-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © 2025 Financeiro SaaS
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}