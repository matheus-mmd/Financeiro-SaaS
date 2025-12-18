/**
 * API de Transações - Supabase
 * CRUD completo para transactions
 */

import { supabase } from '../client';

/**
 * Buscar todas as transações do usuário (usa VIEW enriched)
 * @param {Object} filters - Filtros opcionais (transaction_type_id, category_id, date_from, date_to, limit, offset)
 * @returns {Promise<{data, error, hasMore}>}
 */
export async function getTransactions(filters = {}) {
  // CORREÇÃO: Adicionar limite padrão e paginação
  const limit = filters.limit || 500; // Limite padrão de 500
  const offset = filters.offset || 0;

  let query = supabase
    .from('transactions_enriched')
    .select(`
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
      transaction_type_name,
      payment_status_id,
      payment_status_internal_name,
      payment_method_id,
      payment_method_name,
      bank_id,
      bank_name,
      card_id,
      card_name,
      installment_number,
      installment_total,
      notes,
      is_recurring,
      recurrence_frequency_id,
      payment_date,
      created_at,
      updated_at
    `)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1); // CORREÇÃO: Paginação

  // Aplicar filtros
  if (filters.transaction_type_id) {
    query = query.eq('transaction_type_id', filters.transaction_type_id);
  }

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.date_from) {
    query = query.gte('transaction_date', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('transaction_date', filters.date_to);
  }

  if (filters.payment_status_id) {
    query = query.eq('payment_status_id', filters.payment_status_id);
  }

  const { data, error } = await query;

  // CORREÇÃO: Retornar informação se há mais dados disponíveis
  return {
    data,
    error,
    hasMore: data ? data.length === limit : false
  };
}

/**
 * Buscar transação por ID
 * @param {number} id
 * @returns {Promise<{data, error}>}
 */
export async function getTransactionById(id) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

/**
 * Criar nova transação
 * @param {Object} transaction
 * @returns {Promise<{data, error}>}
 */
export async function createTransaction(transaction) {
  // Obter o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Usuário não autenticado') };
  }

  // Validar campos obrigatórios
  if (!transaction.categoryId) {
    return { data: null, error: new Error('Categoria é obrigatória') };
  }

  if (!transaction.transactionTypeId) {
    return { data: null, error: new Error('Tipo de transação é obrigatório') };
  }

  if (!transaction.description) {
    return { data: null, error: new Error('Descrição é obrigatória') };
  }

  if (!transaction.amount) {
    return { data: null, error: new Error('Valor é obrigatório') };
  }

  if (!transaction.transactionDate) {
    return { data: null, error: new Error('Data da transação é obrigatória') };
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id, // RLS requer user_id
      category_id: transaction.categoryId,
      transaction_type_id: transaction.transactionTypeId,
      payment_status_id: transaction.statusId || 1, // pending por padrão
      payment_method_id: transaction.paymentMethodId || null,
      bank_id: transaction.bankId || null,
      card_id: transaction.cardId || null,
      description: transaction.description,
      amount: transaction.amount,
      notes: transaction.notes || null,
      transaction_date: transaction.transactionDate,
      payment_date: transaction.paymentDate || null,
      installment_number: transaction.installmentNumber || null,
      installment_total: transaction.installmentTotal || null,
      is_recurring: transaction.isRecurring || false,
      recurrence_frequency_id: transaction.isRecurring ? transaction.recurrenceFrequencyId : null,
      recurrence_end_date: transaction.recurrenceEndDate || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    // Melhorar mensagem de erro para violação de foreign key
    if (error.code === '23503') {
      const detailMatch = error.message.match(/Key \((\w+)\)/);
      const fieldName = detailMatch ? detailMatch[1] : 'campo';

      const fieldMessages = {
        'category_id': 'Categoria selecionada é inválida ou não existe',
        'transaction_type_id': 'Tipo de transação selecionado é inválido',
        'payment_status_id': 'Status de pagamento selecionado é inválido',
        'payment_method_id': 'Forma de pagamento selecionada é inválida',
        'bank_id': 'Banco selecionado não existe',
        'card_id': 'Cartão selecionado não existe',
        'recurrence_frequency_id': 'Frequência de recorrência selecionada é inválida'
      };

      const friendlyMessage = fieldMessages[fieldName] || `Campo ${fieldName} contém um valor inválido`;
      return { data: null, error: new Error(friendlyMessage) };
    }
    return { data: null, error };
  }

  // Se for transação de tipo INVESTMENT (Aporte), criar ativo vinculado
  if (transaction.transactionTypeId === 3 && data) {
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        category_id: transaction.categoryId,
        name: transaction.description,
        description: transaction.notes || null,
        value: Math.abs(transaction.amount), // Valor positivo para o ativo
        yield_rate: 0,
        currency: 'BRL',
        valuation_date: transaction.transactionDate,
        purchase_date: transaction.transactionDate,
        purchase_value: Math.abs(transaction.amount),
        related_transaction_id: data.id, // Vincular à transação
      })
      .select()
      .maybeSingle();

    if (assetError) {
      console.error('[Transactions API] Erro ao criar ativo vinculado:', assetError);
      // Não falha a transação, apenas loga o erro
    } else if (assetData) {
      // Atualizar a transação com o ID do ativo (vínculo bidirecional)
      await supabase
        .from('transactions')
        .update({ related_asset_id: assetData.id })
        .eq('id', data.id);
    }
  }

  return { data, error };
}

/**
 * Atualizar transação
 * @param {number} id
 * @param {Object} updates
 * @returns {Promise<{data, error}>}
 */
export async function updateTransaction(id, updates) {
  const updateData = {};

  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
  if (updates.transactionTypeId !== undefined) updateData.transaction_type_id = updates.transactionTypeId;
  if (updates.statusId !== undefined) updateData.payment_status_id = updates.statusId;
  if (updates.paymentMethodId !== undefined) updateData.payment_method_id = updates.paymentMethodId;
  if (updates.bankId !== undefined) updateData.bank_id = updates.bankId;
  if (updates.cardId !== undefined) updateData.card_id = updates.cardId;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.date !== undefined) updateData.transaction_date = updates.date;
  if (updates.paymentDate !== undefined) updateData.payment_date = updates.paymentDate;
  if (updates.installmentNumber !== undefined) updateData.installment_number = updates.installmentNumber;
  if (updates.installmentTotal !== undefined) updateData.installment_total = updates.installmentTotal;
  if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
  if (updates.recurrenceFrequencyId !== undefined) updateData.recurrence_frequency_id = updates.recurrenceFrequencyId;
  if (updates.recurrenceEndDate !== undefined) updateData.recurrence_end_date = updates.recurrenceEndDate;

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Deletar transação (soft delete)
 * @param {number} id
 * @returns {Promise<{data, error}>}
 */
export async function deleteTransaction(id) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Buscar transações por grupo de parcelamento
 * @param {string} installmentGroupId
 * @returns {Promise<{data, error}>}
 */
export async function getTransactionsByInstallmentGroup(installmentGroupId) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('*')
    .eq('installment_group_id', installmentGroupId)
    .order('installment_number', { ascending: true });

  return { data, error };
}

/**
 * Buscar transações recorrentes
 * @param {number} parentId - ID da transação pai
 * @returns {Promise<{data, error}>}
 */
export async function getRecurringTransactions(parentId) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('*')
    .eq('recurrence_parent_id', parentId)
    .order('transaction_date', { ascending: true });

  return { data, error };
}