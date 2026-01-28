/**
 * Hook para gerenciar configurações do usuário
 * Com cache stale-while-revalidate para carregamento instantâneo
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUserSettings,
  updateUserInfo,
  updatePreferences,
  addAccountMember,
  updateAccountMember,
  removeAccountMember,
  resetAccount,
  formatSubscriptionStatus,
  calculateTrialDaysRemaining,
} from '../api/settings';
import { settingsCache } from '../../cache/cacheFactory';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const loadSettings = useCallback(async (skipLoadingState = false) => {
    if (isUnmounted.current) return;

    // Tentar carregar do cache primeiro (stale-while-revalidate)
    const cached = settingsCache.get();
    if (cached?.data) {
      setSettings(cached.data);
      // Se o cache nao esta stale, nao precisa recarregar
      if (!cached.isStale && !skipLoadingState) {
        setLoading(false);
        return;
      }
      // Se esta stale, continua para revalidar em background
      if (!skipLoadingState) {
        setLoading(false);
      }
    } else if (!skipLoadingState) {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, error: fetchError } = await getUserSettings();

      if (isUnmounted.current) return;

      if (fetchError) {
        setError(fetchError);
        return { data: null, error: fetchError };
      }

      if (data) {
        // Atualizar cache
        settingsCache.set(data);
        setSettings(data);
      }

      return { data, error: null };
    } catch (err) {
      if (!isUnmounted.current) {
        setError(err);
      }
      return { data: null, error: err };
    } finally {
      if (!isUnmounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Carregar ao montar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Atualizar informacoes pessoais
  const updatePersonalInfo = useCallback(async (updates) => {
    const previousSettings = settings;

    // Atualizacao otimista
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    settingsCache.set(updatedSettings);

    try {
      const { data, error } = await updateUserInfo(updates);

      if (error) {
        // Rollback
        setSettings(previousSettings);
        settingsCache.set(previousSettings);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      // Rollback
      setSettings(previousSettings);
      settingsCache.set(previousSettings);
      return { data: null, error: err };
    }
  }, [settings]);

  // Atualizar preferencias
  const updateUserPreferences = useCallback(async (preferences) => {
    const previousSettings = settings;

    // Atualizacao otimista
    const updatedSettings = { ...settings, ...preferences };
    setSettings(updatedSettings);
    settingsCache.set(updatedSettings);

    try {
      const { data, error } = await updatePreferences(preferences);

      if (error) {
        // Rollback
        setSettings(previousSettings);
        settingsCache.set(previousSettings);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      // Rollback
      setSettings(previousSettings);
      settingsCache.set(previousSettings);
      return { data: null, error: err };
    }
  }, [settings]);

  // Adicionar membro
  const addMember = useCallback(async (member) => {
    try {
      const { data, error } = await addAccountMember(member);

      if (error) {
        return { data: null, error };
      }

      // Atualizar estado e cache
      const updatedSettings = {
        ...settings,
        members: [...(settings?.members || []), data],
      };
      setSettings(updatedSettings);
      settingsCache.set(updatedSettings);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, [settings]);

  // Atualizar membro
  const updateMember = useCallback(async (memberId, updates) => {
    const previousSettings = settings;

    // Atualizacao otimista
    const updatedMembers = settings?.members?.map(m =>
      m.id === memberId ? { ...m, ...updates, work_type: updates.workType || m.work_type } : m
    ) || [];
    const updatedSettings = { ...settings, members: updatedMembers };
    setSettings(updatedSettings);
    settingsCache.set(updatedSettings);

    try {
      const { data, error } = await updateAccountMember(memberId, updates);

      if (error) {
        // Rollback
        setSettings(previousSettings);
        settingsCache.set(previousSettings);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      // Rollback
      setSettings(previousSettings);
      settingsCache.set(previousSettings);
      return { data: null, error: err };
    }
  }, [settings]);

  // Remover membro
  const removeMember = useCallback(async (memberId) => {
    const previousSettings = settings;

    // Atualizacao otimista
    const updatedMembers = settings?.members?.filter(m => m.id !== memberId) || [];
    const updatedSettings = { ...settings, members: updatedMembers };
    setSettings(updatedSettings);
    settingsCache.set(updatedSettings);

    try {
      const { data, error } = await removeAccountMember(memberId);

      if (error) {
        // Rollback
        setSettings(previousSettings);
        settingsCache.set(previousSettings);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      // Rollback
      setSettings(previousSettings);
      settingsCache.set(previousSettings);
      return { data: null, error: err };
    }
  }, [settings]);

  // Resetar conta
  const reset = useCallback(async () => {
    try {
      const result = await resetAccount();

      if (result.success) {
        // Limpar cache
        settingsCache.clear();
        setSettings(null);
      }

      return result;
    } catch (err) {
      return { success: false, error: err };
    }
  }, []);

  // Helpers de assinatura
  const subscriptionInfo = settings
    ? formatSubscriptionStatus(settings.subscription_status || 'trial', settings.trial_ends_at)
    : null;

  const trialDaysRemaining = settings
    ? calculateTrialDaysRemaining(settings.trial_ends_at)
    : 0;

  return {
    settings,
    loading,
    error,
    subscriptionInfo,
    trialDaysRemaining,
    refresh: loadSettings,
    updatePersonalInfo,
    updatePreferences: updateUserPreferences,
    addMember,
    updateMember,
    removeMember,
    resetAccount: reset,
  };
}

/**
 * Funcao para prefetch de settings (usar no hover de links)
 */
export async function prefetchSettings() {
  // Verificar se ja tem cache valido
  const cached = settingsCache.get();
  if (cached?.data && !cached.isStale) {
    return;
  }

  // Buscar dados e popular cache
  const { data } = await getUserSettings();
  if (data) {
    settingsCache.set(data);
  }
}