/**
 * Hook para gerenciar orçamentos por categoria
 * Com atualizações otimistas para melhor UX
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

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getBudgets(year, month);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      }

      setBudgets(data || []);
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

    // Recarregar para obter os dados completos com spending
    await loadBudgets(true);

    return { data, error: null };
  };

  // Atualizar orçamento com atualização otimista
  const update = async (id, updates) => {
    // Guardar estado anterior para rollback
    const previousBudgets = [...budgets];

    // Atualização otimista
    setBudgets(prev => prev.map(b =>
      b.id === id ? { ...b, limit_amount: updates.limitAmount || b.limit_amount } : b
    ));

    const { data, error: updateError } = await updateBudget(id, updates);

    if (updateError) {
      // Rollback em caso de erro
      setBudgets(previousBudgets);
      return { data: null, error: updateError };
    }

    return { data, error: null };
  };

  // Remover orçamento com atualização otimista
  const remove = async (id) => {
    // Guardar estado anterior para rollback
    const previousBudgets = [...budgets];

    // Atualização otimista: remove do estado local imediatamente
    setBudgets(prev => prev.filter(b => b.id !== id));

    const { data, error: deleteError } = await deleteBudget(id);

    if (deleteError) {
      // Rollback em caso de erro
      setBudgets(previousBudgets);
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

    // Recarregar para obter os dados atualizados
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