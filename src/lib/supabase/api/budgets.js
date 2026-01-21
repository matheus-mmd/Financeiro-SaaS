/**
 * API de Orçamentos por Categoria - Supabase
 */

import { supabase } from '../client';
import { getAuthenticatedUser } from '../utils/auth';

/**
 * Buscar orçamentos de um período específico
 */
export async function getBudgets(year, month) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: [], error };
  }

  const { data, error } = await supabase
    .from('category_budgets_with_spending')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .order('category_name', { ascending: true });

  return { data, error };
}

/**
 * Buscar um orçamento específico por ID
 */
export async function getBudgetById(id) {
  const { data, error } = await supabase
    .from('category_budgets_with_spending')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

/**
 * Criar um novo orçamento
 */
export async function createBudget(budget) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  // Validar campos obrigatórios
  if (!budget.categoryId || !budget.year || !budget.month || !budget.limitAmount) {
    return {
      data: null,
      error: new Error('Campos obrigatórios faltando: categoryId, year, month, limitAmount')
    };
  }

  const insertData = {
    user_id: user.id,
    category_id: budget.categoryId,
    year: budget.year,
    month: budget.month,
    limit_amount: budget.limitAmount,
    alert_percentage: budget.alertPercentage || 80,
  };

  const { data, error } = await supabase
    .from('category_budgets')
    .insert(insertData)
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Atualizar um orçamento existente
 */
export async function updateBudget(id, updates) {
  const updateData = {};

  if (updates.limitAmount !== undefined) updateData.limit_amount = updates.limitAmount;
  if (updates.alertPercentage !== undefined) updateData.alert_percentage = updates.alertPercentage;

  const { data, error } = await supabase
    .from('category_budgets')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Deletar um orçamento
 */
export async function deleteBudget(id) {
  const { data, error } = await supabase
    .from('category_budgets')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  return { data, error };
}

/**
 * Copiar orçamentos de um mês para outro
 */
export async function copyBudgetsToMonth(fromYear, fromMonth, toYear, toMonth) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  // Buscar orçamentos do mês de origem
  const { data: sourceBudgets, error: fetchError } = await supabase
    .from('category_budgets')
    .select('category_id, limit_amount, alert_percentage')
    .eq('user_id', user.id)
    .eq('year', fromYear)
    .eq('month', fromMonth);

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!sourceBudgets || sourceBudgets.length === 0) {
    return { data: [], error: null };
  }

  // Criar orçamentos para o mês de destino
  const newBudgets = sourceBudgets.map(budget => ({
    user_id: user.id,
    category_id: budget.category_id,
    year: toYear,
    month: toMonth,
    limit_amount: budget.limit_amount,
    alert_percentage: budget.alert_percentage,
  }));

  const { data, error } = await supabase
    .from('category_budgets')
    .upsert(newBudgets, {
      onConflict: 'user_id,category_id,year,month',
      ignoreDuplicates: false,
    })
    .select();

  return { data, error };
}