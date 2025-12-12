/**
 * API de Cartões - Supabase
 */

import { supabase } from '../client';

export async function getCards() {
  const { data, error } = await supabase
    .from('cards_enriched')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

export async function getCardById(id) {
  const { data, error } = await supabase
    .from('cards_enriched')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

export async function createCard(card) {
  // Obter o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Usuário não autenticado') };
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: user.id, // RLS requer user_id
      name: card.name,
      icon_id: card.iconId,
      color: card.color,
      card_type_id: card.cardTypeId,
      card_brand_id: card.cardBrandId,
      bank_id: card.bankId,
      credit_limit: card.creditLimit,
      closing_day: card.closingDay,
      due_day: card.dueDay,
      current_balance: card.currentBalance || 0,
    })
    .select()
    .maybeSingle();

  return { data, error };
}

export async function updateCard(id, updates) {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.cardTypeId !== undefined) updateData.card_type_id = updates.cardTypeId;
  if (updates.cardBrandId !== undefined) updateData.card_brand_id = updates.cardBrandId;
  if (updates.bankId !== undefined) updateData.bank_id = updates.bankId;
  if (updates.creditLimit !== undefined) updateData.credit_limit = updates.creditLimit;
  if (updates.closingDay !== undefined) updateData.closing_day = updates.closingDay;
  if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;
  if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function deleteCard(id) {
  const { data, error } = await supabase
    .from('cards')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}