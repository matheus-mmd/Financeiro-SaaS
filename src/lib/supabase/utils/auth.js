import { supabase } from '../client';

/**
 * Garante que o usuário autenticado seja retornado mesmo após longos períodos
 * em segundo plano (quando o auto refresh pode ter sido pausado pelo navegador).
 * Faz uma segunda tentativa usando getSession para reidratar o estado de auth
 * antes de reportar AUTH_REQUIRED.
 */
export async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    return { user: data.user, error: null };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionData?.session?.user) {
    return { user: sessionData.session.user, error: null };
  }

  return {
    user: null,
    error: sessionError || error || new Error('Usuário não autenticado'),
  };
}