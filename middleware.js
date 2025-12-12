/**
 * Middleware do Next.js
 * Atualiza a sessão do Supabase em cada requisição
 */

import { createClient } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { supabase, response } = createClient(request);

  // Refresh da sessão (se expirada)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Proteger rotas (exceto login)
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!session && !isLoginPage) {
    // Redirecionar para login se não autenticado
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isLoginPage) {
    // Redirecionar para dashboard se já autenticado
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
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
