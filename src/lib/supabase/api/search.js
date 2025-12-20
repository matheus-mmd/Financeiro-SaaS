/**
 * API auxiliar para busca global
 * Centraliza as consultas necessárias para o GlobalSearch
 * reutilizando as funções de API já otimizadas.
 */

import { getTransactions } from './transactions';
import { getTargets } from './targets';
import { getAssets } from './assets';

const DEFAULT_LIMIT = 150;

export async function getSearchDataset() {
  const [transactionsRes, targetsRes, assetsRes] = await Promise.all([
    getTransactions({ limit: DEFAULT_LIMIT }),
    getTargets({ limit: DEFAULT_LIMIT }),
    getAssets({ limit: DEFAULT_LIMIT }),
  ]);

  const responses = [transactionsRes, targetsRes, assetsRes];
  const authError = responses.find((res) => res?.error?.code === 'AUTH_REQUIRED')?.error || null;
  const genericError = responses.find((res) => res?.error)?.error || null;

  return {
    data: {
      transactions: transactionsRes?.data || [],
      targets: targetsRes?.data || [],
      assets: assetsRes?.data || [],
    },
    error: authError || genericError,
  };
}
