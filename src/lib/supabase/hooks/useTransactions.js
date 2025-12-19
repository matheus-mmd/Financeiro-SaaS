/**
 * Hook para gerenciar transações
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByInstallmentGroup,
  getRecurringTransactions,
} from '../api/transactions';

const CACHE_KEY = 'transactions_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const transactionsCache = {
  get: (cacheKey) => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(`${CACHE_KEY}:${cacheKey}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isStale = Date.now() - timestamp > CACHE_TTL;

      return { data, isStale };
    } catch {
      return null;
    }
  },
  set: (cacheKey, data) => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(
        `${CACHE_KEY}:${cacheKey}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch {
      // Ignorar erros de storage
    }
  },
  clear: (cacheKey) => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(`${CACHE_KEY}:${cacheKey}`);
    } catch {
      // Ignorar erros
    }
  },
};

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isUnmounted = useRef(false);

  // Criar função de carregamento estável
  // OTIMIZAÇÃO: Usar useMemo para criar uma key estável dos filtros ao invés de JSON.stringify
  const filtersKey = useMemo(() => {
    return Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  }, [filters]);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadTransactions = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getTransactions(filters);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextData = data || [];
        setTransactions(nextData);
        transactionsCache.set(filtersKey || 'all', nextData);
        setIsFromCache(false);
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
  }, [filters, filtersKey]); // Usar filtersKey ao invés de JSON.stringify

  useEffect(() => {
    const cacheKey = filtersKey || 'all';
    const cached = transactionsCache.get(cacheKey);

    if (cached?.data) {
      setTransactions(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadTransactions(true);
      return;
    }

    loadTransactions();
  }, [filtersKey, loadTransactions]);

  const create = async (transaction) => {
    const { data, error: createError } = await createTransaction(transaction);
    if (!createError) {
      transactionsCache.clear(filtersKey || 'all');
      await loadTransactions();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateTransaction(id, updates);
    if (!updateError) {
      transactionsCache.clear(filtersKey || 'all');
      await loadTransactions();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteTransaction(id);
    if (!deleteError) {
      transactionsCache.clear(filtersKey || 'all');
      await loadTransactions();
    }
    return { data, error: deleteError };
  };

  return {
    transactions,
    loading,
    error,
    isFromCache,
    refresh: loadTransactions,
    create,
    update,
    remove,
  };
}

export function useTransaction(id) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadTransaction = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getTransactionById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setTransaction(data);
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
  }, [id]); // id é primitivo, não causa loop

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  return {
    transaction,
    loading,
    error,
    refresh: loadTransaction,
  };
}

export function useInstallmentGroup(groupId) {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadInstallments = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getTransactionsByInstallmentGroup(groupId);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setInstallments(data || []);
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
  }, [groupId]); // groupId é primitivo, não causa loop

  useEffect(() => {
    loadInstallments();
  }, [loadInstallments]);

  return {
    installments,
    loading,
    error,
    refresh: loadInstallments,
  };
}

export function useRecurringTransactions() {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadRecurring = useCallback(async () => {
    if (isUnmounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getRecurringTransactions();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setRecurring(data || []);
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
  }, []);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  return {
    recurring,
    loading,
    error,
    refresh: loadRecurring,
  };
}