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

// Durante o build, use valores placeholder se as variáveis não estiverem definidas
// Isso permite que o build seja concluído, mas mostra erro útil em runtime
const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
const url = supabaseUrl || (isBuildTime ? 'https://placeholder.supabase.co' : '');
const key = supabaseAnonKey || (isBuildTime ? 'placeholder-key' : '');

// Validação mais detalhada que só falha em runtime (não durante build)
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    '🚨 Variáveis de ambiente do Supabase não configuradas!\n\n' +
    'Para desenvolvimento local:\n' +
    '1. Copie o arquivo: cp .env.local.example .env.local\n' +
    '2. Preencha com suas credenciais do Supabase\n' +
    '3. Reinicie o servidor: npm run dev\n\n' +
    'Para produção (Vercel/Netlify):\n' +
    '1. Vá nas configurações do projeto\n' +
    '2. Adicione as variáveis de ambiente:\n' +
    '   - NEXT_PUBLIC_SUPABASE_URL\n' +
    '   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    '3. Faça um novo deploy\n\n' +
    'Veja docs/CORS_FIX_GUIDE.md para instruções detalhadas.';

  // Durante build, apenas avise (não quebre o build)
  if (isBuildTime) {
    console.warn('⚠️  Build prosseguindo com credenciais placeholder. Configure as variáveis de ambiente para produção!');
  } else {
    // Em runtime, mostre erro útil mas não quebre imediatamente
    console.error(errorMessage);

    // Se não for build time e não tiver credenciais, avise mas deixe o app tentar inicializar
    // Isso permite que a página de erro/login seja mostrada
    if (typeof window !== 'undefined') {
      // No navegador, mostre um alerta visual
      console.error('❌ Supabase não configurado - a autenticação não funcionará!');
    }
  }
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
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});