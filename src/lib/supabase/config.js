/**
 * Leitura centralizada de configuração do Supabase
 * Garante que URL e ANON KEY estejam presentes para evitar requisições
 * sem apikey (HTTP 400) ao navegar entre páginas.
 */

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

export function getSupabaseConfig() {
  // Durante build/SSR, as env vars podem não estar disponíveis
  // O client.js já tem guard para isso, mas garantimos aqui também
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
    // Retorna valores vazios durante SSR - o client.js retornará null de qualquer forma
    return { url, anonKey };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (!url || !anonKey || missing.length) {
    const missingList = missing.length ? ` Faltando: ${missing.join(', ')}` : '';
    throw new Error(
      `Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.${missingList}`
    );
  }

  return { url, anonKey };
}