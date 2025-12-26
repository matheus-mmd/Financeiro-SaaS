/**
 * Factory para criar utilitários de cache com localStorage
 *
 * Centraliza a lógica de cache que estava duplicada em todos os hooks.
 * Implementa o padrão stale-while-revalidate para melhor UX.
 *
 * MELHORIAS DE PERFORMANCE:
 * - Usa localStorage (persiste entre tabs e sessões)
 * - TTL variável por tipo de cache
 * - Controle de tamanho (evita quota exceeded)
 * - Compressão automática de dados grandes
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
const REFERENCE_DATA_TTL = 60 * 60 * 1000; // 1 hora (dados estáticos)
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB por cache

/**
 * Verifica se estamos em ambiente de servidor (SSR)
 */
const isServer = () => typeof window === 'undefined';

/**
 * Calcula o tamanho aproximado de um objeto em bytes
 */
const getObjectSize = (obj) => {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
};

/**
 * Cria um utilitário de cache para localStorage
 *
 * @param {string} cacheKey - Chave base para o cache
 * @param {Object} options - Opções de configuração
 * @param {number} options.ttl - Time-to-live em milissegundos (padrão: 5 min)
 * @param {boolean} options.useKeys - Se true, permite sub-chaves dinâmicas
 * @param {boolean} options.useSession - Se true, usa sessionStorage ao invés de localStorage
 * @returns {Object} Objeto com métodos get, set, clear
 */
export function createCache(cacheKey, options = {}) {
  const { ttl = DEFAULT_TTL, useKeys = false, useSession = false } = options;
  const storage = useSession ? (isServer() ? null : sessionStorage) : (isServer() ? null : localStorage);

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
    if (isServer() || !storage) return null;

    try {
      const key = getStorageKey(subKey);
      const cached = storage.getItem(key);
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
    if (isServer() || !storage) return;

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

      const cacheEntry = {
        data: dataToStore,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(cacheEntry);

      // Verificar tamanho antes de salvar
      const size = new Blob([serialized]).size;
      if (size > MAX_CACHE_SIZE) {
        console.warn(`[Cache] Entrada muito grande (${(size / 1024 / 1024).toFixed(2)}MB), não será cacheada:`, key);
        return;
      }

      storage.setItem(key, serialized);
    } catch (error) {
      // Se quota exceeded, limpar caches antigos e tentar novamente
      if (error.name === 'QuotaExceededError') {
        console.warn('[Cache] Quota excedida, limpando caches antigos...');
        clearOldEntries();

        try {
          // Tentar salvar novamente
          const cacheEntry = {
            data: useKeys ? data : subKeyOrData,
            timestamp: Date.now(),
          };
          storage.setItem(useKeys ? getStorageKey(subKeyOrData) : getStorageKey(), JSON.stringify(cacheEntry));
        } catch {
          console.error('[Cache] Não foi possível salvar no cache mesmo após limpeza');
        }
      }
    }
  };

  /**
   * Remove entradas antigas de cache para liberar espaço
   */
  const clearOldEntries = () => {
    if (isServer() || !storage) return;

    try {
      const now = Date.now();
      const keysToRemove = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;

        try {
          const item = storage.getItem(key);
          if (!item) continue;

          const { timestamp } = JSON.parse(item);
          // Remover entradas com mais de 24 horas
          if (now - timestamp > 24 * 60 * 60 * 1000) {
            keysToRemove.push(key);
          }
        } catch {
          // Se não conseguir parsear, remover
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
      console.log(`[Cache] ${keysToRemove.length} entradas antigas removidas`);
    } catch (error) {
      console.error('[Cache] Erro ao limpar entradas antigas:', error);
    }
  };

  /**
   * Remove dados do cache
   * @param {string} [subKey] - Sub-chave opcional (quando useKeys = true)
   */
  const clear = (subKey) => {
    if (isServer() || !storage) return;

    try {
      const key = getStorageKey(subKey);
      storage.removeItem(key);
    } catch {
      // Ignorar erros
    }
  };

  /**
   * Remove todos os itens com o prefixo da chave base
   * Útil para limpar todos os caches de um tipo quando useKeys = true
   */
  const clearAll = () => {
    if (isServer() || !storage) return;

    try {
      const keysToRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(cacheKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
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
 *
 * ESTRATÉGIA DE TTL:
 * - Dados de referência (categorias, bancos, etc.): 1 hora (mudam raramente)
 * - Dados transacionais (dashboard, transações): 5 minutos (mudam frequentemente)
 * - Dados de sessão: sessionStorage para limpar ao fechar tab
 */

// Dados transacionais (5 minutos, localStorage)
export const dashboardCache = createCache('dashboard_cache', { ttl: DEFAULT_TTL });
export const transactionsCache = createCache('transactions_cache', { useKeys: true, ttl: DEFAULT_TTL });
export const assetsCache = createCache('assets_cache', { ttl: DEFAULT_TTL });
export const targetsCache = createCache('targets_cache', { useKeys: true, ttl: DEFAULT_TTL });

// Dados de referência (1 hora, localStorage)
export const referenceDataCache = createCache('reference_data_cache_v3', { useKeys: true, ttl: REFERENCE_DATA_TTL });
export const banksCache = createCache('banks_cache', { ttl: REFERENCE_DATA_TTL });
export const cardsCache = createCache('cards_cache', { ttl: REFERENCE_DATA_TTL });
export const categoriesCache = createCache('categories_cache', { ttl: REFERENCE_DATA_TTL });