/**
 * Hook para dados de referência (categorias, tipos, status de pagamento, etc.)
 * Replica o padrão do dashboard: cache em sessionStorage + recarga em background
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { runInParallel, withTimeout } from '../../utils/requestUtils';

const normalizePaymentMethod = (method) => {
  const name = method?.name || '';
  const internal = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    ...method,
    internal_name: method?.internal_name || internal,
  };
};

const normalizeResourceData = (resource, items = []) => {
  if (resource === 'paymentMethods') {
    return items.map(normalizePaymentMethod);
  }

  return items;
};

const RESOURCE_FETCHERS = {
  categories: getCategories,
  transactionTypes: getTransactionTypes,
  paymentStatuses: getPaymentStatuses,
  paymentMethods: getPaymentMethods,
  recurrenceFrequencies: getRecurrenceFrequencies,
  icons: getIcons,
  accountTypes: getAccountTypes,
  cardTypes: getCardTypes,
  cardBrands: getCardBrands,
};

const DEFAULT_RESOURCES = Object.keys(RESOURCE_FETCHERS);

export function useReferenceData({ resources } = {}) {
  const normalizedResources = useMemo(() => {
    const list = resources && resources.length ? resources : DEFAULT_RESOURCES;
    return Array.from(new Set(list));
  }, [resources?.join('|')]);

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
  const isUnmounted = useRef(false);

  const [requestedResources, setRequestedResources] = useState(normalizedResources);

  useEffect(() => {
    setRequestedResources(normalizedResources);
  }, [normalizedResources]);

  const resourcesKey = useMemo(() => {
    return requestedResources.slice().sort().join('|');
  }, [requestedResources]);

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
      const fetchers = requestedResources.map((resource) => {
        const fetcher = RESOURCE_FETCHERS[resource];
        if (!fetcher) return () => Promise.resolve({ data: [] });

        return () =>
          withTimeout(fetcher(), 10000, `Timeout ao carregar referência: ${resource}`);
      });

      const fetchResults = await runInParallel(fetchers);

      if (isUnmounted.current) return;

      const nextData = DEFAULT_RESOURCES.reduce((acc, resource) => {
        if (!requestedResources.includes(resource)) {
          acc[resource] = [];
          return acc;
        }

        const resultIndex = requestedResources.indexOf(resource);
        const result = fetchResults[resultIndex];
        acc[resource] = normalizeResourceData(resource, result?.data || []);
        return acc;
      }, {});

      setData(nextData);
      referenceDataCache.set(resourcesKey, nextData);
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
  }, [requestedResources, resourcesKey]);

  useEffect(() => {
    const cached = referenceDataCache.get(resourcesKey);

    if (cached?.data) {
      const normalizedFromCache = {
        ...cached.data,
        paymentMethods: normalizeResourceData('paymentMethods', cached.data.paymentMethods || []),
      };
      setData(normalizedFromCache);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadReferenceData(true);
      return;
    }

    loadReferenceData();
  }, [loadReferenceData, resourcesKey]);

  return {
    data,
    loading,
    error,
    isFromCache,
    setResources: setRequestedResources,
    refresh: loadReferenceData,
    clearCache: (key) => referenceDataCache.clear(key || resourcesKey),
  };
}