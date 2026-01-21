/**
 * API de Categorias - Supabase
 */

import { supabase } from '../client';
import { getAuthenticatedUser } from '../utils/auth';

export async function getCategories(filters = {}) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  let query = supabase
    .from('categories_enriched')
    .select(`
      id,
      user_id,
      name,
      color,
      emoji,
      icon_id,
      icon_name,
      transaction_type_id,
      transaction_type_name,
      transaction_type_internal_name,
      created_at
    `)
    .order('name', { ascending: true });

  if (filters.transaction_type_id) {
    query = query.eq('transaction_type_id', filters.transaction_type_id);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from('categories_enriched')
    .select(`
      id,
      user_id,
      name,
      color,
      emoji,
      icon_id,
      icon_name,
      transaction_type_id,
      transaction_type_name,
      transaction_type_internal_name,
      created_at
    `)
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

export async function createCategory(category) {
  // Obter o usuário autenticado
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  // Validar campos obrigatórios
  if (!category.name || !category.transactionTypeId) {
    return {
      data: null,
      error: new Error('Campos obrigatórios faltando: name, transactionTypeId')
    };
  }

  // Garantir que a cor está no formato correto (#RRGGBB)
  let color = category.color || '#6366f1';
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  // Garantir que tem exatamente 7 caracteres (#RRGGBB)
  if (color.length !== 7) {
    color = '#6366f1'; // Usar cor padrão se inválida
  }

  // Preparar dados para inserção
  const insertData = {
    user_id: user.id,
    name: category.name.trim(),
    color: color.toUpperCase(),
    transaction_type_id: category.transactionTypeId,
  };

  // iconId é opcional - se fornecido, usa; caso contrário deixa null
  if (category.iconId) {
    insertData.icon_id = category.iconId;
  }

  // Suporte para emoji - armazenar no campo emoji se existir
  if (category.emoji) {
    insertData.emoji = category.emoji;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(insertData)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function updateCategory(id, updates) {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.transactionTypeId !== undefined) updateData.transaction_type_id = updates.transactionTypeId;

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function deleteCategory(id) {
  const { data, error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

// ============================================
// FUNÇÕES DE REFERÊNCIA (types, statuses, etc.)
// ============================================

export async function getTransactionTypes() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('transaction_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getPaymentStatuses() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('payment_statuses')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getPaymentMethods() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name, requires_card, requires_bank')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getRecurrenceFrequencies() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('recurrence_frequencies')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getAccountTypes() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('account_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getCardTypes() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('card_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getCardBrands() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('card_brands')
    .select('id, name')
    .order('name', { ascending: true });

  return { data, error };
}

export async function getIcons() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('icons')
    .select('id, name')
    .order('name', { ascending: true });

  return { data, error };
}