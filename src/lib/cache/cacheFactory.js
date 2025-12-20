/**
 * Factory para criar utilitários de cache no sessionStorage
 *
 * Centraliza a lógica de cache que estava duplicada em todos os hooks.
 * Implementa o padrão stale-while-revalidate para melhor UX.
 *
 * @example
 * // Cache simples (sem chave dinâmica)
 * const myCache = createCache('my_cache_key');
 * myCache.set(data);
 * const cached = myCache.get(); // { data, isStale }
 *
 * @example
 * // Cache com chaves dinâmicas (para filtros)
 * const myCache = createCache('transactions_cache', { useKeys: true });
 * myCache.set('filter1', data);
 * const cached = myCache.get('filter1');
 */

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Verifica se estamos em ambiente de servidor (SSR)
 */
const isServer = () => typeof window === 'undefined';

/**
 * Cria um utilitário de cache para sessionStorage
 *
 * @param {string} cacheKey - Chave base para o cache
 * @param {Object} options - Opções de configuração
 * @param {number} options.ttl - Time-to-live em milissegundos (padrão: 5 min)
 * @param {boolean} options.useKeys - Se true, permite sub-chaves dinâmicas
 * @returns {Object} Objeto com métodos get, set, clear
 */
export function createCache(cacheKey, options = {}) {
  const { ttl = DEFAULT_TTL, useKeys = false } = options;

  /**
   * Gera a chave completa para o storage
   */
  const getStorageKey = (subKey) => {
    if (useKeys && subKey !== undefined) {
      return `${cacheKey}:${subKey}`;
    }
    return cacheKey;
  };

  /**
   * Recupera dados do cache
   * @param {string} [subKey] - Sub-chave opcional (quando useKeys = true)
   * @returns {Object|null} { data, isStale } ou null se não houver cache
   */
  const get = (subKey) => {
    if (isServer()) return null;

    try {
      const key = getStorageKey(subKey);
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isStale = Date.now() - timestamp > ttl;

      return { data, isStale };
    } catch {
      return null;
    }
  };

  /**
   * Salva dados no cache
   * @param {string|any} subKeyOrData - Sub-chave (se useKeys) ou dados
   * @param {any} [data] - Dados a serem salvos (se useKeys)
   */
  const set = (subKeyOrData, data) => {
    if (isServer()) return;

    try {
      let key;
      let dataToStore;

      if (useKeys) {
        key = getStorageKey(subKeyOrData);
        dataToStore = data;
      } else {
        key = getStorageKey();
        dataToStore = subKeyOrData;
      }

      sessionStorage.setItem(
        key,
        JSON.stringify({
          data: dataToStore,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignorar erros de storage (quota exceeded, etc)
    }
  };

  /**
   * Remove dados do cache
   * @param {string} [subKey] - Sub-chave opcional (quando useKeys = true)
   */
  const clear = (subKey) => {
    if (isServer()) return;

    try {
      const key = getStorageKey(subKey);
      sessionStorage.removeItem(key);
    } catch {
      // Ignorar erros
    }
  };

  /**
   * Remove todos os itens com o prefixo da chave base
   * Útil para limpar todos os caches de um tipo quando useKeys = true
   */
  const clearAll = () => {
    if (isServer()) return;

    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(cacheKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Ignorar erros
    }
  };

  return {
    get,
    set,
    clear,
    clearAll,
  };
}

/**
 * Cache pré-configurados para uso na aplicação
 * Centralizados aqui para fácil manutenção
 */
export const dashboardCache = createCache('dashboard_cache');
export const referenceDataCache = createCache('reference_data_cache_v1');
export const banksCache = createCache('banks_cache');
export const cardsCache = createCache('cards_cache');
export const assetsCache = createCache('assets_cache');
export const transactionsCache = createCache('transactions_cache', { useKeys: true });
export const targetsCache = createCache('targets_cache', { useKeys: true });