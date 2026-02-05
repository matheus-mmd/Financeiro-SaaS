/**
 * API de Setup - Supabase
 * Endpoints para configuração inicial do usuário
 */

import { supabase } from '../client';

/**
 * Mapeamento de tipo de renda → nome de categoria padrão (receita)
 */
const INCOME_CATEGORY_MAP = {
  clt: 'Salário Líquido',
  autonomo: 'Projeto/Freela',
  principal: 'Outras Receitas',
};

/**
 * Mapeamento de tipo de despesa fixa → nome de categoria padrão (despesa)
 */
const EXPENSE_CATEGORY_MAP = {
  moradia: 'Moradia',
  servicos_basicos: 'Serviços',
};

/**
 * Verifica se o usuário completou o setup inicial
 * @param {string} userId - ID do usuário
 * @returns {Promise<{completed: boolean, error: Error|null}>}
 */
export async function checkSetupCompleted(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('setup_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Setup API] Erro ao verificar setup:', error);
      return { completed: false, error };
    }

    return { completed: data?.setup_completed || false, error: null };
  } catch (error) {
    console.error('[Setup API] Erro inesperado:', error);
    return { completed: false, error };
  }
}

/**
 * Salva os dados de configuração do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} setupData - Dados do setup
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function saveUserSetup(userId, setupData) {
  try {
    const { workTypes, accountType, members, incomes, fixedExpenses } = setupData;

    // Converte o array de workTypes para string separada por vírgula
    const workTypeString = Array.isArray(workTypes) ? workTypes.join(',') : workTypes;

    // 0. Limpar dados existentes para permitir re-execução do setup
    // Deletar despesas fixas existentes
    await supabase
      .from('user_fixed_expenses')
      .delete()
      .eq('user_id', userId);

    // Deletar rendas existentes
    await supabase
      .from('user_incomes')
      .delete()
      .eq('user_id', userId);

    // Deletar membros existentes
    await supabase
      .from('account_members')
      .delete()
      .eq('user_id', userId);

    // 1. Atualizar perfil do usuário
    const { error: userError } = await supabase
      .from('users')
      .update({
        work_type: workTypeString,
        account_type: accountType,
        setup_completed: true,
        setup_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userError) {
      console.error('[Setup API] Erro ao atualizar usuário:', userError);
      return { success: false, error: { ...userError, step: 'atualizar_perfil' } };
    }

    // 2. Salvar integrantes da conta (se conjunta)
    let insertedMembers = [];
    if (accountType === 'conjunta' && members && members.length > 0) {
      const membersToInsert = members.map(member => {
        // Converte workTypes array para string separada por vírgula
        const workTypeStr = Array.isArray(member.workTypes)
          ? member.workTypes.join(',')
          : (member.workType || null);

        return {
          user_id: userId,
          email: member.email,
          phone: member.phone || null,
          work_type: workTypeStr,
        };
      });

      const { data: membersData, error: membersError } = await supabase
        .from('account_members')
        .insert(membersToInsert)
        .select();

      if (membersError) {
        console.error('[Setup API] Erro ao salvar integrantes:', membersError);
        return { success: false, error: { ...membersError, step: 'salvar_integrantes' } };
      }

      insertedMembers = membersData || [];

      // 3. Salvar rendas dos integrantes
      if (incomes && incomes.length > 0) {
        const memberIncomes = [];

        // Associar cada renda ao membro correto pelo email
        for (const income of incomes) {
          if (income.memberEmail) {
            const member = insertedMembers.find(m => m.email === income.memberEmail);
            if (member) {
              memberIncomes.push({
                user_id: userId,
                member_id: member.id,
                description: income.description || 'Renda principal',
                amount_cents: income.amountCents,
                payment_day: income.paymentDay,
                is_primary: income.isPrimary ?? true,
              });
            }
          }
        }

        if (memberIncomes.length > 0) {
          const { error: memberIncomesError } = await supabase
            .from('user_incomes')
            .insert(memberIncomes);

          if (memberIncomesError) {
            console.error('[Setup API] Erro ao salvar rendas dos integrantes:', memberIncomesError);
            // Não retorna erro aqui pois o setup principal foi salvo
          }
        }
      }
    }

    // 4. Salvar rendas do usuário (pode ter múltiplas baseado nos tipos de trabalho)
    const userIncomes = incomes?.filter(i => !i.memberEmail) || [];
    if (userIncomes.length > 0) {
      const userIncomesToInsert = userIncomes.map((income, index) => ({
        user_id: userId,
        member_id: null,
        description: income.description || 'Renda principal',
        amount_cents: income.amountCents,
        payment_day: income.paymentDay,
        is_primary: index === 0, // Primeira renda é marcada como primária
      }));

      const { error: incomeError } = await supabase
        .from('user_incomes')
        .insert(userIncomesToInsert);

      if (incomeError) {
        console.error('[Setup API] Erro ao salvar rendas do usuário:', incomeError);
        // Não retorna erro aqui pois o setup principal foi salvo
      }
    }

    // 5. Salvar despesas fixas (moradia e serviços básicos)
    if (fixedExpenses && fixedExpenses.length > 0) {
      // Buscar categorias do usuário para vincular category_id
      const categoryNameMap = { moradia: 'Moradia', servicos_basicos: 'Serviços' };
      let userCategories = [];
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name')
          .eq('user_id', userId)
          .eq('transaction_type_id', 2)
          .is('deleted_at', null);
        userCategories = cats || [];
      } catch {
        // Se falhar ao buscar categorias, continua sem category_id
      }

      const expensesToInsert = fixedExpenses.map(expense => {
        // Encontrar o member_id se o responsável não for o titular
        let memberId = null;
        if (expense.responsible && expense.responsible !== 'titular') {
          const member = insertedMembers.find(m => m.email === expense.responsible);
          if (member) {
            memberId = member.id;
          }
        }

        // Vincular à categoria real do sistema
        const targetCategoryName = categoryNameMap[expense.category];
        const matchedCategory = userCategories.find(c => c.name === targetCategoryName);

        return {
          user_id: userId,
          member_id: memberId,
          expense_type: expense.type,
          category: expense.category,
          category_id: matchedCategory?.id || null,
          description: expense.description,
          amount_cents: expense.amountCents,
          due_day: expense.dueDay,
        };
      });

      const { error: expensesError } = await supabase
        .from('user_fixed_expenses')
        .insert(expensesToInsert);

      if (expensesError) {
        console.error('[Setup API] Erro ao salvar despesas fixas:', expensesError);
        // Não retorna erro aqui pois o setup principal foi salvo
      }
    }

    // 6. Criar transações recorrentes a partir dos dados do setup
    // Buscar todas as categorias do usuário para vincular às transações
    let allUserCategories = [];
    try {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, transaction_type_id')
        .eq('user_id', userId)
        .is('deleted_at', null);
      allUserCategories = cats || [];
    } catch {
      console.error('[Setup API] Erro ao buscar categorias para transações');
    }

    if (allUserCategories.length > 0) {
      const now = new Date();
      const transactionsToInsert = [];

      // 6a. Transações de receita (rendas do titular e membros)
      const allIncomes = incomes || [];
      for (const income of allIncomes) {
        if (!income.amountCents || !income.paymentDay) continue;

        const categoryName = INCOME_CATEGORY_MAP[income.incomeType] || 'Outras Receitas';
        const category = allUserCategories.find(
          c => c.name === categoryName && c.transaction_type_id === 1
        );

        if (category) {
          const day = Math.min(income.paymentDay, 28);
          const transactionDate = new Date(now.getFullYear(), now.getMonth(), day);

          transactionsToInsert.push({
            user_id: userId,
            category_id: category.id,
            transaction_type_id: 1, // Receita
            description: income.description || 'Renda',
            amount: income.amountCents / 100,
            transaction_date: transactionDate.toISOString().split('T')[0],
            is_recurring: true,
            recurrence_frequency_id: 3, // Mensal
          });
        }
      }

      // 6b. Transações de despesa (moradia e serviços básicos)
      if (fixedExpenses && fixedExpenses.length > 0) {
        for (const expense of fixedExpenses) {
          if (!expense.amountCents || !expense.dueDay) continue;

          const categoryName = EXPENSE_CATEGORY_MAP[expense.category] || 'Outras Despesas';
          const category = allUserCategories.find(
            c => c.name === categoryName && c.transaction_type_id === 2
          );

          if (category) {
            const day = Math.min(expense.dueDay, 28);
            const transactionDate = new Date(now.getFullYear(), now.getMonth(), day);

            transactionsToInsert.push({
              user_id: userId,
              category_id: category.id,
              transaction_type_id: 2, // Despesa
              description: expense.description,
              amount: -(expense.amountCents / 100),
              transaction_date: transactionDate.toISOString().split('T')[0],
              is_recurring: true,
              recurrence_frequency_id: 3, // Mensal
            });
          }
        }
      }

      // Inserir todas as transações de uma vez
      if (transactionsToInsert.length > 0) {
        const { error: txError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);

        if (txError) {
          console.error('[Setup API] Erro ao criar transações do setup:', txError);
          // Não retorna erro pois o setup principal foi salvo com sucesso
        }
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('[Setup API] Erro inesperado:', error);
    return { success: false, error };
  }
}

/**
 * Busca os dados de setup do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getUserSetup(userId) {
  try {
    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('work_type, account_type, setup_completed, setup_completed_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('[Setup API] Erro ao buscar setup:', userError);
      return { data: null, error: userError };
    }

    // Buscar integrantes
    const { data: members, error: membersError } = await supabase
      .from('account_members')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (membersError) {
      console.error('[Setup API] Erro ao buscar integrantes:', membersError);
    }

    // Buscar rendas
    const { data: incomes, error: incomesError } = await supabase
      .from('user_incomes')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (incomesError) {
      console.error('[Setup API] Erro ao buscar rendas:', incomesError);
    }

    return {
      data: {
        ...user,
        members: members || [],
        incomes: incomes || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('[Setup API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Converte valor em reais para centavos
 * @param {string|number} value - Valor em reais (ex: "5.000,00" ou 5000)
 * @returns {number} - Valor em centavos
 */
export function parseMoneyToCents(value) {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }

  // Remove pontos de milhar e troca vírgula por ponto
  const normalized = String(value)
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

/**
 * Converte centavos para valor em reais formatado
 * @param {number} cents - Valor em centavos
 * @returns {string} - Valor formatado (ex: "5.000,00")
 */
export function formatCentsToMoney(cents) {
  if (!cents && cents !== 0) return '0,00';
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}