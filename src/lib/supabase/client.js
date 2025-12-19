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

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    const message =
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.';
    throw new Error(message);
  }

  return { url, anonKey };
};

// Evita re-criação do client em hot-reloads ou novas páginas
const getBrowserClient = () => {
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

// Singleton instance para uso direto
export const supabase = getBrowserClient();