/**
 * Middleware do Next.js
 * Atualiza a sessão do Supabase em cada requisição
 */

import { createClient } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const redirectCount = request.cookies.get('redirect_count');
  const currentCount = redirectCount ? parseInt(redirectCount.value) : 0;

  try {
    const { supabase, response } = createClient(request);
    response.headers.set('Cache-Control', 'no-store');

    const { data: { session }, error } = await supabase.auth.getSession();
    const hasSession = !!session;

    if (error || !hasSession) {
      if (isLoginPage) {
        if (currentCount > 0) {
          response.cookies.delete('redirect_count');
        }
        return response;
      }

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);

      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete('redirect_count');
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    if (hasSession && isLoginPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';

      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete('redirect_count');
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    const res = response;
    if (currentCount > 0) {
      res.cookies.delete('redirect_count');
    }
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    if (isLoginPage) {
      const res = NextResponse.next();
      res.cookies.delete('redirect_count');
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);

    const res = NextResponse.redirect(redirectUrl);
    res.cookies.delete('redirect_count');
    res.headers.set('Cache-Control', 'no-store');
    return res;
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