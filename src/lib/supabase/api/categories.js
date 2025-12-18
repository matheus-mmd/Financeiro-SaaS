/**
 * API de Categorias - Supabase
 */

import { supabase } from '../client';

export async function getCategories(filters = {}) {
  let query = supabase
    .from('categories_enriched')
    .select(`
      id,
      user_id,
      name,
      color,
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const authError = new Error('Usuário não autenticado');
    authError.code = 'AUTH_REQUIRED';
    return { data: null, error: authError };
  }

  // Validar campos obrigatórios
  if (!category.name || !category.color || !category.iconId || !category.transactionTypeId) {
    return {
      data: null,
      error: new Error('Campos obrigatórios faltando: name, color, iconId, transactionTypeId')
    };
  }

  // Garantir que a cor está no formato correto (#RRGGBB)
  let color = category.color;
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  // Garantir que tem exatamente 7 caracteres (#RRGGBB)
  if (color.length !== 7) {
    return {
      data: null,
      error: new Error(`Cor inválida: ${color}. Deve estar no formato #RRGGBB`)
    };
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id, // RLS requer user_id - categorias customizadas
      name: category.name.trim(),
      color: color.toUpperCase(), // Padronizar para maiúsculas
      icon_id: category.iconId,
      transaction_type_id: category.transactionTypeId,
    })
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
  const { data, error } = await supabase
    .from('transaction_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getPaymentStatuses() {
  const { data, error } = await supabase
    .from('payment_statuses')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getRecurrenceFrequencies() {
  const { data, error } = await supabase
    .from('recurrence_frequencies')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getAccountTypes() {
  const { data, error } = await supabase
    .from('account_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getCardTypes() {
  const { data, error } = await supabase
    .from('card_types')
    .select('id, name, internal_name')
    .order('id', { ascending: true });

  return { data, error };
}

export async function getCardBrands() {
  const { data, error } = await supabase
    .from('card_brands')
    .select('id, name')
    .order('name', { ascending: true });

  return { data, error };
}

export async function getIcons() {
  const { data, error } = await supabase
    .from('icons')
    .select('id, name')
    .order('name', { ascending: true });

  return { data, error };
}