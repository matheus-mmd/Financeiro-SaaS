/**
 * Hook para gerenciar ativos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../api/assets';

const CACHE_KEY = 'assets_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const assetsCache = {
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

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadAssets = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getAssets();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextData = data || [];
        setAssets(nextData);
        assetsCache.set(nextData);
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

    const cached = assetsCache.get();

    if (cached?.data) {
      setAssets(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadAssets(true);
      return;
    }

    loadAssets();
  }, [loadAssets]);

  const create = async (asset) => {
    const { data, error: createError } = await createAsset(asset);
    if (!createError) {
      assetsCache.clear();
      await loadAssets();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateAsset(id, updates);
    if (!updateError) {
      assetsCache.clear();
      await loadAssets();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteAsset(id);
    if (!deleteError) {
      assetsCache.clear();
      await loadAssets();
    }
    return { data, error: deleteError };
  };

  return {
    assets,
    loading,
    error,
    isFromCache,
    refresh: loadAssets,
    create,
    update,
    remove,
  };
}

export function useAsset(id) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadAsset = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getAssetById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setAsset(data);
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
    loadAsset();
  }, [loadAsset]);

  return {
    asset,
    loading,
    error,
    refresh: loadAsset,
  };
}