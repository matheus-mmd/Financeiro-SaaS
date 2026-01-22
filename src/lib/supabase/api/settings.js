/**
 * API de Configurações - Supabase
 * Endpoints para gerenciamento de configurações do usuário
 */

import { supabase } from '../client';
import { getAuthenticatedUser } from '../utils/auth';

/**
 * Busca dados completos do usuário para configurações
 */
export async function getUserSettings() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        phone,
        work_type,
        account_type,
        created_at,
        trial_ends_at,
        subscription_status,
        push_notifications_enabled,
        dark_mode_enabled
      `)
      .eq('id', user.id)
      .maybeSingle();

    if (userError) {
      console.error('[Settings API] Erro ao buscar usuário:', userError);
      return { data: null, error: userError };
    }

    // Buscar integrantes da conta conjunta
    const { data: members, error: membersError } = await supabase
      .from('account_members')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (membersError) {
      console.error('[Settings API] Erro ao buscar integrantes:', membersError);
    }

    return {
      data: {
        ...userData,
        members: members || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza informações pessoais do usuário
 */
export async function updateUserInfo(updates) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    const allowedFields = ['name', 'phone'];
    const updateData = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Settings API] Erro ao atualizar usuário:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza preferências do app
 */
export async function updatePreferences(preferences) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    const allowedFields = ['push_notifications_enabled', 'dark_mode_enabled'];
    const updateData = {};

    for (const field of allowedFields) {
      if (preferences[field] !== undefined) {
        updateData[field] = preferences[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Settings API] Erro ao atualizar preferências:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Adiciona um integrante à conta conjunta
 */
export async function addAccountMember(member) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    const workTypeStr = Array.isArray(member.workTypes)
      ? member.workTypes.join(',')
      : (member.workType || 'clt');

    const { data, error } = await supabase
      .from('account_members')
      .insert({
        user_id: user.id,
        name: member.name,
        email: member.email,
        phone: member.phone || null,
        work_type: workTypeStr,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Settings API] Erro ao adicionar integrante:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza um integrante da conta conjunta
 */
export async function updateAccountMember(memberId, updates) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    const updateData = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.workTypes !== undefined) {
      updateData.work_type = Array.isArray(updates.workTypes)
        ? updates.workTypes.join(',')
        : updates.workTypes;
    }
    if (updates.workType !== undefined) {
      updateData.work_type = updates.workType;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('account_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Settings API] Erro ao atualizar integrante:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Remove um integrante da conta conjunta
 */
export async function removeAccountMember(memberId) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { data: null, error };
  }

  try {
    const { data, error } = await supabase
      .from('account_members')
      .delete()
      .eq('id', memberId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Settings API] Erro ao remover integrante:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Reseta todos os dados da conta (exceto perfil)
 */
export async function resetAccount() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    const error = authError || new Error('Usuário não autenticado');
    error.code = 'AUTH_REQUIRED';
    return { success: false, error };
  }

  try {
    // Ordem de deleção para respeitar foreign keys
    const tablesToReset = [
      'transactions',
      'card_bills',
      'cards',
      'bank_accounts',
      'assets',
      'targets',
      'category_budgets',
      'user_incomes',
      'user_fixed_expenses',
      'account_members',
    ];

    for (const table of tablesToReset) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error(`[Settings API] Erro ao limpar ${table}:`, error);
        // Continua mesmo com erro em algumas tabelas
      }
    }

    // Resetar setup_completed para false
    await supabase
      .from('users')
      .update({
        setup_completed: false,
        setup_completed_at: null,
        account_type: 'individual',
        work_type: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return { success: true, error: null };
  } catch (error) {
    console.error('[Settings API] Erro inesperado ao resetar conta:', error);
    return { success: false, error };
  }
}

/**
 * Calcula dias restantes do trial
 */
export function calculateTrialDaysRemaining(trialEndsAt) {
  if (!trialEndsAt) return 0;

  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Formata status da assinatura para exibição
 */
export function formatSubscriptionStatus(status, trialEndsAt) {
  const daysRemaining = calculateTrialDaysRemaining(trialEndsAt);

  switch (status) {
    case 'trial':
      if (daysRemaining <= 0) {
        return { label: 'Período de Teste Expirado', color: 'red', expired: true };
      }
      return {
        label: 'Período de Teste',
        color: 'yellow',
        daysRemaining,
        expired: false
      };
    case 'active':
      return { label: 'Plano Ativo', color: 'green', expired: false };
    case 'expired':
      return { label: 'Plano Expirado', color: 'red', expired: true };
    case 'cancelled':
      return { label: 'Plano Cancelado', color: 'gray', expired: true };
    default:
      return { label: 'Desconhecido', color: 'gray', expired: false };
  }
}