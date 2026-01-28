/**
 * API de Planos - Supabase
 * Endpoints públicos para buscar planos de assinatura
 */

import { supabase } from '../client';
import { plansCache } from '../../cache/cacheFactory';

/**
 * Busca todos os planos ativos com suas funcionalidades
 * Otimizado: query unica com JOIN e cache de longa duracao
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getPlans() {
  // Verificar cache primeiro (planos mudam raramente)
  const cached = plansCache.get();
  if (cached?.data && !cached.isStale) {
    return { data: cached.data, error: null };
  }

  // Se tem cache stale, retorna ele e revalida em background
  if (cached?.data && cached.isStale) {
    revalidatePlans();
    return { data: cached.data, error: null };
  }

  // Sem cache: buscar do servidor
  return fetchAndCachePlans();
}

/**
 * Busca planos do servidor e atualiza o cache
 */
async function fetchAndCachePlans() {
  try {
    // Query unica com relacionamento (JOIN) em vez de 2 queries sequenciais
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select(`
        *,
        features:plan_features(*)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (plansError) {
      console.error('[Plans API] Erro ao buscar planos:', plansError);
      return { data: [], error: plansError };
    }

    // Ordenar features por display_order dentro de cada plano
    const plansWithSortedFeatures = (plans || []).map(plan => ({
      ...plan,
      features: (plan.features || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    }));

    // Salvar no cache
    if (plansWithSortedFeatures.length > 0) {
      plansCache.set(plansWithSortedFeatures);
    }

    return { data: plansWithSortedFeatures, error: null };
  } catch (error) {
    console.error('[Plans API] Erro inesperado:', error);
    return { data: [], error };
  }
}

/**
 * Revalida o cache de planos em background
 */
async function revalidatePlans() {
  try {
    await fetchAndCachePlans();
  } catch (err) {
    console.debug('[Plans API] Falha ao revalidar cache:', err);
  }
}

/**
 * Busca um plano específico pelo slug
 * @param {string} slug - Slug do plano (ex: 'basic', 'pro')
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getPlanBySlug(slug) {
  try {
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (planError) {
      console.error('[Plans API] Erro ao buscar plano:', planError);
      return { data: null, error: planError };
    }

    if (!plan) {
      return { data: null, error: null };
    }

    // Buscar funcionalidades do plano
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan_id', plan.id)
      .order('display_order', { ascending: true });

    if (featuresError) {
      console.error('[Plans API] Erro ao buscar funcionalidades:', featuresError);
      return { data: { ...plan, features: [] }, error: null };
    }

    return { data: { ...plan, features: features || [] }, error: null };
  } catch (error) {
    console.error('[Plans API] Erro inesperado:', error);
    return { data: null, error };
  }
}

/**
 * Formata o preço de centavos para reais
 * @param {number} cents - Valor em centavos
 * @returns {string} - Valor formatado (ex: "25,97")
 */
export function formatPrice(cents) {
  if (!cents && cents !== 0) return '0,00';
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calcula o desconto percentual
 * @param {number} originalCents - Preço original em centavos
 * @param {number} currentCents - Preço atual em centavos
 * @returns {number} - Percentual de desconto (ex: 63 para 63%)
 */
export function calculateDiscount(originalCents, currentCents) {
  if (!originalCents || originalCents <= currentCents) return 0;
  return Math.round(((originalCents - currentCents) / originalCents) * 100);
}