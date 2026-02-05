/**
 * Script de Migração de Dados - mockData.json → Supabase
 *
 * Este script migra todos os dados do arquivo mockData.json para o Supabase,
 * fazendo os mapeamentos necessários de strings para IDs.
 *
 * IMPORTANTE: Execute as migrations SQL antes de rodar este script!
 *
 * Uso:
 * node scripts/migrateToSupabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURAÇÃO
// ============================================
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local');
  process.exit(1);
}

// Cliente Supabase com service role (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================
// MAPEAMENTOS
// ============================================

// payment_method string → ID
const paymentMethodMap = {
  'Dinheiro': 1,
  'Pix': 2,
  'Débito Automático': 3,
  'Cartão de Crédito': 4,
  'Cartão de Débito': 5,
  'Boleto': 6,
  'Transferência': 7,
};

// account_type string → ID
const accountTypeMap = {
  'corrente': 1,
  'poupanca': 2,
  'pagamento': 3,
  'investimento': 4,
};

// card_type string → ID
const cardTypeMap = {
  'credito': 1,
  'debito': 2,
  'multiplo': 3,
};

// card_brand string → ID
const cardBrandMap = {
  'Visa': 1,
  'Mastercard': 2,
  'Elo': 3,
  'American Express': 4,
  'Hipercard': 5,
  'Diners Club': 6,
};

// recurrence_frequency string → ID
const recurrenceFrequencyMap = {
  'daily': 1,
  'weekly': 2,
  'monthly': 3,
  'yearly': 4,
};

// target status
const targetStatusMap = {
  'in_progress': 'in_progress',
  'completed': 'completed',
  'cancelled': 'cancelled',
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function logError(message, error) {
  console.error(`[${new Date().toLocaleTimeString()}] ❌ ${message}`);
  if (error) console.error(error);
}

function logSuccess(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ✅ ${message}`);
}

// ============================================
// MIGRAÇÃO DE USERS
// ============================================
async function migrateUsers(mockData) {
  log('Migrando usuários...');

  for (const user of mockData.users) {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    if (error && error.code !== '23505') {
 // 23505 = duplicate key (já existe)
      logError(`Erro ao migrar usuário ${user.email}`, error);
    }
  }

  logSuccess(`${mockData.users.length} usuário(s) migrado(s)`);
}

// ============================================
// MIGRAÇÃO DE BANKS
// ============================================
async function migrateBanks(mockData) {
  log('Migrando bancos...');

  for (const bank of mockData.banks) {
    const { error } = await supabase.from('banks').insert({
      id: bank.id,
      user_id: bank.user_id,
      name: bank.name,
      icon_id: bank.icon_id,
      color: bank.color,
      agency: bank.agency,
      account: bank.account,
      account_type_id: accountTypeMap[bank.account_type] || 1,
      initial_balance: bank.initial_balance,
      current_balance: bank.current_balance,
      created_at: bank.created_at,
      updated_at: bank.updated_at,
      deleted_at: bank.deleted_at,
    });

    if (error && error.code !== '23505') {
      logError(`Erro ao migrar banco ${bank.name}`, error);
    }
  }

  logSuccess(`${mockData.banks.length} banco(s) migrado(s)`);
}

// ============================================
// MIGRAÇÃO DE CARDS
// ============================================
async function migrateCards(mockData) {
  log('Migrando cartões...');

  for (const card of mockData.cards) {
    const { error } = await supabase.from('cards').insert({
      id: card.id,
      user_id: card.user_id,
      name: card.name,
      icon_id: card.icon_id,
      color: card.color,
      card_type_id: cardTypeMap[card.card_type] || 1,
      card_brand_id: cardBrandMap[card.card_brand] || 1,
      bank_id: card.bank_id,
      credit_limit: card.limit,
      closing_day: card.closing_day,
      due_day: card.due_day,
      current_balance: card.current_balance,
      created_at: card.created_at,
      updated_at: card.updated_at,
      deleted_at: card.deleted_at,
    });

    if (error && error.code !== '23505') {
      logError(`Erro ao migrar cartão ${card.name}`, error);
    }
  }

  logSuccess(`${mockData.cards.length} cartão(ões) migrado(s)`);
}

// ============================================
// MIGRAÇÃO DE TRANSACTIONS
// ============================================
async function migrateTransactions(mockData) {
  log('Migrando transações...');

  let migrated = 0;
  let errors = 0;

  for (const tx of mockData.transactions) {
    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      user_id: tx.user_id,
      category_id: tx.category_id,
      transaction_type_id: tx.transaction_type_id,
      payment_method_id: tx.payment_method ? paymentMethodMap[tx.payment_method] : null,
      bank_id: tx.bank_id,
      card_id: tx.card_id,
      description: tx.description,
      amount: tx.amount,
      notes: tx.notes,
      transaction_date: tx.date,
      payment_date: tx.payment_date,
      installment_number: tx.installments?.current,
      installment_total: tx.installments?.total,
      installment_group_id: tx.installment_group_id,
      is_recurring: tx.is_recurring || false,
      recurrence_frequency_id: tx.recurrence_frequency
        ? recurrenceFrequencyMap[tx.recurrence_frequency]
        : null,
      recurrence_end_date: tx.recurrence_end_date,
      recurrence_parent_id: tx.recurrence_parent_id,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
      deleted_at: tx.deleted_at,
    });

    if (error) {
      if (error.code !== '23505') {
        errors++;
        if (errors <= 5) {
          // Mostrar apenas os primeiros 5 erros
          logError(`Erro ao migrar transação ID ${tx.id}`, error);
        }
      }
    } else {
      migrated++;
    }
  }

  if (errors > 5) {
    log(`... e mais ${errors - 5} erro(s) não exibidos`);
  }

  logSuccess(`${migrated}/${mockData.transactions.length} transação(ões) migrada(s)`);
}

// ============================================
// MIGRAÇÃO DE ASSETS
// ============================================
async function migrateAssets(mockData) {
  log('Migrando ativos...');

  for (const asset of mockData.assets) {
    const { error } = await supabase.from('assets').insert({
      id: asset.id,
      user_id: asset.user_id,
      category_id: asset.category_id,
      name: asset.name,
      description: asset.description,
      value: asset.value,
      yield_rate: asset.yield,
      currency: asset.currency,
      valuation_date: asset.date,
      purchase_date: asset.purchase_date,
      purchase_value: asset.purchase_value,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      deleted_at: asset.deleted_at,
    });

    if (error && error.code !== '23505') {
      logError(`Erro ao migrar ativo ${asset.name}`, error);
    }
  }

  logSuccess(`${mockData.assets.length} ativo(s) migrado(s)`);
}

// ============================================
// MIGRAÇÃO DE TARGETS
// ============================================
async function migrateTargets(mockData) {
  log('Migrando metas...');

  for (const target of mockData.targets) {
    const { error } = await supabase.from('targets').insert({
      id: target.id,
      user_id: target.user_id,
      category_id: target.category_id,
      title: target.title,
      goal_amount: target.goal,
      current_amount: target.progress,
      monthly_target: target.monthly_target,
      status: targetStatusMap[target.status] || 'in_progress',
      start_date: target.date,
      deadline: target.deadline,
      created_at: target.created_at,
      updated_at: target.updated_at,
      deleted_at: target.deleted_at,
    });

    if (error && error.code !== '23505') {
      logError(`Erro ao migrar meta ${target.title}`, error);
    }
  }

  logSuccess(`${mockData.targets.length} meta(s) migrada(s)`);
}

// ============================================
// VALIDAÇÃO PÓS-MIGRAÇÃO
// ============================================
async function validateMigration() {
  log('\n📊 Validando migração...\n');

  const tables = [
    'users',
    'banks',
    'cards',
    'transactions',
    'assets',
    'targets',
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      logError(`Erro ao contar registros em ${table}`, error);
    } else {
      log(`  ${table}: ${count} registro(s)`);
    }
  }

  log('');
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
async function main() {
  console.log('\n========================================');
  console.log('🚀 MIGRAÇÃO DE DADOS - mockData.json → Supabase');
  console.log('========================================\n');

  // Ler mockData.json
  const mockDataPath = path.join(__dirname, '../src/data/mockData.json');

  if (!fs.existsSync(mockDataPath)) {
    logError('Arquivo mockData.json não encontrado em src/data/');
    process.exit(1);
  }

  log('Lendo mockData.json...');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
  logSuccess('mockData.json carregado com sucesso');

  console.log('\n📋 Dados a migrar:');
  console.log(`  • ${mockData.users?.length || 0} usuários`);
  console.log(`  • ${mockData.banks?.length || 0} bancos`);
  console.log(`  • ${mockData.cards?.length || 0} cartões`);
  console.log(`  • ${mockData.transactions?.length || 0} transações`);
  console.log(`  • ${mockData.assets?.length || 0} ativos`);
  console.log(`  • ${mockData.targets?.length || 0} metas`);
  console.log('');

  // Migrar em ordem (respeitando foreign keys)
  try {
    await migrateUsers(mockData);
    await migrateBanks(mockData);
    await migrateCards(mockData);
    await migrateTransactions(mockData);
    await migrateAssets(mockData);
    await migrateTargets(mockData);

    // Validar
    await validateMigration();

    console.log('========================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('========================================\n');
  } catch (error) {
    console.log('\n========================================');
    console.log('❌ ERRO NA MIGRAÇÃO');
    console.log('========================================\n');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();
