// Mock API - Simula chamadas de API retornando dados mock
import mockData from '../data/mockData.json';

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mapeamento de IDs de transactionTypes para nomes internos do sistema
const transactionTypeMap = {
  1: 'credit',
  2: 'debit',
  3: 'investment'
};

/**
 * Enriquece expenses com dados de category
 */
const enrichExpenses = (expenses) => {
  return expenses.map(expense => {
    const category = mockData.categories.find(c => c.id === expense.categoriesId);
    return {
      ...expense,
      category: category?.name || 'Desconhecido'
    };
  });
};

/**
 * Enriquece assets com dados de type
 */
const enrichAssets = (assets) => {
  return assets.map(asset => {
    const assetType = mockData.assetTypes.find(t => t.id === asset.assetTypesid);
    return {
      ...asset,
      type: assetType?.name || 'Desconhecido'
    };
  });
};

/**
 * Enriquece transactions com dados de type
 */
const enrichTransactions = (transactions) => {
  return transactions.map(transaction => {
    // Mapeia o ID para o nome interno do sistema (credit, debit, investment)
    const typeInternal = transactionTypeMap[transaction.transactionTypesid];
    return {
      ...transaction,
      type: typeInternal || 'desconhecido'
    };
  });
};

/**
 * Função genérica para "buscar" dados mock
 * @param {string} endpoint - Caminho da API mock
 * @returns {Promise} - Retorna os dados correspondentes
 */
export const fetchMock = async (endpoint) => {
  await delay();

  const routes = {
    '/api/expenses': enrichExpenses(mockData.expenses),
    '/api/assets': enrichAssets(mockData.assets),
    '/api/targets': mockData.targets,
    '/api/transactions': enrichTransactions(mockData.transactions),
    '/api/categories': mockData.categories,
    '/api/assetTypes': mockData.assetTypes,
    '/api/transactionTypes': mockData.transactionTypes,
  };

  if (routes[endpoint]) {
    return { data: routes[endpoint], status: 200 };
  }

  throw new Error(`Endpoint ${endpoint} não encontrado`);
};

/**
 * Formata valores monetários em BRL
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata datas para pt-BR
 * @param {string} dateString - Data em formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada
 */
export const formatDate = (dateString) => {
  // Separar a string de data para evitar problemas com timezone
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Calcula porcentagem de progresso
 * @param {number} progress - Valor atual
 * @param {number} goal - Valor objetivo
 * @returns {number} - Porcentagem (0-100)
 */
export const calculateProgress = (progress, goal) => {
  if (goal === 0) return 0;
  return Math.min(Math.round((progress / goal) * 100), 100);
};