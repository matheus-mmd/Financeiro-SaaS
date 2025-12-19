/**
 * Hook para dados de referência (categorias, tipos, status de pagamento, etc.)
 * Replica o padrão do dashboard: cache em sessionStorage + recarga em background
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCategories,
  getTransactionTypes,
  getPaymentStatuses,
  getPaymentMethods,
  getRecurrenceFrequencies,
} from '../api/categories';

const CACHE_KEY = 'reference_data_cache_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const referenceCache = {
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
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch {
      // Ignore cache failures
    }
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore errors
    }
  },
};

export function useReferenceData() {
  const [data, setData] = useState({
    categories: [],
    transactionTypes: [],
    paymentStatuses: [],
    paymentMethods: [],
    recurrenceFrequencies: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadReferenceData = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const [categoriesRes, transactionTypesRes, paymentStatusesRes, paymentMethodsRes, recurrenceFrequenciesRes] =
        await Promise.all([
          getCategories(),
          getTransactionTypes(),
          getPaymentStatuses(),
          getPaymentMethods(),
          getRecurrenceFrequencies(),
        ]);

      if (isUnmounted.current) return;

      const nextData = {
        categories: categoriesRes?.data || [],
        transactionTypes: transactionTypesRes?.data || [],
        paymentStatuses: paymentStatusesRes?.data || [],
        paymentMethods: paymentMethodsRes?.data || [],
        recurrenceFrequencies: recurrenceFrequenciesRes?.data || [],
      };

      setData(nextData);
      referenceCache.set(nextData);
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
  }, []);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const cached = referenceCache.get();

    if (cached?.data) {
      setData(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadReferenceData(true);
      return;
    }

    loadReferenceData();
  }, [loadReferenceData]);

  return {
    data,
    loading,
    error,
    isFromCache,
    refresh: loadReferenceData,
    clearCache: referenceCache.clear,
  };
}