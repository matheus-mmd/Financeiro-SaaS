/**
 * API de Metas - Supabase
 */

import { supabase } from '../client';

export async function getTargets(filters = {}) {
  let query = supabase
    .from('targets_enriched')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getTargetById(id) {
  const { data, error } = await supabase
    .from('targets_enriched')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function createTarget(target) {
  // Obter o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Usuário não autenticado') };
  }

  const { data, error } = await supabase
    .from('targets')
    .insert({
      user_id: user.id, // RLS requer user_id
      category_id: target.categoryId,
      title: target.title,
      description: target.description,
      goal_amount: target.goalAmount,
      current_amount: target.currentAmount || 0,
      monthly_target: target.monthlyTarget,
      status: target.status || 'in_progress',
      start_date: target.startDate,
      deadline: target.deadline,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateTarget(id, updates) {
  const updateData = {};

  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.goalAmount !== undefined) updateData.goal_amount = updates.goalAmount;
  if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
  if (updates.monthlyTarget !== undefined) updateData.monthly_target = updates.monthlyTarget;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.deadline !== undefined) updateData.deadline = updates.deadline;

  const { data, error } = await supabase
    .from('targets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteTarget(id) {
  const { data, error } = await supabase
    .from('targets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
