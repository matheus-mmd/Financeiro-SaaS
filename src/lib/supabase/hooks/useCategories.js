/**
 * Hook para gerenciar categorias
 * Implementa stale-while-revalidate para carregamento instantâneo
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories';
import { categoriesCache } from '../../cache/cacheFactory';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadCategories = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await getCategories();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextData = data || [];
        setCategories(nextData);
        categoriesCache.set(nextData);
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

    const cached = categoriesCache.get();

    if (cached?.data) {
      setCategories(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadCategories(true);
      return;
    }

    loadCategories();
  }, [loadCategories]);

  const create = async (category) => {
    const { data, error: createError } = await createCategory(category);
    if (!createError) {
      categoriesCache.clear();
      await loadCategories();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateCategory(id, updates);
    if (!updateError) {
      categoriesCache.clear();
      await loadCategories();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteCategory(id);
    if (!deleteError) {
      categoriesCache.clear();
      await loadCategories();
    }
    return { data, error: deleteError };
  };

  return {
    categories,
    loading,
    error,
    isFromCache,
    refresh: loadCategories,
    create,
    update,
    remove,
  };
}

export function useCategory(id) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadCategory = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getCategoryById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setCategory(data);
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
    loadCategory();
  }, [loadCategory]);

  return {
    category,
    loading,
    error,
    refresh: loadCategory,
  };
}