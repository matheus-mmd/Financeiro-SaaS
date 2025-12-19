/**
 * Leitura centralizada de configuração do Supabase
 * Garante que URL e ANON KEY estejam presentes para evitar requisições
 * sem apikey (HTTP 400) ao navegar entre páginas.
 */

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

  // Nota: process.env[key] dinâmico não funciona no client-side do Next.js
  // Apenas acesso estático (process.env.NEXT_PUBLIC_*) é substituído no build
  if (!url || !anonKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(
      `Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Faltando: ${missing.join(', ')}`
    );
  }

  return { url, anonKey };
}