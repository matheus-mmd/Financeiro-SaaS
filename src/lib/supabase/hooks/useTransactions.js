/**
 * Hook para gerenciar transações
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByInstallmentGroup,
  getRecurringTransactions,
} from '../api/transactions';

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Criar função de carregamento estável
  // OTIMIZAÇÃO: Usar useMemo para criar uma key estável dos filtros ao invés de JSON.stringify
  const filtersKey = useMemo(() => {
    return Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  }, [filters]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTransactions(filters);
    if (fetchError) {
      setError(fetchError);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [filtersKey]); // Usar filtersKey ao invés de JSON.stringify

  // Carregar quando filters mudar
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const create = async (transaction) => {
    const { data, error: createError } = await createTransaction(transaction);
    if (!createError) {
      await loadTransactions();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateTransaction(id, updates);
    if (!updateError) {
      await loadTransactions();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteTransaction(id);
    if (!deleteError) {
      await loadTransactions();
    }
    return { data, error: deleteError };
  };

  return {
    transactions,
    loading,
    error,
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

  const loadTransaction = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTransactionById(id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setTransaction(data);
    }
    setLoading(false);
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

  const loadInstallments = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTransactionsByInstallmentGroup(groupId);
    if (fetchError) {
      setError(fetchError);
    } else {
      setInstallments(data || []);
    }
    setLoading(false);
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

  const loadRecurring = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getRecurringTransactions();
    if (fetchError) {
      setError(fetchError);
    } else {
      setRecurring(data || []);
    }
    setLoading(false);
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