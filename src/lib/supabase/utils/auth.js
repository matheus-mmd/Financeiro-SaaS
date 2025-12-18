import { supabase } from '../client';

/**
 * Garante que o usuário autenticado seja retornado mesmo após longos períodos
 * em segundo plano (quando o auto refresh pode ter sido pausado pelo navegador).
 * Tenta reidratar a sessão e, caso o access token tenha expirado, força um
 * refresh para evitar AUTH_REQUIRED falsos após trocar de aba ou de tela.
 */
export async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
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
        return { user: null, error: refreshError };
      }

      if (refreshData?.session?.user) {
        return { user: refreshData.session.user, error: null };
      }
    }

    return { user: session.user, error: null };
  }

  // Última tentativa: tentar refresh direto usando refresh_token persistido
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshData?.session?.user) {
    return { user: refreshData.session.user, error: null };
  }

  return {
    user: null,
    error: refreshError || sessionError || error || new Error('Usuário não autenticado'),
  };
}
