/**
 * API de Planos - Supabase
 * Endpoints públicos para buscar planos de assinatura
 */

import { supabase } from '../client';

/**
 * Busca todos os planos ativos com suas funcionalidades
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getPlans() {
  try {
    // Buscar planos ativos ordenados
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (plansError) {
      console.error('[Plans API] Erro ao buscar planos:', plansError);
      return { data: [], error: plansError };
    }

    if (!plans || plans.length === 0) {
      return { data: [], error: null };
    }

    // Buscar funcionalidades de todos os planos
    const planIds = plans.map(p => p.id);
    const { data: features, error: featuresError } = await supabase
      .from('plan_features')
      .select('*')
      .in('plan_id', planIds)
      .order('display_order', { ascending: true });

    if (featuresError) {
      console.error('[Plans API] Erro ao buscar funcionalidades:', featuresError);
      // Retorna planos sem funcionalidades em caso de erro
      return {
        data: plans.map(plan => ({ ...plan, features: [] })),
        error: null
      };
    }

    // Agrupar funcionalidades por plano
    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: (features || []).filter(f => f.plan_id === plan.id)
    }));

    return { data: plansWithFeatures, error: null };
  } catch (error) {
    console.error('[Plans API] Erro inesperado:', error);
    return { data: [], error };
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