// Mock API - Simula chamadas de API retornando dados mock
import mockData from '../data/mockData.json';

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Estado em memória para simular banco de dados
let mockDatabase = {
  expenses: [...mockData.expenses],
  assets: [...mockData.assets],
  targets: [...mockData.targets],
  transactions: [...mockData.transactions],
  categories: [...mockData.categories],
  assetTypes: [...mockData.assetTypes],
  transactionTypes: [...mockData.transactionTypes],
  users: [...mockData.users],
};

// Função para resetar o banco de dados mock
export const resetMockDatabase = () => {
  mockDatabase = {
    expenses: [...mockData.expenses],
    assets: [...mockData.assets],
    targets: [...mockData.targets],
    transactions: [...mockData.transactions],
    categories: [...mockData.categories],
    assetTypes: [...mockData.assetTypes],
    transactionTypes: [...mockData.transactionTypes],
    users: [...mockData.users],
  };
};

/**
 * Enriquece expenses com dados de category
 */
const enrichExpenses = (expenses) => {
  return expenses.map(expense => {
    const category = mockDatabase.categories.find(c => c.id === expense.categories_id);
    return {
      ...expense,
      categoriesId: expense.categories_id, // Compatibilidade com código antigo
      category: category?.name || 'Desconhecido',
      category_color: category?.color || '#64748b'
    };
  });
};

/**
 * Enriquece assets com dados de type
 */
const enrichAssets = (assets) => {
  return assets.map(asset => {
    const assetType = mockDatabase.assetTypes.find(t => t.id === asset.asset_types_id);
    return {
      ...asset,
      assetTypesid: asset.asset_types_id, // Compatibilidade com código antigo
      type: assetType?.name || 'Desconhecido',
      type_color: assetType?.color || '#64748b'
    };
  });
};

/**
 * Enriquece transactions com dados de type
 */
const enrichTransactions = (transactions) => {
  return transactions.map(transaction => {
    const transactionType = mockDatabase.transactionTypes.find(t => t.id === transaction.transaction_types_id);
    return {
      ...transaction,
      transactionTypesid: transaction.transaction_types_id, // Compatibilidade com código antigo
      type: transactionType?.internal_name || 'desconhecido',
      type_name: transactionType?.name || 'Desconhecido',
      type_color: transactionType?.color || '#64748b'
    };
  });
};

/**
 * Função genérica para "buscar" dados mock
 * @param {string} endpoint - Caminho da API mock
 * @returns {Promise} - Retorna os dados correspondentes
 */
export const fetchData = async (endpoint) => {
  await delay();

  const routes = {
    '/api/users': mockDatabase.users,
    '/api/expenses': enrichExpenses(mockDatabase.expenses),
    '/api/assets': enrichAssets(mockDatabase.assets),
    '/api/targets': mockDatabase.targets,
    '/api/transactions': enrichTransactions(mockDatabase.transactions),
    '/api/categories': mockDatabase.categories,
    '/api/assetTypes': mockDatabase.assetTypes,
    '/api/transactionTypes': mockDatabase.transactionTypes,
  };

  if (routes[endpoint]) {
    return { data: routes[endpoint], status: 200 };
  }

  throw new Error(`Endpoint ${endpoint} não encontrado`);
};

// =====================================================
// FUNÇÕES CRUD PARA EXPENSES
// =====================================================

/**
 * Cria uma nova despesa
 * @param {Object} expense - Dados da despesa
 * @param {string} userId - ID do usuário (ignorado no mock)
 * @returns {Promise<Object>} Despesa criada
 */
export const createExpense = async (expense, userId = null) => {
  await delay();

  const newExpense = {
    id: Math.max(...mockDatabase.expenses.map(e => e.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    categories_id: expense.categoriesId,
    title: expense.title,
    amount: expense.amount,
    date: expense.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.expenses.push(newExpense);
  return newExpense;
};

export const updateExpense = async (id, updates) => {
  await delay();

  const index = mockDatabase.expenses.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Despesa não encontrada');
  }

  mockDatabase.expenses[index] = {
    ...mockDatabase.expenses[index],
    categories_id: updates.categoriesId,
    title: updates.title,
    amount: updates.amount,
    date: updates.date,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.expenses[index];
};

export const deleteExpense = async (id) => {
  await delay();

  const index = mockDatabase.expenses.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Despesa não encontrada');
  }

  mockDatabase.expenses.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA ASSETS
// =====================================================

export const createAsset = async (asset, userId = null) => {
  await delay();

  const newAsset = {
    id: Math.max(...mockDatabase.assets.map(a => a.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    asset_types_id: asset.assetTypesid,
    name: asset.name,
    value: asset.value,
    yield: asset.yield || 0,
    currency: asset.currency || 'BRL',
    date: asset.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.assets.push(newAsset);
  return newAsset;
};

export const updateAsset = async (id, updates) => {
  await delay();

  const index = mockDatabase.assets.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Ativo não encontrado');
  }

  mockDatabase.assets[index] = {
    ...mockDatabase.assets[index],
    asset_types_id: updates.assetTypesid,
    name: updates.name,
    value: updates.value,
    yield: updates.yield,
    currency: updates.currency,
    date: updates.date,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.assets[index];
};

export const deleteAsset = async (id) => {
  await delay();

  const index = mockDatabase.assets.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Ativo não encontrado');
  }

  mockDatabase.assets.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA TARGETS
// =====================================================

export const createTarget = async (target, userId = null) => {
  await delay();

  const newTarget = {
    id: Math.max(...mockDatabase.targets.map(t => t.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    title: target.title,
    goal: target.goal,
    progress: target.progress || 0,
    status: target.status || 'in_progress',
    date: target.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.targets.push(newTarget);
  return newTarget;
};

export const updateTarget = async (id, updates) => {
  await delay();

  const index = mockDatabase.targets.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Meta não encontrada');
  }

  mockDatabase.targets[index] = {
    ...mockDatabase.targets[index],
    title: updates.title,
    goal: updates.goal,
    progress: updates.progress,
    status: updates.status,
    date: updates.date,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.targets[index];
};

export const deleteTarget = async (id) => {
  await delay();

  const index = mockDatabase.targets.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Meta não encontrada');
  }

  mockDatabase.targets.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA TRANSACTIONS
// =====================================================

export const createTransaction = async (transaction, userId = null) => {
  await delay();

  const newTransaction = {
    id: Math.max(...mockDatabase.transactions.map(t => t.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    transaction_types_id: transaction.transactionTypesid,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.transactions.push(newTransaction);
  return newTransaction;
};

export const updateTransaction = async (id, updates) => {
  await delay();

  const index = mockDatabase.transactions.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Transação não encontrada');
  }

  mockDatabase.transactions[index] = {
    ...mockDatabase.transactions[index],
    transaction_types_id: updates.transactionTypesid,
    date: updates.date,
    description: updates.description,
    amount: updates.amount,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.transactions[index];
};

export const deleteTransaction = async (id) => {
  await delay();

  const index = mockDatabase.transactions.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Transação não encontrada');
  }

  mockDatabase.transactions.splice(index, 1);
  return true;
};