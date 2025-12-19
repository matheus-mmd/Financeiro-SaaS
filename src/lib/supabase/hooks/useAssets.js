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

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadAssets = useCallback(async () => {
    if (isUnmounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getAssets();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setAssets(data || []);
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
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregar apenas na montagem

  const create = async (asset) => {
    const { data, error: createError } = await createAsset(asset);
    if (!createError) {
      await loadAssets();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateAsset(id, updates);
    if (!updateError) {
      await loadAssets();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteAsset(id);
    if (!deleteError) {
      await loadAssets();
    }
    return { data, error: deleteError };
  };

  return {
    assets,
    loading,
    error,
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