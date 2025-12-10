/**
 * Script de Migração: mockData.json → Supabase
 *
 * Este script migra todos os dados do arquivo mockData.json para o Supabase.
 *
 * Pré-requisitos:
 * 1. Ter executado o schema SQL no Supabase SQL Editor
 * 2. Ter configurado as variáveis de ambiente no .env.local
 * 3. Ter instalado as dependências (npm install)
 *
 * Como usar:
 * node scripts/migrate-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas.');
  console.error('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Carrega dados do mockData.json
 */
function loadMockData() {
  const mockDataPath = path.join(__dirname, '../src/data/mockData.json');

  if (!fs.existsSync(mockDataPath)) {
    console.error('❌ Erro: Arquivo mockData.json não encontrado em', mockDataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(mockDataPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Migra ícones
 */
async function migrateIcons(icons) {
  console.log('\n📦 Migrando ícones...');

  if (!icons || icons.length === 0) {
    console.log('⚠️  Nenhum ícone para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('icons')
    .upsert(icons, { onConflict: 'id' });

  if (error) {
    console.error('❌ Erro ao migrar ícones:', error.message);
    throw error;
  }

  console.log(`✅ ${icons.length} ícones migrados com sucesso`);
}

/**
 * Migra tipos de transação
 */
async function migrateTransactionTypes(types) {
  console.log('\n📦 Migrando tipos de transação...');

  if (!types || types.length === 0) {
    console.log('⚠️  Nenhum tipo de transação para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('transaction_types')
    .upsert(types, { onConflict: 'id' });

  if (error) {
    console.error('❌ Erro ao migrar tipos de transação:', error.message);
    throw error;
  }

  console.log(`✅ ${types.length} tipos de transação migrados com sucesso`);
}

/**
 * Migra usuários
 */
async function migrateUsers(users) {
  console.log('\n📦 Migrando usuários...');

  if (!users || users.length === 0) {
    console.log('⚠️  Nenhum usuário para migrar');
    return;
  }

  // Nota: Este script não cria usuários no Supabase Auth
  // Apenas insere na tabela users para referência
  // Os usuários devem se registrar via interface da aplicação

  const { data, error } = await supabase
    .from('users')
    .upsert(
      users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar usuários:', error.message);
    throw error;
  }

  console.log(`✅ ${users.length} usuários migrados com sucesso`);
  console.log('⚠️  ATENÇÃO: Os usuários precisam se registrar via interface para criar conta no Supabase Auth');
}

/**
 * Migra categorias
 */
async function migrateCategories(categories) {
  console.log('\n📦 Migrando categorias...');

  if (!categories || categories.length === 0) {
    console.log('⚠️  Nenhuma categoria para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('categories')
    .upsert(
      categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        internal_name: cat.internalName,
        icon_id: cat.iconId,
        user_id: cat.userId || null,
        created_at: cat.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar categorias:', error.message);
    throw error;
  }

  console.log(`✅ ${categories.length} categorias migradas com sucesso`);
}

/**
 * Migra bancos
 */
async function migrateBanks(banks) {
  console.log('\n📦 Migrando bancos...');

  if (!banks || banks.length === 0) {
    console.log('⚠️  Nenhum banco para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('banks')
    .upsert(
      banks.map(bank => ({
        id: bank.id,
        name: bank.name,
        initial_balance: bank.initialBalance || 0,
        current_balance: bank.currentBalance || bank.initialBalance || 0,
        user_id: bank.userId,
        created_at: bank.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar bancos:', error.message);
    throw error;
  }

  console.log(`✅ ${banks.length} bancos migrados com sucesso`);
}

/**
 * Migra cartões
 */
async function migrateCards(cards) {
  console.log('\n📦 Migrando cartões...');

  if (!cards || cards.length === 0) {
    console.log('⚠️  Nenhum cartão para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('cards')
    .upsert(
      cards.map(card => ({
        id: card.id,
        name: card.name,
        limit: card.limit || 0,
        due_day: card.dueDay || 1,
        closing_day: card.closingDay || 1,
        user_id: card.userId,
        created_at: card.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar cartões:', error.message);
    throw error;
  }

  console.log(`✅ ${cards.length} cartões migrados com sucesso`);
}

/**
 * Migra transações
 */
async function migrateTransactions(transactions) {
  console.log('\n📦 Migrando transações...');

  if (!transactions || transactions.length === 0) {
    console.log('⚠️  Nenhuma transação para migrar');
    return;
  }

  // Migrar em lotes de 100 para evitar timeout
  const batchSize = 100;
  let migrated = 0;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('transactions')
      .upsert(
        batch.map(txn => ({
          id: txn.id,
          user_id: txn.userId,
          category_id: txn.categoryId,
          transaction_type_id: txn.transactionTypeId,
          description: txn.description,
          amount: txn.amount,
          date: txn.date,
          notes: txn.notes || null,
          status: txn.status || 'pending',
          payment_method: txn.paymentMethod || null,
          payment_date: txn.paymentDate || null,
          card_id: txn.cardId || null,
          bank_id: txn.bankId || null,
          installment_current: txn.installmentCurrent || null,
          installment_total: txn.installmentTotal || null,
          installment_group_id: txn.installmentGroupId || null,
          is_recurring: txn.isRecurring || false,
          recurrence_frequency: txn.recurrenceFrequency || null,
          created_at: txn.createdAt || new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error(`❌ Erro ao migrar lote ${i / batchSize + 1}:`, error.message);
      throw error;
    }

    migrated += batch.length;
    console.log(`  ⏳ ${migrated}/${transactions.length} transações migradas...`);
  }

  console.log(`✅ ${transactions.length} transações migradas com sucesso`);
}

/**
 * Migra ativos
 */
async function migrateAssets(assets) {
  console.log('\n📦 Migrando ativos...');

  if (!assets || assets.length === 0) {
    console.log('⚠️  Nenhum ativo para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('assets')
    .upsert(
      assets.map(asset => ({
        id: asset.id,
        user_id: asset.userId,
        category_id: asset.categoryId,
        name: asset.name,
        description: asset.description || null,
        value: asset.value,
        purchase_date: asset.purchaseDate || null,
        purchase_value: asset.purchaseValue || null,
        created_at: asset.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar ativos:', error.message);
    throw error;
  }

  console.log(`✅ ${assets.length} ativos migrados com sucesso`);
}

/**
 * Migra metas
 */
async function migrateTargets(targets) {
  console.log('\n📦 Migrando metas...');

  if (!targets || targets.length === 0) {
    console.log('⚠️  Nenhuma meta para migrar');
    return;
  }

  const { data, error } = await supabase
    .from('targets')
    .upsert(
      targets.map(target => ({
        id: target.id,
        user_id: target.userId,
        category_id: target.categoryId || null,
        name: target.name,
        goal: target.goal,
        progress: target.progress || 0,
        deadline: target.deadline || null,
        monthly_target: target.monthlyTarget || null,
        created_at: target.createdAt || new Date().toISOString(),
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('❌ Erro ao migrar metas:', error.message);
    throw error;
  }

  console.log(`✅ ${targets.length} metas migradas com sucesso`);
}

/**
 * Função principal de migração
 */
async function main() {
  console.log('🚀 Iniciando migração de dados para Supabase...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

  try {
    // Carregar dados do mockData.json
    console.log('📖 Carregando mockData.json...');
    const mockData = loadMockData();
    console.log('✅ mockData.json carregado com sucesso\n');

    // Migrar dados na ordem correta (respeitando foreign keys)
    await migrateIcons(mockData.icons);
    await migrateTransactionTypes(mockData.transactionTypes);
    await migrateUsers(mockData.users);
    await migrateCategories(mockData.categories);
    await migrateBanks(mockData.banks);
    await migrateCards(mockData.cards);
    await migrateTransactions(mockData.transactions);
    await migrateAssets(mockData.assets);
    await migrateTargets(mockData.targets);

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Ícones: ${mockData.icons?.length || 0}`);
    console.log(`   Tipos de Transação: ${mockData.transactionTypes?.length || 0}`);
    console.log(`   Usuários: ${mockData.users?.length || 0}`);
    console.log(`   Categorias: ${mockData.categories?.length || 0}`);
    console.log(`   Bancos: ${mockData.banks?.length || 0}`);
    console.log(`   Cartões: ${mockData.cards?.length || 0}`);
    console.log(`   Transações: ${mockData.transactions?.length || 0}`);
    console.log(`   Ativos: ${mockData.assets?.length || 0}`);
    console.log(`   Metas: ${mockData.targets?.length || 0}`);

    console.log('\n⚠️  Próximos passos:');
    console.log('   1. Atualizar AuthContext para usar Supabase Auth');
    console.log('   2. Atualizar API layer para usar Supabase');
    console.log('   3. Testar a aplicação com o banco de dados real');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar migração
main();
