console.log('🔶 [supabase.js] ===== MÓDULO INICIANDO =====');

import { createClient } from '@supabase/supabase-js';

console.log('🔶 [supabase.js] @supabase/supabase-js importado OK');

// Inicializa o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔶 [supabase.js] supabaseUrl:', supabaseUrl || 'UNDEFINED/NULL');
console.log('🔶 [supabase.js] supabaseAnonKey:', supabaseAnonKey ? 'DEFINIDO (len=' + supabaseAnonKey.length + ')' : 'UNDEFINED/NULL');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥💥💥 [supabase.js] ERRO: Variáveis de ambiente faltando!');
  throw new Error(
    'Faltam variáveis de ambiente do Supabase. ' +
    'Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY configurados.'
  );
}

console.log('🔶 [supabase.js] Criando cliente Supabase...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

console.log('✅ [supabase.js] Cliente Supabase criado com sucesso');
console.log('✅ [supabase.js] supabase.auth:', supabase.auth ? 'VÁLIDO' : 'INVÁLIDO');
