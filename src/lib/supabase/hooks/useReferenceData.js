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
  getIcons,
  getAccountTypes,
  getCardTypes,
  getCardBrands,
} from '../api/categories';
import { referenceDataCache } from '../../cache/cacheFactory';

export function useReferenceData() {
  const [data, setData] = useState({
    categories: [],
    transactionTypes: [],
    paymentStatuses: [],
    paymentMethods: [],
    recurrenceFrequencies: [],
    icons: [],
    accountTypes: [],
    cardTypes: [],
    cardBrands: [],
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
      const [
        categoriesRes,
        transactionTypesRes,
        paymentStatusesRes,
        paymentMethodsRes,
        recurrenceFrequenciesRes,
        iconsRes,
        accountTypesRes,
        cardTypesRes,
        cardBrandsRes,
      ] = await Promise.all([
        getCategories(),
        getTransactionTypes(),
        getPaymentStatuses(),
        getPaymentMethods(),
        getRecurrenceFrequencies(),
        getIcons(),
        getAccountTypes(),
        getCardTypes(),
        getCardBrands(),
      ]);

      if (isUnmounted.current) return;

      const nextData = {
        categories: categoriesRes?.data || [],
        transactionTypes: transactionTypesRes?.data || [],
        paymentStatuses: paymentStatusesRes?.data || [],
        paymentMethods: paymentMethodsRes?.data || [],
        recurrenceFrequencies: recurrenceFrequenciesRes?.data || [],
        icons: iconsRes?.data || [],
        accountTypes: accountTypesRes?.data || [],
        cardTypes: cardTypesRes?.data || [],
        cardBrands: cardBrandsRes?.data || [],
      };

      setData(nextData);
      referenceDataCache.set(nextData);
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

    const cached = referenceDataCache.get();

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
    clearCache: referenceDataCache.clear,
  };
}