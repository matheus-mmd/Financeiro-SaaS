/**
 * API do Dashboard - Supabase
 * Queries otimizadas para o dashboard
 */

import { supabase } from '../client';

/**
 * Buscar resumo financeiro de um período
 * @param {string} startDate - Data inicial (YYYY-MM-DD)
 * @param {string} endDate - Data final (YYYY-MM-DD)
 * @returns {Promise<{data, error}>}
 */
export async function getFinancialSummary(startDate, endDate) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('amount, transaction_type_internal_name, transaction_date')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (error) return { data: null, error };

  // Calcular resumo
  const summary = {
    income: 0,
    expense: 0,
    investment: 0,
    balance: 0,
  };

  data.forEach((tx) => {
    const amount = parseFloat(tx.amount);
    if (tx.transaction_type_internal_name === 'income') {
      summary.income += amount;
    } else if (tx.transaction_type_internal_name === 'expense') {
      summary.expense += Math.abs(amount);
    } else if (tx.transaction_type_internal_name === 'investment') {
      summary.investment += Math.abs(amount);
    }
  });

  summary.balance = summary.income - summary.expense - summary.investment;

  return { data: summary, error: null };
}

/**
 * Buscar despesas por categoria
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<{data, error}>}
 */
export async function getExpensesByCategory(startDate, endDate) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('category_id, category_name, category_color, amount')
    .eq('transaction_type_internal_name', 'expense')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (error) return { data: null, error };

  // Agrupar por categoria
  const grouped = data.reduce((acc, tx) => {
    const categoryId = tx.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category_id: categoryId,
        category_name: tx.category_name,
        category_color: tx.category_color,
        total: 0,
      };
    }
    acc[categoryId].total += Math.abs(parseFloat(tx.amount));
    return acc;
  }, {});

  const result = Object.values(grouped).sort((a, b) => b.total - a.total);

  return { data: result, error: null };
}

/**
 * Buscar total de patrimônio
 * @returns {Promise<{data, error}>}
 */
export async function getTotalAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select('value')
    .is('deleted_at', null);

  if (error) return { data: null, error };

  const total = data.reduce((sum, asset) => sum + parseFloat(asset.value), 0);

  return { data: total, error: null };
}

/**
 * Buscar transações recentes
 * @param {number} limit - Número de transações
 * @returns {Promise<{data, error}>}
 */
export async function getRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Buscar progresso de metas
 * @returns {Promise<{data, error}>}
 */
export async function getTargetsProgress() {
  const { data, error } = await supabase
    .from('targets_enriched')
    .select('*')
    .eq('status', 'in_progress')
    .order('deadline', { ascending: true });

  return { data, error };
}

/**
 * Buscar evolução mensal (últimos 6 meses)
 * @returns {Promise<{data, error}>}
 */
export async function getMonthlyEvolution() {
  // Calcular data de 6 meses atrás
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions_enriched')
    .select('amount, transaction_type_internal_name, transaction_date')
    .gte('transaction_date', startDate)
    .order('transaction_date', { ascending: true });

  if (error) return { data: null, error };

  // Agrupar por mês
  const grouped = {};

  data.forEach((tx) => {
    const month = tx.transaction_date.substring(0, 7); // YYYY-MM
    if (!grouped[month]) {
      grouped[month] = { month, income: 0, expense: 0, investment: 0 };
    }

    const amount = parseFloat(tx.amount);
    if (tx.transaction_type_internal_name === 'income') {
      grouped[month].income += amount;
    } else if (tx.transaction_type_internal_name === 'expense') {
      grouped[month].expense += Math.abs(amount);
    } else if (tx.transaction_type_internal_name === 'investment') {
      grouped[month].investment += Math.abs(amount);
    }
  });

  const result = Object.values(grouped).map((m) => ({
    ...m,
    balance: m.income - m.expense - m.investment,
  }));

  return { data: result, error: null };
}
