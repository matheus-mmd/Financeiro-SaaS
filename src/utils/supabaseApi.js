/**
 * Supabase API - Camada de API para interagir com o Supabase
 *
 * Esta camada mantém a mesma interface do mockApi.js, permitindo
 * uma migração transparente do mock para o banco de dados real.
 *
 * Uso:
 * import { fetchData, createTransaction, updateTransaction, deleteTransaction } from '@/utils/supabaseApi';
 */

import { supabase } from '../lib/supabase/client';

/**
 * Função helper para enriquecer categoria com ícone
 */
const enrichCategoryWithIcon = async (category) => {
  if (!category) return null;

  const { data: icon } = await supabase
    .from('icons')
    .select('*')
    .eq('id', category.icon_id)
    .single();

  return {
    ...category,
    icon: icon?.name || "Tag",
    icon_name: icon?.name || "Tag",
  };
};

/**
 * Função helper para obter o usuário atual
 */
const getCurrentUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

/**
 * FETCH DATA - Endpoint genérico para buscar dados
 * Compatível com mockApi.js
 */
export const fetchData = async (endpoint) => {
  try {
    const userId = await getCurrentUserId();

    // Mapear endpoints para tabelas
    const endpointMap = {
      '/api/icons': 'icons',
      '/api/expenses': 'transactions_enriched', // CORREÇÃO: Usar VIEW enriquecida
      '/api/incomes': 'transactions_enriched', // CORREÇÃO: Usar VIEW enriquecida
      '/api/assets': 'assets',
      '/api/targets': 'targets',
      '/api/transactions': 'transactions_enriched', // CORREÇÃO: Usar VIEW enriquecida
      '/api/categories': 'categories',
      '/api/transactionTypes': 'transaction_types',
      '/api/banks': 'banks',
      '/api/cards': 'cards',
    };

    const tableName = endpointMap[endpoint];

    if (!tableName) {
      throw new Error(`Endpoint desconhecido: ${endpoint}`);
    }

    // Buscar dados com filtro de usuário quando aplicável
    // CORREÇÃO: Selecionar apenas campos necessários ao invés de '*'
    let selectFields = '*';
    if (tableName === 'transactions_enriched') {
      selectFields = `
        id,
        user_id,
        description,
        amount,
        transaction_date,
        category_id,
        category_name,
        category_color,
        category_icon,
        transaction_type_id,
        transaction_type_internal_name,
        type_name,
        payment_status_internal_name,
        payment_method_name,
        bank_id,
        bank_name,
        card_id,
        card_name,
        installment_number,
        installment_total,
        notes,
        is_recurring,
        created_at
      `;
    }

    let query = supabase.from(tableName).select(selectFields);

    // Adicionar filtro de usuário para tabelas específicas
    const userFilteredTables = ['assets', 'targets', 'transactions', 'transactions_enriched', 'banks', 'cards'];
    if (userFilteredTables.includes(tableName) && userId) {
      query = query.eq('user_id', userId);
    }

    // Filtrar categorias: user_id = null (padrão) ou user_id = userId (customizadas)
    if (tableName === 'categories' && userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    }

    // Filtrar por tipo de transação para expenses e incomes
    if (endpoint === '/api/expenses') {
      query = query.eq('transaction_type_id', 2); // EXPENSE
    } else if (endpoint === '/api/incomes') {
      query = query.eq('transaction_type_id', 1); // INCOME
    }

    // CORREÇÃO: Adicionar limite para evitar carregar milhares de registros
    if (tableName === 'transactions_enriched') {
      query = query.limit(500); // Limite padrão de 500 transações
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error(`[SupabaseAPI] Erro ao buscar ${endpoint}:`, error);
      throw error;
    }

    // Enriquecer dados quando necessário
    let enrichedData = data;

    // CORREÇÃO: Usar transactions_enriched ao invés de fazer N+1 queries
    // Para transações, a VIEW já tem todos os dados necessários via JOINs
    if (tableName === 'transactions') {
      // Dados já vêm enriquecidos da VIEW transactions_enriched
      // Não é necessário fazer queries adicionais
      enrichedData = data.map(transaction => ({
        ...transaction,
        // Os campos já vêm da VIEW, apenas garantimos valores default
        category_name: transaction.category_name || 'Desconhecido',
        category_icon: transaction.category_icon || 'Tag',
        category_color: transaction.category_color || '#6366f1',
        type_name: transaction.type_name || 'Desconhecido',
        type_internal_name: transaction.transaction_type_internal_name || 'unknown',
        bank_name: transaction.bank_name || null,
        card_name: transaction.card_name || null,
      }));
    }

    // Enriquecer categorias com ícones e filtrar escondidas
    if (tableName === 'categories') {
      // Buscar categorias escondidas pelo usuário
      const { data: hiddenCategories } = await supabase
        .from('user_hidden_categories')
        .select('category_id')
        .eq('user_id', userId);

      const hiddenIds = hiddenCategories?.map(h => h.category_id) || [];

      // Filtrar categorias escondidas
      const visibleCategories = data.filter(cat => !hiddenIds.includes(cat.id));

      enrichedData = await Promise.all(
        visibleCategories.map(async (category) => {
          const enriched = await enrichCategoryWithIcon(category);
          return {
            ...enriched,
            is_default: category.user_id === null,
            can_delete: category.user_id !== null,
          };
        })
      );
    }

    // Enriquecer ativos com categoria
    if (tableName === 'assets') {
      enrichedData = await Promise.all(
        data.map(async (asset) => {
          const category = asset.category_id
            ? await supabase.from('categories').select('*').eq('id', asset.category_id).single()
            : { data: null };

          const enrichedCategory = category.data ? await enrichCategoryWithIcon(category.data) : null;

          return {
            ...asset,
            category_name: enrichedCategory?.name || 'Desconhecido',
            category_icon: enrichedCategory?.icon || 'Tag',
          };
        })
      );
    }

    // Enriquecer metas com categoria
    if (tableName === 'targets') {
      enrichedData = await Promise.all(
        data.map(async (target) => {
          const category = target.category_id
            ? await supabase.from('categories').select('*').eq('id', target.category_id).single()
            : { data: null };

          const enrichedCategory = category.data ? await enrichCategoryWithIcon(category.data) : null;

          return {
            ...target,
            category_name: enrichedCategory?.name || null,
            category_icon: enrichedCategory?.icon || null,
          };
        })
      );
    }

    return { data: enrichedData, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro em fetchData:', error);
    return { data: null, error };
  }
};

/**
 * ==========================================
 * TRANSACTIONS (Transações)
 * ==========================================
 */

export const createTransaction = async (transaction, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();

    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          ...transaction,
          user_id: currentUserId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar transação:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar transação:', error);
    return { data: null, error };
  }
};

export const updateTransaction = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar transação:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar transação:', error);
    return { data: null, error };
  }
};

export const deleteTransaction = async (id) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar transação:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar transação:', error);
    return { error };
  }
};

/**
 * ==========================================
 * EXPENSES (Despesas) - Compatibilidade retroativa
 * ==========================================
 */

export const createExpense = async (expense, userId = null) => {
  // Despesas são transações com transaction_type_id = 2 (EXPENSE)
  return createTransaction({
    ...expense,
    transaction_type_id: 2,
    amount: Math.abs(expense.amount) * -1, // Negativo para despesas
  }, userId);
};

export const updateExpense = async (id, updates) => {
  return updateTransaction(id, {
    ...updates,
    amount: updates.amount ? Math.abs(updates.amount) * -1 : undefined,
  });
};

export const deleteExpense = async (id) => {
  return deleteTransaction(id);
};

/**
 * ==========================================
 * INCOMES (Receitas) - Compatibilidade retroativa
 * ==========================================
 */

export const createIncome = async (income, userId = null) => {
  // Receitas são transações com transaction_type_id = 1 (INCOME)
  return createTransaction({
    ...income,
    transaction_type_id: 1,
    amount: Math.abs(income.amount), // Positivo para receitas
  }, userId);
};

export const updateIncome = async (id, updates) => {
  return updateTransaction(id, {
    ...updates,
    amount: updates.amount ? Math.abs(updates.amount) : undefined,
  });
};

export const deleteIncome = async (id) => {
  return deleteTransaction(id);
};

/**
 * ==========================================
 * ASSETS (Ativos/Patrimônio)
 * ==========================================
 */

export const createAsset = async (asset, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();

    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('assets')
      .insert([
        {
          ...asset,
          user_id: currentUserId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar ativo:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar ativo:', error);
    return { data: null, error };
  }
};

export const updateAsset = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar ativo:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar ativo:', error);
    return { data: null, error };
  }
};

export const deleteAsset = async (id) => {
  try {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar ativo:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar ativo:', error);
    return { error };
  }
};

/**
 * ==========================================
 * TARGETS (Metas)
 * ==========================================
 */

export const createTarget = async (target, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();

    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('targets')
      .insert([
        {
          ...target,
          user_id: currentUserId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar meta:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar meta:', error);
    return { data: null, error };
  }
};

export const updateTarget = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('targets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar meta:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar meta:', error);
    return { data: null, error };
  }
};

export const deleteTarget = async (id) => {
  try {
    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar meta:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar meta:', error);
    return { error };
  }
};

/**
 * ==========================================
 * CATEGORIES (Categorias)
 * ==========================================
 */

export const createCategory = async (category) => {
  try {
    const currentUserId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          ...category,
          user_id: currentUserId, // null para categorias padrão, userId para customizadas
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar categoria:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar categoria:', error);
    return { data: null, error };
  }
};

export const updateCategory = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar categoria:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar categoria:', error);
    return { data: null, error };
  }
};

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar categoria:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar categoria:', error);
    return { error };
  }
};

/**
 * ==========================================
 * BANKS (Bancos/Contas)
 * ==========================================
 */

export const createBank = async (bank, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();

    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('banks')
      .insert([
        {
          ...bank,
          user_id: currentUserId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar banco:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar banco:', error);
    return { data: null, error };
  }
};

export const updateBank = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar banco:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar banco:', error);
    return { data: null, error };
  }
};

export const deleteBank = async (id) => {
  try {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar banco:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar banco:', error);
    return { error };
  }
};

/**
 * ==========================================
 * CARDS (Cartões)
 * ==========================================
 */

export const createCard = async (card, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();

    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          ...card,
          user_id: currentUserId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao criar cartão:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao criar cartão:', error);
    return { data: null, error };
  }
};

export const updateCard = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAPI] Erro ao atualizar cartão:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao atualizar cartão:', error);
    return { data: null, error };
  }
};

export const deleteCard = async (id) => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseAPI] Erro ao deletar cartão:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao deletar cartão:', error);
    return { error };
  }
};

/**
 * ==========================================
 * HELPERS - Funções auxiliares específicas
 * ==========================================
 */

/**
 * Adiciona um tipo de transação a uma categoria
 * (Compatibilidade com mockApi.js)
 */
export const addTransactionTypeToCategory = async (categoryId, transactionTypeId) => {
  // No Supabase, isso pode ser implementado com uma junction table
  // Por enquanto, vamos apenas retornar sucesso
  console.warn('[SupabaseAPI] addTransactionTypeToCategory não implementado ainda');
  return { data: null, error: null };
};

/**
 * Remove um tipo de transação de uma categoria
 * (Compatibilidade com mockApi.js)
 */
export const removeTransactionTypeFromCategory = async (categoryId, transactionTypeId) => {
  // No Supabase, isso pode ser implementado com uma junction table
  // Por enquanto, vamos apenas retornar sucesso
  console.warn('[SupabaseAPI] removeTransactionTypeFromCategory não implementado ainda');
  return { data: null, error: null };
};

/**
 * Reseta o banco de dados (não aplicável ao Supabase)
 */
export const resetMockDatabase = () => {
  console.warn('[SupabaseAPI] resetMockDatabase não é aplicável ao Supabase');
  return;
};

/**
 * ==========================================
 * CATEGORY MANAGEMENT - Gestão de Categorias
 * ==========================================
 */

/**
 * Esconder categoria padrão do sistema
 */
export const hideDefaultCategory = async (categoryId) => {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se categoria é padrão
    const { data: category } = await supabase
      .from('categories')
      .select('user_id')
      .eq('id', categoryId)
      .single();

    if (category?.user_id !== null) {
      return {
        data: null,
        error: new Error('Apenas categorias padrão podem ser escondidas')
      };
    }

    // Esconder categoria
    const { data, error } = await supabase
      .from('user_hidden_categories')
      .insert([{ user_id: userId, category_id: categoryId }])
      .select();

    if (error) {
      console.error('[SupabaseAPI] Erro ao esconder categoria:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao esconder categoria:', error);
    return { data: null, error };
  }
};

/**
 * Mostrar categoria padrão (remover de escondidas)
 */
export const showDefaultCategory = async (categoryId) => {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('user_hidden_categories')
      .delete()
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (error) {
      console.error('[SupabaseAPI] Erro ao mostrar categoria:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao mostrar categoria:', error);
    return { error };
  }
};

/**
 * Recuperar todas as categorias padrão
 */
export const restoreDefaultCategories = async () => {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // Remover todas as categorias escondidas
    const { error } = await supabase
      .from('user_hidden_categories')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[SupabaseAPI] Erro ao restaurar categorias:', error);
      throw error;
    }

    // Buscar quantidade de categorias restauradas
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .is('user_id', null)
      .is('deleted_at', null);

    return {
      data: { restored_count: categories?.length || 0 },
      error: null
    };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao restaurar categorias:', error);
    return { data: null, error };
  }
};

/**
 * Listar categorias escondidas pelo usuário
 */
export const getHiddenCategories = async () => {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('user_hidden_categories')
      .select(`
        category_id,
        hidden_at,
        categories (
          id,
          name,
          internal_name,
          icon_id
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[SupabaseAPI] Erro ao buscar categorias escondidas:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('[SupabaseAPI] Erro ao buscar categorias escondidas:', error);
    return { data: null, error };
  }
};