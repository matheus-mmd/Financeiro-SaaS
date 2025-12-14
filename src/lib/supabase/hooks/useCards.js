/**
 * Hook para gerenciar cartões
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from '../api/cards';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getCards();
    if (fetchError) {
      setError(fetchError);
    } else {
      setCards(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregar apenas na montagem

  const create = async (card) => {
    const { data, error: createError } = await createCard(card);
    if (!createError) {
      await loadCards();
    }
    return { data, error: createError };
  };

  const update = async (id, updates) => {
    const { data, error: updateError } = await updateCard(id, updates);
    if (!updateError) {
      await loadCards();
    }
    return { data, error: updateError };
  };

  const remove = async (id) => {
    const { data, error: deleteError } = await deleteCard(id);
    if (!deleteError) {
      await loadCards();
    }
    return { data, error: deleteError };
  };

  return {
    cards,
    loading,
    error,
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

  const loadCard = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getCardById(id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setCard(data);
    }
    setLoading(false);
  }, [id]); // id é primitivo, não causa loop

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