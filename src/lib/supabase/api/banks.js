/**
 * API de Bancos - Supabase
 */

import { supabase } from '../client';

export async function getBanks() {
  const { data, error } = await supabase
    .from('banks_enriched')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

export async function getBankById(id) {
  const { data, error } = await supabase
    .from('banks_enriched')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

export async function createBank(bank) {
  // Obter o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const authError = new Error('Usuário não autenticado');
    authError.code = 'AUTH_REQUIRED';
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from('banks')
    .insert({
      user_id: user.id, // RLS requer user_id
      name: bank.name,
      icon_id: bank.iconId,
      color: bank.color,
      agency: bank.agency,
      account: bank.account,
      account_type_id: bank.accountTypeId,
      initial_balance: bank.initialBalance || 0,
      current_balance: bank.currentBalance || bank.initialBalance || 0,
    })
    .select()
    .maybeSingle();

  return { data, error };
}

export async function updateBank(id, updates) {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.agency !== undefined) updateData.agency = updates.agency;
  if (updates.account !== undefined) updateData.account = updates.account;
  if (updates.accountTypeId !== undefined) updateData.account_type_id = updates.accountTypeId;
  if (updates.initialBalance !== undefined) updateData.initial_balance = updates.initialBalance;
  if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('banks')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function deleteBank(id) {
  const { data, error } = await supabase
    .from('banks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}