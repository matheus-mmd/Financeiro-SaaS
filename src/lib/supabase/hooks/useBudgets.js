/**
 * Hook para gerenciar orçamentos por categoria
 * Com atualizações otimistas e cache para melhor UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  copyBudgetsToMonth,
} from '../api/budgets';
import { budgetsCache } from '../../cache/cacheFactory';

/**
 * Gera chave de cache para um mês específico
 */
const getCacheKey = (year, month) => `${year}-${month}`;

export function useBudgets(year, month) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadBudgets = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;
    if (!year || !month) return;

    const cacheKey = getCacheKey(year, month);

    // Tentar carregar do cache primeiro (stale-while-revalidate)
    const cached = budgetsCache.get(cacheKey);
    if (cached?.data) {
      setBudgets(cached.data);
      // Se o cache não está stale, não precisa recarregar
      if (!cached.isStale && !skipLoadingState) {
        setLoading(false);
        return;
      }
      // Se está stale, continua para revalidar em background
      if (!skipLoadingState) {
        setLoading(false);
      }
    } else if (!skipLoadingState) {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, error: fetchError } = await getBudgets(year, month);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      }

      if (data) {
        // Atualizar cache
        budgetsCache.set(cacheKey, data);
        setBudgets(data);
      }
    } catch (err) {
      if (!isUnmounted.current) {
        setError(err);
      }
    } finally {
      if (!isUnmounted.current) {
        setLoading(false);
      }
    }
  }, [year, month]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Criar orçamento com atualização otimista
  const create = async (budget) => {
    const { data, error: createError } = await createBudget(budget);

    if (createError) {
      return { data: null, error: createError };
    }

    // Invalidar cache e recarregar para obter os dados completos com spending
    const cacheKey = getCacheKey(year, month);
    budgetsCache.clear(cacheKey);
    await loadBudgets(true);

    return { data, error: null };
  };

  // Atualizar orçamento com atualização otimista
  const update = async (id, updates) => {
    // Guardar estado anterior para rollback
    const previousBudgets = [...budgets];
    const cacheKey = getCacheKey(year, month);

    // Atualização otimista - atualiza estado e cache
    const updatedBudgets = budgets.map(b =>
      b.id === id ? { ...b, limit_amount: updates.limitAmount || b.limit_amount } : b
    );
    setBudgets(updatedBudgets);
    budgetsCache.set(cacheKey, updatedBudgets);

    const { data, error: updateError } = await updateBudget(id, updates);

    if (updateError) {
      // Rollback em caso de erro
      setBudgets(previousBudgets);
      budgetsCache.set(cacheKey, previousBudgets);
      return { data: null, error: updateError };
    }

    return { data, error: null };
  };

  // Remover orçamento com atualização otimista
  const remove = async (id) => {
    // Guardar estado anterior para rollback
    const previousBudgets = [...budgets];
    const cacheKey = getCacheKey(year, month);

    // Atualização otimista: remove do estado e cache imediatamente
    const filteredBudgets = budgets.filter(b => b.id !== id);
    setBudgets(filteredBudgets);
    budgetsCache.set(cacheKey, filteredBudgets);

    const { data, error: deleteError } = await deleteBudget(id);

    if (deleteError) {
      // Rollback em caso de erro
      setBudgets(previousBudgets);
      budgetsCache.set(cacheKey, previousBudgets);
      return { data: null, error: deleteError };
    }

    return { data, error: null };
  };

  // Copiar orçamentos de outro mês
  const copyFromMonth = async (fromYear, fromMonth) => {
    const { data, error: copyError } = await copyBudgetsToMonth(
      fromYear,
      fromMonth,
      year,
      month
    );

    if (copyError) {
      return { data: null, error: copyError };
    }

    // Invalidar cache e recarregar para obter os dados atualizados
    const cacheKey = getCacheKey(year, month);
    budgetsCache.clear(cacheKey);
    await loadBudgets(true);

    return { data, error: null };
  };

  // Calcular totais
  const totals = {
    totalLimit: budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount || 0), 0),
    totalSpent: budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0),
    get remaining() {
      return this.totalLimit - this.totalSpent;
    },
    get percentage() {
      return this.totalLimit > 0 ? (this.totalSpent / this.totalLimit) * 100 : 0;
    },
  };

  return {
    budgets,
    loading,
    error,
    totals,
    refresh: loadBudgets,
    create,
    update,
    remove,
    copyFromMonth,
  };
}

export function useBudget(id) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadBudget = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getBudgetById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setBudget(data);
      }
    } catch (err) {
      if (!isUnmounted.current) {
        setError(err);
      }
    } finally {
      if (!isUnmounted.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  return {
    budget,
    loading,
    error,
    refresh: loadBudget,
  };
}