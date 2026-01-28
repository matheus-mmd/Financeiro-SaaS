/**
 * Utilitarios de prefetch para carregamento antecipado de dados
 * Melhora a percepcao de velocidade ao carregar dados antes do usuario navegar
 */

import { budgetsCache, settingsCache } from './cache/cacheFactory';

// Controle para evitar prefetch duplicado
const prefetchedRoutes = new Set();

/**
 * Prefetch de dados de orcamentos
 */
export async function prefetchBudgets(year, month) {
  const cacheKey = `${year}-${month}`;

  // Verificar se ja tem cache valido
  const cached = budgetsCache.get(cacheKey);
  if (cached?.data && !cached.isStale) {
    return;
  }

  // Importar dinamicamente para evitar circular imports
  const { getBudgets } = await import('./supabase/api/budgets');
  const { data } = await getBudgets(year, month);
  if (data) {
    budgetsCache.set(cacheKey, data);
  }
}

/**
 * Prefetch de dados de configuracoes
 */
export async function prefetchSettings() {
  // Verificar se ja tem cache valido
  const cached = settingsCache.get();
  if (cached?.data && !cached.isStale) {
    return;
  }

  // Importar dinamicamente para evitar circular imports
  const { getUserSettings } = await import('./supabase/api/settings');
  const { data } = await getUserSettings();
  if (data) {
    settingsCache.set(data);
  }
}

/**
 * Mapa de rotas para funcoes de prefetch
 */
const routePrefetchers = {
  '/orcamento-categoria': () => {
    const now = new Date();
    return prefetchBudgets(now.getFullYear(), now.getMonth() + 1);
  },
  '/configuracoes': prefetchSettings,
};

/**
 * Executa prefetch para uma rota especifica
 * Evita prefetch duplicado usando um Set de controle
 */
export async function prefetchRoute(path) {
  // Evitar prefetch duplicado
  if (prefetchedRoutes.has(path)) {
    return;
  }

  const prefetcher = routePrefetchers[path];
  if (prefetcher) {
    prefetchedRoutes.add(path);
    try {
      await prefetcher();
    } catch (error) {
      // Remover da lista se falhou para permitir retry
      prefetchedRoutes.delete(path);
      console.debug('[Prefetch] Falha ao prefetch:', path, error);
    }
  }
}

/**
 * Limpa o controle de prefetch (util para logout)
 */
export function clearPrefetchCache() {
  prefetchedRoutes.clear();
}