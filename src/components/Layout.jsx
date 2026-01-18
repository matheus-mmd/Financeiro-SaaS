'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Componente Layout - Layout principal da aplicação
 * Protege rotas e gerencia autenticação
 */
export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Inicia fechado
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/', '/esqueci-senha', '/redefinir-senha', '/politica-privacidade', '/escolher-plano'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Fechar sidebar mobile ao mudar de rota
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // CORREÇÃO: Removidos useEffect de redirecionamento que causavam loops
  // O middleware.js já cuida da proteção server-side, proteção client-side
  // causa race conditions e loops infinitos quando combinadas
  //
  // REMOVIDOS:
  // - Timeout de segurança (causava redirecionamento prematuro)
  // - Redirecionamento client-side (duplicava proteção do middleware)

  // Redirecionar para página inicial quando autenticação já foi verificada e não há usuário
  useEffect(() => {
    if (!isPublicRoute && !loading && !user) {
      router.replace('/');
    }
  }, [isPublicRoute, loading, user, router]);

  // Renderizar rotas públicas sem layout ANTES de verificar loading
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Mostrar loading enquanto verifica autenticação (APENAS para rotas protegidas)
  if (loading && !isPublicRoute) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-400 animate-ping" />
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!loading && !user) {
    router.replace('/');
    return <div className="h-screen w-full bg-bg" />;
  }

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      // Redirecionar para página inicial que vai para /landing
      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tenta redirecionar
      router.replace('/');
    }
  };

  // Dados do usuário para o Topbar
  const userData = {
    name: profile?.name || user?.email?.split('@')[0] || 'Usuário',
    currency: profile?.currency || 'BRL',
    email: user?.email,
  };

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        user={userData}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}