import { supabase } from '../client';

/**
 * Cache de autenticação para evitar múltiplas chamadas ao Supabase Auth
 */
let cachedUser = null;
let cacheTimestamp = 0;
const AUTH_CACHE_TTL = 60000; // 1 minuto

/**
 * Limpa o cache de autenticação (usar no logout ou quando necessário forçar refresh)
 */
export function clearAuthCache() {
  cachedUser = null;
  cacheTimestamp = 0;
}

/**
 * Atualiza o cache de autenticação manualmente
 */
export function updateAuthCache(user) {
  if (user) {
    cachedUser = user;
    cacheTimestamp = Date.now();
  } else {
    clearAuthCache();
  }
}

/**
 * Garante que o usuário autenticado seja retornado mesmo após longos períodos
 * em segundo plano (quando o auto refresh pode ter sido pausado pelo navegador).
 * Implementa cache para evitar chamadas repetidas ao Supabase Auth.
 */
export async function getAuthenticatedUser() {
  const now = Date.now();

  // Retorna do cache se ainda válido
  if (cachedUser && (now - cacheTimestamp) < AUTH_CACHE_TTL) {
    return { user: cachedUser, error: null };
  }

  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    // Atualiza cache
    cachedUser = data.user;
    cacheTimestamp = now;
    return { user: data.user, error: null };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (session?.user) {
    const expiresAtMs = session.expires_at ? session.expires_at * 1000 : null;

    // Se o token já expirou (ou está muito perto de expirar), forçar refresh
    if (expiresAtMs && expiresAtMs <= Date.now() + 1000) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        clearAuthCache();
        return { user: null, error: refreshError };
      }

      if (refreshData?.session?.user) {
        // Atualiza cache
        cachedUser = refreshData.session.user;
        cacheTimestamp = Date.now();
        return { user: refreshData.session.user, error: null };
      }
    }

    // Atualiza cache
    cachedUser = session.user;
    cacheTimestamp = Date.now();
    return { user: session.user, error: null };
  }

  // Última tentativa: tentar refresh direto usando refresh_token persistido
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshData?.session?.user) {
    // Atualiza cache
    cachedUser = refreshData.session.user;
    cacheTimestamp = Date.now();
    return { user: refreshData.session.user, error: null };
  }

  clearAuthCache();
  return {
    user: null,
    error: refreshError || sessionError || error || new Error('Usuário não autenticado'),
  };
}