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

const CACHE_KEY = 'banks_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const banksCache = {
  get: () => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isStale = Date.now() - timestamp > CACHE_TTL;

      return { data, isStale };
    } catch {
      return null;
    }
  },
  set: (data) => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch {
      // Ignorar erros de storage
    }
  },
  clear: () => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignorar erros
    }
  },
};

export function useBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadBanks = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getBanks();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextData = data || [];
        setBanks(nextData);
        banksCache.set(nextData);
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
  }, []);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const cached = banksCache.get();

    if (cached?.data) {
      setBanks(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadBanks(true);
      return;
    }

    loadBanks();
  }, [loadBanks]);

  const create = async (bank) => {
    const { data, error: createError } = await createBank(bank);
    if (!createError) {
      banksCache.clear();
      await loadBanks();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateBank(id, updates);
    if (!updateError) {
      banksCache.clear();
      await loadBanks();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteBank(id);
    if (!deleteError) {
      banksCache.clear();
      await loadBanks();
    }
    return { data, error: deleteError };
  };

  return {
    banks,
    loading,
    error,
    isFromCache,
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