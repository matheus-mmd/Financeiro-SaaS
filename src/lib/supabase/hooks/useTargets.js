/**
 * Hook para gerenciar metas
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget,
} from '../api/targets';

const CACHE_KEY = 'targets_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const targetsCache = {
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

export function useTargets(filters = {}) {
  const [targets, setTargets] = useState([]);
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

  const stableFilters = useMemo(() => ({ ...filters }), [filtersKey]);

  const loadTargets = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getTargets(stableFilters);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextData = data || [];
        setTargets(nextData);
        targetsCache.set(filtersKey, nextData);
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
  }, [filtersKey, stableFilters]);

  // Carregar quando filters mudar
  useEffect(() => {
    const cached = targetsCache.get(filtersKey);

    if (cached?.data) {
      setTargets(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadTargets(true);
      return;
    }

    loadTargets();
  }, [filtersKey, loadTargets]);

  const create = async (target) => {
    const { data, error: createError } = await createTarget(target);
    if (!createError) {
      targetsCache.clear(filtersKey);
      await loadTargets();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateTarget(id, updates);
    if (!updateError) {
      targetsCache.clear(filtersKey);
      await loadTargets();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteTarget(id);
    if (!deleteError) {
      targetsCache.clear(filtersKey);
      await loadTargets();
    }
    return { data, error: deleteError };
  };

  return {
    targets,
    loading,
    error,
    isFromCache,
    refresh: loadTargets,
    create,
    update,
    remove,
  };
}

export function useTarget(id) {
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadTarget = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getTargetById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setTarget(data);
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
    loadTarget();
  }, [loadTarget]);

  return {
    target,
    loading,
    error,
    refresh: loadTarget,
  };
}