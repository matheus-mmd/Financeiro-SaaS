/**
 * Middleware do Next.js
 * Atualiza a sessão do Supabase em cada requisição
 */

import { createClient } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  try {
    const { supabase, response } = createClient(request);
    const pathname = request.nextUrl.pathname;

    console.log('[Middleware] Processando:', pathname);

    // CORREÇÃO: Proteção contra loops de redirecionamento
    const redirectCount = request.cookies.get('redirect_count');
    const currentCount = redirectCount ? parseInt(redirectCount.value) : 0;

    if (currentCount >= 3) {
      console.error('[Middleware] Loop de redirecionamento detectado, permitindo acesso');
      const res = NextResponse.next();
      res.cookies.delete('redirect_count');
      return res;
    }

    // Refresh da sessão (se expirada)
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error('[Middleware] Erro ao obter sessão:', error);
      // Permitir acesso em caso de erro (evitar loop)
      return response;
    }

    // Proteger rotas (exceto login)
    const isLoginPage = pathname === '/login';
    const hasSession = !!session;

    console.log('[Middleware] Sessão:', hasSession ? 'Ativa' : 'Inativa', '| Página:', isLoginPage ? 'Login' : pathname);

    if (!hasSession && !isLoginPage) {
      // Redirecionar para login se não autenticado
      console.log('[Middleware] Redirecionando para login (sem sessão)');
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);

      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set('redirect_count', String(currentCount + 1), { maxAge: 10 });
      return res;
    }

    if (hasSession && isLoginPage) {
      // Redirecionar para dashboard se já autenticado
      console.log('[Middleware] Redirecionando para dashboard (já logado)');
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';

      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set('redirect_count', String(currentCount + 1), { maxAge: 10 });
      return res;
    }

    console.log('[Middleware] Permitindo acesso');
    // Limpar contador quando acesso é permitido
    const res = response;
    if (currentCount > 0) {
      res.cookies.delete('redirect_count');
    }
    return res;
  } catch (error) {
    console.error('[Middleware] Erro inesperado:', error);
    // Em caso de erro, permitir acesso (evitar loop)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};