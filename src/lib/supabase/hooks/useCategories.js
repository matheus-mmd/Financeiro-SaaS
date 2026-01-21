/**
 * Hook para gerenciar categorias
 * Implementa stale-while-revalidate para carregamento instantâneo
 * Com atualizações otimistas para melhor UX
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
import { withTimeout } from '../../utils/requestUtils';

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

  const normalize = useCallback((items = []) =>
    items.map((category) => ({
      ...category,
      color: category.color || '#6366f1',
      emoji: category.emoji || null,
      icon_name: category.icon_name || category.icon || 'Tag',
      transaction_type_id: category.transaction_type_id || category.type_id,
    })),
  []);

  const loadCategories = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await withTimeout(
        getCategories(),
        10000,
        'Timeout ao carregar categorias'
      );

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      }

      const nextData = normalize(data || []);
      setCategories(nextData);
      categoriesCache.set(nextData);
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

  // Criar categoria com atualização otimista
  const create = async (category) => {
    const { data, error: createError } = await createCategory(category);

    if (createError) {
      return { data: null, error: createError };
    }

    // Atualização otimista: adiciona ao estado local imediatamente
    if (data) {
      const normalizedData = normalize([data])[0];
      setCategories(prev => [...prev, normalizedData]);
      categoriesCache.clear();
    }

    return { data, error: null };
  };

  // Atualizar categoria com atualização otimista
  const update = async (id, updates) => {
    const { data, error: updateError } = await updateCategory(id, updates);

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Atualização otimista: atualiza no estado local imediatamente
    if (data) {
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, ...updates, ...data } : cat
      ));
      categoriesCache.clear();
    }

    return { data, error: null };
  };

  // Remover categoria com atualização otimista
  const remove = async (id) => {
    // Guardar estado anterior para rollback se necessário
    const previousCategories = [...categories];

    // Atualização otimista: remove do estado local imediatamente
    setCategories(prev => prev.filter(cat => cat.id !== id));

    const { data, error: deleteError } = await deleteCategory(id);

    if (deleteError) {
      // Rollback em caso de erro
      setCategories(previousCategories);
      return { data: null, error: deleteError };
    }

    categoriesCache.clear();
    return { data, error: null };
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