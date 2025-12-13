
/**
 * Script para aplicar a migration 009: Auto-atribuir categorias padrão
 *
 * Este script aplica a migration que cria um trigger automático para
 * copiar categorias padrão do sistema para novos usuários.
 *
 * Pré-requisitos:
 * 1. Ter configurado as variáveis de ambiente no .env.local
 * 2. Ter instalado as dependências (npm install)
 *
 * Como usar:
 * node scripts/apply-auto-categories-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas.');
  console.error('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Aplica a migration SQL
 */
async function applyMigration() {
  console.log('🚀 Aplicando migration: Auto-atribuir categorias padrão\n');

  const migrationPath = path.join(__dirname, '../supabase/migrations/009_auto_assign_default_categories.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Erro: Arquivo de migration não encontrado em', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  try {
    console.log('📝 Executando SQL...\n');

    // Dividir o SQL em comandos individuais (por ponto-e-vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Pular comentários SQL em bloco
      if (command.startsWith('/*') || command.includes('COMMENT ON')) {
        continue;
      }

      console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: command + ';'
      });

      if (error) {
        // Se a RPC não existir, tentar executar diretamente
        if (error.message.includes('function public.exec_sql') || error.code === '42883') {
          console.log('⚠️  RPC exec_sql não disponível. Use o SQL Editor do Supabase para executar a migration manualmente.');
          console.log('\n📄 SQL da migration:\n');
          console.log(migrationSQL);
          console.log('\n📍 Copie o SQL acima e execute no SQL Editor do Supabase Dashboard');
          console.log('   URL: ' + supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql'));
          process.exit(0);
        }

        throw error;
      }
    }

    console.log('\n✅ Migration aplicada com sucesso!');
    console.log('\n📋 O que foi criado:');
    console.log('   ✓ Função: assign_default_categories_to_user()');
    console.log('   ✓ Trigger: assign_categories_on_user_creation');
    console.log('\n🎯 Agora, quando um novo usuário se registrar:');
    console.log('   1. O trigger será ativado automaticamente');
    console.log('   2. Todas as categorias padrão do sistema serão copiadas para o usuário');
    console.log('   3. O usuário terá suas próprias categorias para editar/personalizar');

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error.message);
    console.log('\n💡 Solução alternativa:');
    console.log('   Execute a migration manualmente no SQL Editor do Supabase:');
    console.log('   1. Acesse: ' + supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql'));
    console.log('   2. Copie o conteúdo de: supabase/migrations/009_auto_assign_default_categories.sql');
    console.log('   3. Cole no SQL Editor e execute');
    process.exit(1);
  }
}

/**
 * Verifica se o trigger está funcionando
 */
async function verifyTrigger() {
  console.log('\n🔍 Verificando se o trigger foi criado...\n');

  try {
    const { data, error } = await supabase
      .from('pg_trigger')
      .select('*')
      .eq('tgname', 'assign_categories_on_user_creation');

    if (error) {
      console.log('⚠️  Não foi possível verificar o trigger automaticamente.');
      console.log('   Verifique manualmente no Supabase Dashboard.');
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Trigger verificado e ativo!');
    } else {
      console.log('⚠️  Trigger não encontrado. Execute a migration manualmente.');
    }
  } catch (error) {
    console.log('⚠️  Erro ao verificar trigger:', error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    await applyMigration();
    // await verifyTrigger(); // Comentado pois pg_trigger pode não estar acessível via RLS
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
main();
