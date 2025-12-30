/**
 * API de Ativos - Supabase
 * Criar ativo diretamente SEM criar transação
 * (Transações de tipo Patrimônio é que criam ativos automaticamente)
 */

import { supabase } from '../client';
import { getAuthenticatedUser } from '../utils/auth';

export async function getAssets(filters = {}) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  let query = supabase
    .from('assets_enriched')
    .select('*')
    .eq('user_id', user.id)
    .order('valuation_date', { ascending: false })
    .limit(Math.min(filters.limit || 200, 500));

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getAssetById(id) {
  const { data, error } = await supabase
    .from('assets_enriched')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

export async function createAsset(asset) {
  // Obter o usuário autenticado
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  // Validar campos obrigatórios
  if (!asset.categoryId) {
    return { data: null, error: new Error('Categoria é obrigatória') };
  }

  if (!asset.name) {
    return { data: null, error: new Error('Nome é obrigatório') };
  }

  if (asset.value === undefined || asset.value === null) {
    return { data: null, error: new Error('Valor é obrigatório') };
  }

  if (!asset.valuationDate && !asset.date) {
    return { data: null, error: new Error('Data de avaliação é obrigatória') };
  }

  try {
    // Validar que a categoria é do tipo INVESTMENT (transaction_type_id = 3)
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('transaction_type_id')
      .eq('id', asset.categoryId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (categoryError) {
      console.error('[Assets API] Erro ao validar categoria:', categoryError);
      return { data: null, error: new Error('Erro ao validar categoria') };
    }

    if (!categoryData) {
      return { data: null, error: new Error('Categoria não encontrada') };
    }

    if (categoryData.transaction_type_id !== 3) {
      return { data: null, error: new Error('Apenas categorias do tipo Investimento podem ser usadas para ativos') };
    }

    // Criar apenas o ativo (SEM criar transação)
    const insertData = {
      user_id: user.id,
      category_id: asset.categoryId,
      name: asset.name,
      description: asset.description || null,
      value: asset.value,
      yield_rate: asset.yieldRate || 0,
      currency: asset.currency || 'BRL',
      valuation_date: asset.valuationDate || asset.date,
      purchase_date: asset.purchaseDate || null,
      purchase_value: asset.purchaseValue || null,
    };

    console.log('[Assets API] Criando ativo:', insertData);

    const { data: assetResult, error: assetError } = await supabase
      .from('assets')
      .insert(insertData)
      .select()
      .maybeSingle();

    if (assetError) {
      console.error('[Assets API] Erro ao criar ativo:', assetError);
      return { data: null, error: assetError };
    }

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao criar ativo:', error);
    return { data: null, error };
  }
}

export async function updateAsset(id, updates) {
  try {
    // Validar categoria se está sendo atualizada
    if (updates.categoryId !== undefined) {
      const { user, error: authError } = await getAuthenticatedUser();

      if (!user) {
        const error = authError || new Error('Usuário não autenticado');
        error.code = 'AUTH_REQUIRED';
        return { data: null, error };
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('transaction_type_id')
        .eq('id', updates.categoryId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (categoryError) {
        console.error('[Assets API] Erro ao validar categoria:', categoryError);
        return { data: null, error: new Error('Erro ao validar categoria') };
      }

      if (!categoryData) {
        return { data: null, error: new Error('Categoria não encontrada') };
      }

      if (categoryData.transaction_type_id !== 3) {
        return { data: null, error: new Error('Apenas categorias do tipo Investimento podem ser usadas para ativos') };
      }
    }

    // Atualizar apenas o ativo (não mexe em transação)
    const updateData = {};

    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.yieldRate !== undefined) updateData.yield_rate = updates.yieldRate;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.valuationDate !== undefined) updateData.valuation_date = updates.valuationDate;
    if (updates.date !== undefined) updateData.valuation_date = updates.date;
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate;
    if (updates.purchaseValue !== undefined) updateData.purchase_value = updates.purchaseValue;

    const { data: assetResult, error: assetError } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (assetError) throw assetError;

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao atualizar ativo:', error);
    return { data: null, error };
  }
}

export async function deleteAsset(id) {
  try {
    // Soft delete apenas do ativo (não mexe em transação)
    const { data: assetResult, error: assetError } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (assetError) throw assetError;

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao deletar ativo:', error);
    return { data: null, error };
  }
}