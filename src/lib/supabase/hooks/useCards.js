/**
 * Hook para gerenciar cartões
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from '../api/cards';
import { cardsCache } from '../../cache/cacheFactory';
import { withTimeout } from '../../utils/requestUtils';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const hasMounted = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const normalize = useCallback((items = []) =>
    items.map((card) => ({
      ...card,
      billing_day: card.billing_day || card.billingDay,
      limit: card.limit || card.credit_limit,
    })),
  []);

  const loadCards = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    if (!skipLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await withTimeout(
        getCards(),
        10000,
        'Timeout ao carregar cartões'
      );

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      }

      const nextData = normalize(data || []);
      setCards(nextData);
      cardsCache.set(nextData);
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

    const cached = cardsCache.get();

    if (cached?.data) {
      setCards(cached.data);
      setIsFromCache(true);
      setLoading(false);

      if (!cached.isStale) {
        return;
      }

      loadCards(true);
      return;
    }

    loadCards();
  }, [loadCards]);

  const create = async (card) => {
    const { data, error: createError } = await createCard(card);
    if (!createError) {
      cardsCache.clear();
      await loadCards();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateCard(id, updates);
    if (!updateError) {
      cardsCache.clear();
      await loadCards();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteCard(id);
    if (!deleteError) {
      cardsCache.clear();
      await loadCards();
    }
    return { data, error: deleteError };
  };

  return {
    cards,
    loading,
    error,
    isFromCache,
    refresh: loadCards,
    create,
    update,
    remove,
  };
}

export function useCard(id) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadCard = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getCardById(id);

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
      } else {
        setCard(data);
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
    loadCard();
  }, [loadCard]);

  return {
    card,
    loading,
    error,
    refresh: loadCard,
  };
}