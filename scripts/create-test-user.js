/**
 * Script: Criar Usuário de Teste
 *
 * Este script cria um usuário completo no Supabase:
 * 1. Cria usuário no Supabase Auth
 * 2. Cria perfil na tabela users
 *
 * Como usar:
 * node scripts/create-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

// Cliente Supabase para operações admin
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('🚀 Criando usuário de teste...\n');

  const email = 'teste@exemplo.com';
  const password = 'senha123';
  const name = 'Usuário Teste';

  try {
    // 1. Criar usuário no Supabase Auth
    console.log('📧 Criando usuário no Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) {
      // Se o usuário já existe, tente fazer login para obter o ID
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe no Auth. Fazendo login para obter ID...');

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw new Error(`Erro ao fazer login: ${signInError.message}`);
        }

        console.log('✅ Login bem-sucedido!');
        console.log('📝 ID do usuário:', signInData.user.id);

        // Tentar criar perfil
        await createUserProfile(signInData.user.id, email, name);
        return;
      }

      throw authError;
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado no Auth');
    }

    console.log('✅ Usuário criado no Auth!');
    console.log('📝 ID do usuário:', authData.user.id);
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);

    // 2. Criar perfil na tabela users
    await createUserProfile(authData.user.id, email, name);

    console.log('\n✅ Usuário de teste criado com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n🚀 Agora você pode fazer login na aplicação!');

  } catch (error) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function createUserProfile(userId, email, name) {
  console.log('\n👤 Criando perfil na tabela users...');

  // Fazer login como admin para inserir dados
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .upsert([
      {
        id: userId,
        email: email,
        name: name,
      },
    ])
    .select()
    .single();

  if (profileError) {
    console.error('⚠️  Erro ao criar perfil na tabela users:', profileError.message);
    console.error('   Você pode precisar criar o perfil manualmente no Supabase Dashboard');
    console.error(`   Execute este SQL:\n`);
    console.error(`   INSERT INTO public.users (id, email, name)`);
    console.error(`   VALUES ('${userId}', '${email}', '${name}');`);
  } else {
    console.log('✅ Perfil criado na tabela users!');
  }
}

// Executar
createTestUser();
