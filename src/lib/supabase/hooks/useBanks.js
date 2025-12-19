/**
 * Hook para gerenciar bancos/contas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
} from '../api/banks';

export function useBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadBanks = useCallback(async () => {
    if (isUnmounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getBanks();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setBanks(data || []);
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
    loadBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregar apenas na montagem

  const create = async (bank) => {
    const { data, error: createError } = await createBank(bank);
    if (!createError) {
      await loadBanks();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateBank(id, updates);
    if (!updateError) {
      await loadBanks();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteBank(id);
    if (!deleteError) {
      await loadBanks();
    }
    return { data, error: deleteError };
  };

  return {
    banks,
    loading,
    error,
    refresh: loadBanks,
    create,
    update,
    remove,
  };
}

export function useBank(id) {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadBank = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getBankById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setBank(data);
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
    loadBank();
  }, [loadBank]);

  return {
    bank,
    loading,
    error,
    refresh: loadBank,
  };
}