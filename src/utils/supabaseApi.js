// Supabase API - Substitui mockApi.js com dados reais do Supabase
import { supabase } from './supabase';

/**
 * Função genérica para buscar dados do Supabase
 * Mantém a mesma interface do fetchMock para compatibilidade
 * @param {string} endpoint - Caminho da API
 * @returns {Promise} - Retorna os dados correspondentes
 */
export const fetchData = async (endpoint) => {
  try {
    let data = null;
    let error = null;

    switch (endpoint) {
      case '/api/expenses': {
        // Busca expenses enriquecidas com nome da categoria
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses_enriched')
          .select('*')
          .order('date', { ascending: false });

        if (expensesError) throw expensesError;

        // Mapeia campos para manter compatibilidade com o código atual
        data = expenses.map(expense => ({
          id: expense.id,
          categoriesId: expense.categories_id, // Mantém nome original do mock
          category: expense.category_name,     // Enriquecido com nome da categoria
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
        }));
        break;
      }

      case '/api/assets': {
        // Busca assets enriquecidos com nome do tipo
        const { data: assets, error: assetsError } = await supabase
          .from('assets_enriched')
          .select('*')
          .order('date', { ascending: false });

        if (assetsError) throw assetsError;

        // Mapeia campos para manter compatibilidade
        data = assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          assetTypesid: asset.asset_types_id, // Mantém nome original do mock
          type: asset.type_name,               // Enriquecido com nome do tipo
          value: asset.value,
          yield: asset.yield,
          currency: asset.currency,
          date: asset.date,
          created_at: asset.created_at,
          updated_at: asset.updated_at,
        }));
        break;
      }

      case '/api/targets': {
        // Busca metas
        const { data: targets, error: targetsError } = await supabase
          .from('targets')
          .select('*')
          .order('date', { ascending: false });

        if (targetsError) throw targetsError;
        data = targets;
        break;
      }

      case '/api/transactions': {
        // Busca transactions enriquecidas com tipo interno (credit/debit/investment)
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions_enriched')
          .select('*')
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Mapeia campos para manter compatibilidade
        data = transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          transactionTypesid: transaction.transaction_types_id, // Mantém nome original
          type: transaction.type, // Já vem como internal_name (credit/debit/investment)
        }));
        break;
      }

      case '/api/categories': {
        // Busca categorias (tabela pública)
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;
        data = categories;
        break;
      }

      case '/api/assetTypes': {
        // Busca tipos de ativos (tabela pública)
        const { data: assetTypes, error: assetTypesError } = await supabase
          .from('asset_types')
          .select('*')
          .order('name');

        if (assetTypesError) throw assetTypesError;
        data = assetTypes;
        break;
      }

      case '/api/transactionTypes': {
        // Busca tipos de transações (tabela pública)
        const { data: transactionTypes, error: transactionTypesError } = await supabase
          .from('transaction_types')
          .select('*')
          .order('id');

        if (transactionTypesError) throw transactionTypesError;
        data = transactionTypes;
        break;
      }

      default:
        throw new Error(`Endpoint ${endpoint} não encontrado`);
    }

    return { data, status: 200 };
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
};

// =====================================================
// FUNÇÕES CRUD PARA EXPENSES
// =====================================================

/**
 * Cria uma nova despesa
 * @param {Object} expense - Dados da despesa
 * @param {string} userId - ID do usuário autenticado (obtido do AuthContext)
 * @returns {Promise<Object>} Despesa criada
 */
export const createExpense = async (expense, userId) => {
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      categories_id: expense.categoriesId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      user_id: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      categories_id: updates.categoriesId,
      title: updates.title,
      amount: updates.amount,
      date: updates.date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA ASSETS
// =====================================================

/**
 * Cria um novo ativo
 * @param {Object} asset - Dados do ativo
 * @param {string} userId - ID do usuário autenticado (obtido do AuthContext)
 * @returns {Promise<Object>} Ativo criado
 */
export const createAsset = async (asset, userId) => {
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('assets')
    .insert([{
      asset_types_id: asset.assetTypesid,
      name: asset.name,
      value: asset.value,
      yield: asset.yield || 0,
      currency: asset.currency || 'BRL',
      date: asset.date,
      user_id: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAsset = async (id, updates) => {
  const { data, error } = await supabase
    .from('assets')
    .update({
      asset_types_id: updates.assetTypesid,
      name: updates.name,
      value: updates.value,
      yield: updates.yield,
      currency: updates.currency,
      date: updates.date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAsset = async (id) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA TARGETS
// =====================================================

/**
 * Cria uma nova meta
 * @param {Object} target - Dados da meta
 * @param {string} userId - ID do usuário autenticado (obtido do AuthContext)
 * @returns {Promise<Object>} Meta criada
 */
export const createTarget = async (target, userId) => {
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('targets')
    .insert([{
      title: target.title,
      goal: target.goal,
      progress: target.progress || 0,
      status: target.status || 'in_progress',
      date: target.date,
      user_id: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTarget = async (id, updates) => {
  const { data, error } = await supabase
    .from('targets')
    .update({
      title: updates.title,
      goal: updates.goal,
      progress: updates.progress,
      status: updates.status,
      date: updates.date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTarget = async (id) => {
  const { error } = await supabase
    .from('targets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA TRANSACTIONS
// =====================================================

/**
 * Cria uma nova transação
 * @param {Object} transaction - Dados da transação
 * @param {string} userId - ID do usuário autenticado (obtido do AuthContext)
 * @returns {Promise<Object>} Transação criada
 */
export const createTransaction = async (transaction, userId) => {
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      transaction_types_id: transaction.transactionTypesid,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      user_id: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      transaction_types_id: updates.transactionTypesid,
      date: updates.date,
      description: updates.description,
      amount: updates.amount,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =====================================================
// FUNÇÕES UTILITÁRIAS (mantidas iguais ao mockApi.js)
// =====================================================

/**
 * Formata valores monetários em BRL
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata datas para pt-BR
 * @param {string} dateString - Data em formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada
 */
export const formatDate = (dateString) => {
  // Separar a string de data para evitar problemas com timezone
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Calcula porcentagem de progresso
 * @param {number} progress - Valor atual
 * @param {number} goal - Valor objetivo
 * @returns {number} - Porcentagem (0-100)
 */
export const calculateProgress = (progress, goal) => {
  if (goal === 0) return 0;
  return Math.min(Math.round((progress / goal) * 100), 100);
};