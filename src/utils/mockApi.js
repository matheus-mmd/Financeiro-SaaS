// Mock API - Simula chamadas de API retornando dados mock
import mockData from '../data/mockData.json';

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função genérica para "buscar" dados mock
 * @param {string} endpoint - Caminho da API mock
 * @returns {Promise} - Retorna os dados correspondentes
 */
export const fetchMock = async (endpoint) => {
  await delay();

  const routes = {
    '/api/user': mockData.user,
    '/api/expenses': mockData.expenses,
    '/api/assets': mockData.assets,
    '/api/targets': mockData.targets,
    '/api/transactions': mockData.transactions,
    '/api/categories': mockData.categories,
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
