/**
 * Hook para gerenciar bancos/contas
 */

import { useState, useEffect, useCallback } from 'react';
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

  const loadBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getBanks();
    if (fetchError) {
      setError(fetchError);
    } else {
      setBanks(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

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

  const loadBank = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getBankById(id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setBank(data);
    }
    setLoading(false);
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
