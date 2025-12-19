/**
 * Supabase Client para uso no browser (Client Components)
 * Usa @supabase/ssr para Next.js App Router
 *
 * Problema encontrado
 * - Ao trocar de página, o app criava novas instâncias do client
 *   (hot-reloads e boundaries do Next recompilam o módulo),
 *   perdendo a sessão persistida e quebrando as chamadas ao banco.
 *
 * Solução
 * - Guardar a instância em globalThis para reutilizar o mesmo client
 *   em todo o ciclo de vida do app, preservando sessão e listeners.
 */

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

// Evita re-criação do client em hot-reloads ou novas páginas
const getBrowserClient = () => {
  // Guard: durante build/SSR, retorna null para evitar erro de webpack
  if (typeof window === 'undefined') {
    return null;
  }

  const globalScope = typeof globalThis !== 'undefined' ? globalThis : window;

  if (!globalScope.__supabaseClient) {
    const { url, anonKey } = getSupabaseConfig();

    globalScope.__supabaseClient = createBrowserClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return globalScope.__supabaseClient;
};

export function createClient() {
  return getBrowserClient();
}

// Lazy singleton: inicializa apenas quando acessado em runtime (não durante build)
// Usa Proxy para diferir a criação do client até o primeiro acesso de propriedade
let _supabaseInstance = null;

export const supabase = new Proxy({}, {
  get(_, prop) {
    if (!_supabaseInstance) {
      _supabaseInstance = getBrowserClient();
    }
    if (!_supabaseInstance) {
      throw new Error('Supabase client não disponível no servidor. Use apenas em client components.');
    }
    const value = _supabaseInstance[prop];
    return typeof value === 'function' ? value.bind(_supabaseInstance) : value;
  },
});