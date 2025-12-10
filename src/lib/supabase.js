import { createClient } from '@supabase/supabase-js';

/**
 * Configuração do cliente Supabase
 *
 * Este cliente é usado em toda a aplicação para interagir com:
 * - Banco de dados PostgreSQL
 * - Autenticação de usuários
 * - Storage de arquivos (futuro)
 * - Real-time subscriptions (futuro)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
  );
}

/**
 * Cliente Supabase configurado
 *
 * Uso:
 * import { supabase } from '@/lib/supabase';
 *
 * Exemplos:
 * - Consulta: const { data } = await supabase.from('transactions').select('*');
 * - Inserção: const { data } = await supabase.from('transactions').insert([{ ... }]);
 * - Atualização: const { data } = await supabase.from('transactions').update({ ... }).eq('id', id);
 * - Deleção: const { data } = await supabase.from('transactions').delete().eq('id', id);
 * - Auth: const { data, error } = await supabase.auth.signUp({ email, password });
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
