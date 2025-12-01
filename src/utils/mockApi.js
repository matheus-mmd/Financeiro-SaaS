// Mock API - Simula chamadas de API retornando dados mock
import mockData from "../data/mockData.json";

// Simula delay de rede
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Estado em memória para simular banco de dados
let mockDatabase = {
  expenses: [...mockData.expenses],
  incomes: [...mockData.incomes],
  assets: [...mockData.assets],
  targets: [...mockData.targets],
  transactions: [...mockData.transactions],
  categories: [...mockData.categories],
  transactionTypes: [...mockData.transactionTypes],
  assetTypes: [...mockData.assetTypes],
  users: [...mockData.users],
};

// Função para resetar o banco de dados mock
export const resetMockDatabase = () => {
  mockDatabase = {
    expenses: [...mockData.expenses],
    incomes: [...mockData.incomes],
    assets: [...mockData.assets],
    targets: [...mockData.targets],
    transactions: [...mockData.transactions],
    categories: [...mockData.categories],
    transactionTypes: [...mockData.transactionTypes],
    assetTypes: [...mockData.assetTypes],
    users: [...mockData.users],
  };
};

/**
 * Enriquece expenses com dados de category
 */
const enrichExpenses = (expenses) => {
  return expenses.map((expense) => {
    const category = mockDatabase.categories.find(
      (c) => c.id === expense.categories_id
    );
    return {
      ...expense,
      categoriesId: expense.categories_id, // Compatibilidade com código antigo
      category: category?.name || "Desconhecido",
      category_color: category?.color || "#64748b",
    };
  });
};

/**
 * Enriquece incomes com dados de category
 */
const enrichIncomes = (incomes) => {
  return incomes.map((income) => {
    const category = mockDatabase.categories.find(
      (c) => c.id === income.categories_id
    );
    return {
      ...income,
      categoriesId: income.categories_id, // Compatibilidade com código antigo
      category: category?.name || "Desconhecido",
      category_color: category?.color || "#64748b",
    };
  });
};

/**
 * Enriquece assets com dados de type
 */
const enrichAssets = (assets) => {
  return assets.map((asset) => {
    const assetType = mockDatabase.assetTypes.find(
      (t) => t.id === asset.asset_types_id
    );
    return {
      ...asset,
      assetTypesid: asset.asset_types_id, // Compatibilidade com código antigo
      type: assetType?.name || "Desconhecido",
      type_color: assetType?.color || "#64748b",
    };
  });
};

/**
 * Enriquece transactions com dados de category e type
 */
const enrichTransactions = (transactions) => {
  return transactions.map((transaction) => {
    const category = mockDatabase.categories.find(
      (c) => c.id === transaction.category_id
    );

    const transactionType = mockDatabase.transactionTypes.find(
      (t) => t.id === transaction.transaction_type_id
    );

    return {
      ...transaction,
      categoryId: transaction.category_id,
      transactionTypeId: transaction.transaction_type_id,
      category_name: category?.name || "Desconhecido",
      category_color: category?.color || "#64748b",
      category_internal_name: category?.internal_name || "unknown",
      type_name: transactionType?.name || "Desconhecido",
      type_color: transactionType?.color || "#64748b",
      type_internal_name: transactionType?.internal_name || "unknown",
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
    "/api/users": mockDatabase.users,
    "/api/expenses": enrichExpenses(mockDatabase.expenses),
    "/api/incomes": enrichIncomes(mockDatabase.incomes),
    "/api/assets": enrichAssets(mockDatabase.assets),
    "/api/targets": mockDatabase.targets,
    "/api/transactions": enrichTransactions(mockDatabase.transactions),
    "/api/categories": mockDatabase.categories,
    "/api/transactionTypes": mockDatabase.transactionTypes,
    "/api/assetTypes": mockDatabase.assetTypes,
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
    id: Math.max(...mockDatabase.expenses.map((e) => e.id), 0) + 1,
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

  const index = mockDatabase.expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error("Despesa não encontrada");
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

  const index = mockDatabase.expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error("Despesa não encontrada");
  }

  mockDatabase.expenses.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA INCOMES
// =====================================================

/**
 * Cria uma nova receita
 * @param {Object} income - Dados da receita
 * @param {string} userId - ID do usuário (ignorado no mock)
 * @returns {Promise<Object>} Receita criada
 */
export const createIncome = async (income, userId = null) => {
  await delay();

  const newIncome = {
    id: Math.max(...mockDatabase.incomes.map((i) => i.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    categories_id: income.categoriesId,
    title: income.title,
    amount: income.amount,
    date: income.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.incomes.push(newIncome);
  return newIncome;
};

export const updateIncome = async (id, updates) => {
  await delay();

  const index = mockDatabase.incomes.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error("Receita não encontrada");
  }

  mockDatabase.incomes[index] = {
    ...mockDatabase.incomes[index],
    categories_id: updates.categoriesId,
    title: updates.title,
    amount: updates.amount,
    date: updates.date,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.incomes[index];
};

export const deleteIncome = async (id) => {
  await delay();

  const index = mockDatabase.incomes.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error("Receita não encontrada");
  }

  mockDatabase.incomes.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA ASSETS
// =====================================================

export const createAsset = async (asset, userId = null) => {
  await delay();

  const newAsset = {
    id: Math.max(...mockDatabase.assets.map((a) => a.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    asset_types_id: asset.assetTypesid,
    name: asset.name,
    value: asset.value,
    yield: asset.yield || 0,
    currency: asset.currency || "BRL",
    date: asset.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.assets.push(newAsset);
  return newAsset;
};

export const updateAsset = async (id, updates) => {
  await delay();

  const index = mockDatabase.assets.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error("Ativo não encontrado");
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

  const index = mockDatabase.assets.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error("Ativo não encontrado");
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
    id: Math.max(...mockDatabase.targets.map((t) => t.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    title: target.title,
    goal: target.goal,
    progress: target.progress || 0,
    status: target.status || "in_progress",
    date: target.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.targets.push(newTarget);
  return newTarget;
};

export const updateTarget = async (id, updates) => {
  await delay();

  const index = mockDatabase.targets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Meta não encontrada");
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

  const index = mockDatabase.targets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Meta não encontrada");
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
    id: Math.max(...mockDatabase.transactions.map((t) => t.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    category_id: transaction.categoryId,
    transaction_type_id: transaction.transactionTypeId,
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

  const index = mockDatabase.transactions.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Transação não encontrada");
  }

  mockDatabase.transactions[index] = {
    ...mockDatabase.transactions[index],
    category_id: updates.categoryId,
    transaction_type_id: updates.transactionTypeId,
    date: updates.date,
    description: updates.description,
    amount: updates.amount,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.transactions[index];
};

export const deleteTransaction = async (id) => {
  await delay();

  const index = mockDatabase.transactions.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Transação não encontrada");
  }

  mockDatabase.transactions.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA CATEGORIES
// =====================================================

export const createCategory = async (category) => {
  await delay();

  const newCategory = {
    id: Math.max(...mockDatabase.categories.map((c) => c.id), 0) + 1,
    name: category.name,
    color: category.color,
    internal_name: category.internal_name || category.name.toLowerCase().replace(/\s+/g, '_'),
    transactionTypes: category.transactionTypes || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.categories.push(newCategory);
  return newCategory;
};

export const updateCategory = async (id, updates) => {
  await delay();

  const index = mockDatabase.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Categoria não encontrada");
  }

  mockDatabase.categories[index] = {
    ...mockDatabase.categories[index],
    name: updates.name !== undefined ? updates.name : mockDatabase.categories[index].name,
    color: updates.color !== undefined ? updates.color : mockDatabase.categories[index].color,
    internal_name: updates.internal_name !== undefined ? updates.internal_name : mockDatabase.categories[index].internal_name,
    transactionTypes: updates.transactionTypes !== undefined ? updates.transactionTypes : mockDatabase.categories[index].transactionTypes,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.categories[index];
};

export const deleteCategory = async (id) => {
  await delay();

  const index = mockDatabase.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Categoria não encontrada");
  }

  mockDatabase.categories.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES PARA GERENCIAR TIPOS DE TRANSAÇÃO NAS CATEGORIAS
// =====================================================

/**
 * Adiciona um tipo de transação permitido a uma categoria
 */
export const addTransactionTypeToCategory = async (categoryId, transactionTypeId) => {
  await delay();

  const categoryIndex = mockDatabase.categories.findIndex(
    (c) => c.id === categoryId
  );
  if (categoryIndex === -1) {
    throw new Error("Categoria não encontrada");
  }

  const category = mockDatabase.categories[categoryIndex];

  // Verifica se o tipo de transação existe
  const typeExists = mockDatabase.transactionTypes.some(
    (t) => t.id === transactionTypeId
  );
  if (!typeExists) {
    throw new Error("Tipo de transação não encontrado");
  }

  // Verifica se já não está adicionado
  if (category.transactionTypes.includes(transactionTypeId)) {
    return category;
  }

  category.transactionTypes.push(transactionTypeId);
  category.updated_at = new Date().toISOString();

  return category;
};

/**
 * Remove um tipo de transação permitido de uma categoria
 */
export const removeTransactionTypeFromCategory = async (categoryId, transactionTypeId) => {
  await delay();

  const categoryIndex = mockDatabase.categories.findIndex(
    (c) => c.id === categoryId
  );
  if (categoryIndex === -1) {
    throw new Error("Categoria não encontrada");
  }

  const category = mockDatabase.categories[categoryIndex];
  const typeIndex = category.transactionTypes.indexOf(transactionTypeId);

  if (typeIndex === -1) {
    return category;
  }

  category.transactionTypes.splice(typeIndex, 1);
  category.updated_at = new Date().toISOString();

  return category;
};

// =====================================================
// FUNÇÕES CRUD PARA ASSET TYPES
// =====================================================

export const createAssetType = async (assetType) => {
  await delay();

  const newType = {
    id: Math.max(...mockDatabase.assetTypes.map((t) => t.id), 0) + 1,
    name: assetType.name,
    color: assetType.color,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.assetTypes.push(newType);
  return newType;
};

export const updateAssetType = async (id, updates) => {
  await delay();

  const index = mockDatabase.assetTypes.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Tipo de ativo não encontrado");
  }

  mockDatabase.assetTypes[index] = {
    ...mockDatabase.assetTypes[index],
    name: updates.name,
    color: updates.color,
    updated_at: new Date().toISOString(),
  };

  return mockDatabase.assetTypes[index];
};

export const deleteAssetType = async (id) => {
  await delay();

  const index = mockDatabase.assetTypes.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Tipo de ativo não encontrado");
  }

  mockDatabase.assetTypes.splice(index, 1);
  return true;
};