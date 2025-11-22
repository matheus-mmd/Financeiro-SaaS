'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente Layout - Layout principal da aplicação
 * Protege rotas e gerencia autenticação
 */
export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirecionar para login se não autenticado (exceto em rotas públicas)
  React.useEffect(() => {
    console.log('[Layout] useEffect disparado - loading:', loading, 'user:', user?.email, 'isPublicRoute:', isPublicRoute, 'pathname:', pathname);

    // IMPORTANTE: Só redireciona se NÃO estiver carregando E não tiver usuário E não for rota pública
    if (!loading && !user && !isPublicRoute) {
      console.log('[Layout] Redirecionando para /login (sem usuário autenticado)');
      router.replace('/login');
    }
  }, [user, loading, isPublicRoute, router, pathname]);

  // Renderizar rotas públicas sem layout ANTES de verificar loading
  if (isPublicRoute) {
    console.log('[Layout] Renderizando rota pública:', pathname);
    return <>{children}</>;
  }

  // Mostrar loading enquanto verifica autenticação (APENAS para rotas protegidas)
  if (loading) {
    console.log('[Layout] Estado LOADING - mostrando spinner');
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Se não está carregando e não tem usuário, mostra loading enquanto redireciona
  // (o useEffect acima já disparou o redirect)
  if (!user) {
    console.log('[Layout] Sem usuário - aguardando redirect');
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  console.log('[Layout] Renderizando layout completo para usuário:', user.email);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      // Forçar redirecionamento imediato
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tenta redirecionar
      router.replace('/login');
    }
  };

  // Dados do usuário para o Topbar
  const userData = {
    name: profile?.name || user?.email?.split('@')[0] || 'Usuário',
    currency: profile?.currency || 'BRL',
    email: user?.email,
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          user={userData}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
