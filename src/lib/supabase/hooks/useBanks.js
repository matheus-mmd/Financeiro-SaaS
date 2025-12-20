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
import { banksCache } from '../../cache/cacheFactory';
import { withTimeout } from '../../utils/requestUtils';

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

  const normalize = useCallback((items = []) =>
    items.map((bank) => ({
      ...bank,
      color: bank.color || '#0ea5e9',
    })),
  []);

  const loadBanks = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await withTimeout(
        getBanks(),
        10000,
        'Timeout ao carregar contas'
      );

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      }

      const nextData = normalize(data || []);
      setBanks(nextData);
      banksCache.set(nextData);
      setIsFromCache(false);
    } catch (err) {
      if (!isUnmounted.current) {
        setError(err);
      }
    } finally {
      if (!isUnmounted.current) {
        setLoading(false);
      }
    }
  }, [normalize]);

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
  }, [id]);

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