/**
 * Hook para gerenciar metas
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget,
} from '../api/targets';

export function useTargets(filters = {}) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Criar função de carregamento estável
  // OTIMIZAÇÃO: Usar useMemo para criar uma key estável dos filtros ao invés de JSON.stringify
  const filtersKey = useMemo(() => {
    return Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  }, [filters]);

  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTargets(filters);
    if (fetchError) {
      setError(fetchError);
    } else {
      setTargets(data || []);
    }
    setLoading(false);
  }, [filtersKey]); // Usar filtersKey ao invés de JSON.stringify

  // Carregar quando filters mudar
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  const create = async (target) => {
    const { data, error: createError } = await createTarget(target);
    if (!createError) {
      await loadTargets();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateTarget(id, updates);
    if (!updateError) {
      await loadTargets();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteTarget(id);
    if (!deleteError) {
      await loadTargets();
    }
    return { data, error: deleteError };
  };

  return {
    targets,
    loading,
    error,
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

  const loadTarget = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTargetById(id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setTarget(data);
    }
    setLoading(false);
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