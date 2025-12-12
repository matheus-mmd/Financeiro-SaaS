/**
 * API de Ativos - Supabase
 * Integrado com Transactions - criar ativo automaticamente cria uma transação de aporte
 */

import { supabase } from '../client';
import { TRANSACTION_TYPE_IDS } from '../../../constants';

export async function getAssets(filters = {}) {
  let query = supabase
    .from('assets_enriched')
    .select('*')
    .order('valuation_date', { ascending: false });

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
    .single();

  return { data, error };
}

export async function createAsset(asset) {
  // Obter o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Usuário não autenticado') };
  }

  try {
    // 1. Primeiro, criar a transação de aporte
    const transactionData = {
      user_id: user.id,
      category_id: asset.categoryId,
      transaction_type_id: TRANSACTION_TYPE_IDS.INVESTMENT, // Tipo: Aporte
      payment_status_id: 2, // Pago (já que o ativo foi adquirido)
      description: `Aporte: ${asset.name}`,
      amount: -Math.abs(asset.purchaseValue || asset.value), // Negativo = saída de dinheiro
      transaction_date: asset.purchaseDate || asset.valuationDate || asset.date,
      notes: asset.description || null,
      payment_method_id: null,
      bank_id: null,
      card_id: null,
      installment_number: null,
      installment_total: null,
      is_recurring: false,
      recurrence_frequency_id: null,
      recurrence_end_date: null,
    };

    const { data: transactionResult, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('[Assets API] Erro ao criar transação:', transactionError);
      throw transactionError;
    }

    // 2. Depois, criar o ativo vinculado à transação
    const { data: assetResult, error: assetError } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        category_id: asset.categoryId,
        name: asset.name,
        description: asset.description,
        value: asset.value,
        yield_rate: asset.yieldRate,
        currency: asset.currency || 'BRL',
        valuation_date: asset.valuationDate || asset.date,
        purchase_date: asset.purchaseDate,
        purchase_value: asset.purchaseValue,
        related_transaction_id: transactionResult.id, // Vincular à transação
      })
      .select()
      .single();

    if (assetError) {
      console.error('[Assets API] Erro ao criar ativo:', assetError);
      // Se falhar ao criar ativo, deletar a transação
      await supabase.from('transactions').delete().eq('id', transactionResult.id);
      throw assetError;
    }

    // 3. Atualizar a transação com o ID do ativo (vínculo bidirecional)
    await supabase
      .from('transactions')
      .update({ related_asset_id: assetResult.id })
      .eq('id', transactionResult.id);

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao criar ativo e transação:', error);
    return { data: null, error };
  }
}

export async function updateAsset(id, updates) {
  try {
    // 1. Buscar o ativo atual para pegar o related_transaction_id
    const { data: currentAsset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Atualizar o ativo
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
      .single();

    if (assetError) throw assetError;

    // 3. Se existe transação vinculada, atualizar ela também
    if (currentAsset.related_transaction_id) {
      const transactionUpdates = {};

      if (updates.categoryId !== undefined) transactionUpdates.category_id = updates.categoryId;
      if (updates.name !== undefined) transactionUpdates.description = `Aporte: ${updates.name}`;
      if (updates.description !== undefined) transactionUpdates.notes = updates.description;
      if (updates.purchaseValue !== undefined || updates.value !== undefined) {
        transactionUpdates.amount = -Math.abs(updates.purchaseValue || updates.value);
      }
      if (updates.purchaseDate !== undefined || updates.valuationDate !== undefined || updates.date !== undefined) {
        transactionUpdates.transaction_date = updates.purchaseDate || updates.valuationDate || updates.date;
      }

      if (Object.keys(transactionUpdates).length > 0) {
        await supabase
          .from('transactions')
          .update(transactionUpdates)
          .eq('id', currentAsset.related_transaction_id);
      }
    }

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao atualizar ativo:', error);
    return { data: null, error };
  }
}

export async function deleteAsset(id) {
  try {
    // 1. Buscar o ativo para pegar o related_transaction_id
    const { data: currentAsset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Soft delete do ativo
    const { data: assetResult, error: assetError } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (assetError) throw assetError;

    // 3. Se existe transação vinculada, deletar ela também (soft delete)
    if (currentAsset.related_transaction_id) {
      await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', currentAsset.related_transaction_id);
    }

    return { data: assetResult, error: null };
  } catch (error) {
    console.error('[Assets API] Erro ao deletar ativo:', error);
    return { data: null, error };
  }
}
