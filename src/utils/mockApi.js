// Mock API - Simula chamadas de API retornando dados mock
import mockData from "../data/mockData.json";

// Simula delay de rede
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Estado em memória para simular banco de dados
let mockDatabase = {
  icons: [...mockData.icons],
  expenses: [...mockData.expenses],
  incomes: [...mockData.incomes],
  assets: [...mockData.assets],
  targets: [...mockData.targets],
  transactions: [...mockData.transactions],
  categories: [...mockData.categories],
  transactionTypes: [...mockData.transactionTypes],
  users: [...mockData.users],
  banks: [...mockData.banks],
  cards: [...mockData.cards],
};

// Função para resetar o banco de dados mock
export const resetMockDatabase = () => {
  mockDatabase = {
    icons: [...mockData.icons],
    expenses: [...mockData.expenses],
    incomes: [...mockData.incomes],
    assets: [...mockData.assets],
    targets: [...mockData.targets],
    transactions: [...mockData.transactions],
    categories: [...mockData.categories],
    transactionTypes: [...mockData.transactionTypes],
    users: [...mockData.users],
    banks: [...mockData.banks],
    cards: [...mockData.cards],
  };
};

/**
 * Função helper para enriquecer categoria com ícone
 */
const enrichCategoryWithIcon = (category) => {
  if (!category) return null;

  const icon = mockDatabase.icons.find((i) => i.id === category.icon_id);
  return {
    ...category,
    icon: icon?.name || "Tag", // Nome do ícone para compatibilidade
    icon_name: icon?.name || "Tag",
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
    const enrichedCategory = enrichCategoryWithIcon(category);

    return {
      ...expense,
      categoriesId: expense.categories_id, // Compatibilidade com código antigo
      category: enrichedCategory?.name || "Desconhecido",
      category_color: enrichedCategory?.color || "#64748b",
      category_icon: enrichedCategory?.icon || "Tag",
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
    const enrichedCategory = enrichCategoryWithIcon(category);

    return {
      ...income,
      categoriesId: income.categories_id, // Compatibilidade com código antigo
      category: enrichedCategory?.name || "Desconhecido",
      category_color: enrichedCategory?.color || "#64748b",
      category_icon: enrichedCategory?.icon || "Tag",
    };
  });
};

/**
 * Enriquece assets com dados de type (agora busca de categories)
 */
const enrichAssets = (assets) => {
  return assets.map((asset) => {
    // Buscar categoria em vez de assetType
    const category = mockDatabase.categories.find(
      (c) => c.id === asset.asset_types_id || c.id === asset.categories_id
    );
    const enrichedCategory = enrichCategoryWithIcon(category);

    return {
      ...asset,
      assetTypesid: asset.asset_types_id || asset.categories_id, // Compatibilidade com código antigo
      categoriesId: asset.categories_id || asset.asset_types_id,
      type: enrichedCategory?.name || "Desconhecido",
      type_color: enrichedCategory?.color || "#64748b",
      type_icon: enrichedCategory?.icon || "Tag",
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
    const enrichedCategory = enrichCategoryWithIcon(category);

    const transactionType = mockDatabase.transactionTypes.find(
      (t) => t.id === transaction.transaction_type_id
    );

    return {
      ...transaction,
      categoryId: transaction.category_id,
      transactionTypeId: transaction.transaction_type_id,
      category_name: enrichedCategory?.name || "Desconhecido",
      category_color: enrichedCategory?.color || "#64748b",
      category_icon: enrichedCategory?.icon || "Tag",
      category_internal_name: enrichedCategory?.internal_name || "unknown",
      type_name: transactionType?.name || "Desconhecido",
      type_color: transactionType?.color || "#64748b",
      type_internal_name: transactionType?.internal_name || "unknown",
    };
  });
};

/**
 * Enriquece banks com dados de ícone
 */
const enrichBankWithIcon = (bank) => {
  if (!bank) return null;

  const icon = mockDatabase.icons.find((i) => i.id === bank.icon_id);
  return {
    ...bank,
    icon: icon?.name || "Wallet",
    icon_name: icon?.name || "Wallet",
  };
};

/**
 * Enriquece cards com dados de ícone e banco
 */
const enrichCardWithIcon = (card) => {
  if (!card) return null;

  const icon = mockDatabase.icons.find((i) => i.id === card.icon_id);
  const bank = card.bank_id
    ? mockDatabase.banks.find((b) => b.id === card.bank_id)
    : null;

  return {
    ...card,
    icon: icon?.name || "CreditCard",
    icon_name: icon?.name || "CreditCard",
    bank_name: bank?.name || null,
  };
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
    "/api/icons": mockDatabase.icons,
    "/api/expenses": enrichExpenses(mockDatabase.expenses),
    "/api/incomes": enrichIncomes(mockDatabase.incomes),
    "/api/assets": enrichAssets(mockDatabase.assets),
    "/api/targets": mockDatabase.targets,
    "/api/transactions": enrichTransactions(mockDatabase.transactions),
    "/api/categories": mockDatabase.categories.map(enrichCategoryWithIcon),
    "/api/transactionTypes": mockDatabase.transactionTypes,
    "/api/banks": mockDatabase.banks.map(enrichBankWithIcon),
    "/api/cards": mockDatabase.cards.map(enrichCardWithIcon),
    // assetTypes agora retorna categories com transactionType = 3 (Aporte) para compatibilidade
    "/api/assetTypes": mockDatabase.categories
      .filter(c => c.transaction_type_id === 3)
      .map(enrichCategoryWithIcon),
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
    paid_date: expense.paid_date || null,
    status: expense.status || "pending",
    payment_method: expense.payment_method || null,
    installments: expense.installments || null,
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
    categories_id: updates.categoriesId !== undefined ? updates.categoriesId : mockDatabase.expenses[index].categories_id,
    title: updates.title !== undefined ? updates.title : mockDatabase.expenses[index].title,
    amount: updates.amount !== undefined ? updates.amount : mockDatabase.expenses[index].amount,
    date: updates.date !== undefined ? updates.date : mockDatabase.expenses[index].date,
    paid_date: updates.paid_date !== undefined ? updates.paid_date : mockDatabase.expenses[index].paid_date,
    status: updates.status !== undefined ? updates.status : mockDatabase.expenses[index].status,
    payment_method: updates.payment_method !== undefined ? updates.payment_method : mockDatabase.expenses[index].payment_method,
    installments: updates.installments !== undefined ? updates.installments : mockDatabase.expenses[index].installments,
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

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = category.icon_id;
  if (!iconId && category.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === category.icon);
    iconId = icon?.id || 84; // 84 é o ID do ícone "Tag" (padrão)
  }
  if (!iconId) {
    iconId = 84; // Ícone padrão "Tag"
  }

  const newCategory = {
    id: Math.max(...mockDatabase.categories.map((c) => c.id), 0) + 1,
    name: category.name,
    color: category.color,
    icon_id: iconId,
    transaction_type_id: category.transaction_type_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.categories.push(newCategory);
  return enrichCategoryWithIcon(newCategory);
};

export const updateCategory = async (id, updates) => {
  await delay();

  const index = mockDatabase.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Categoria não encontrada");
  }

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = updates.icon_id;
  if (!iconId && updates.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === updates.icon);
    iconId = icon?.id;
  }

  mockDatabase.categories[index] = {
    ...mockDatabase.categories[index],
    name: updates.name !== undefined ? updates.name : mockDatabase.categories[index].name,
    color: updates.color !== undefined ? updates.color : mockDatabase.categories[index].color,
    icon_id: iconId !== undefined ? iconId : mockDatabase.categories[index].icon_id,
    transaction_type_id: updates.transaction_type_id !== undefined ? updates.transaction_type_id : mockDatabase.categories[index].transaction_type_id,
    updated_at: new Date().toISOString(),
  };

  return enrichCategoryWithIcon(mockDatabase.categories[index]);
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
// FUNÇÕES CRUD PARA BANKS
// =====================================================

export const createBank = async (bank, userId = null) => {
  await delay();

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = bank.icon_id;
  if (!iconId && bank.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === bank.icon);
    iconId = icon?.id || 1; // 1 é o ID do ícone "Wallet" (padrão)
  }
  if (!iconId) {
    iconId = 1; // Ícone padrão "Wallet"
  }

  const newBank = {
    id: Math.max(...mockDatabase.banks.map((b) => b.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    name: bank.name,
    icon_id: iconId,
    color: bank.color || "#6366f1",
    agency: bank.agency || "",
    account: bank.account || "",
    account_type: bank.account_type || "corrente",
    initial_balance: bank.initial_balance || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.banks.push(newBank);
  return enrichBankWithIcon(newBank);
};

export const updateBank = async (id, updates) => {
  await delay();

  const index = mockDatabase.banks.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error("Banco não encontrado");
  }

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = updates.icon_id;
  if (!iconId && updates.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === updates.icon);
    iconId = icon?.id;
  }

  mockDatabase.banks[index] = {
    ...mockDatabase.banks[index],
    name: updates.name !== undefined ? updates.name : mockDatabase.banks[index].name,
    icon_id: iconId !== undefined ? iconId : mockDatabase.banks[index].icon_id,
    color: updates.color !== undefined ? updates.color : mockDatabase.banks[index].color,
    agency: updates.agency !== undefined ? updates.agency : mockDatabase.banks[index].agency,
    account: updates.account !== undefined ? updates.account : mockDatabase.banks[index].account,
    account_type: updates.account_type !== undefined ? updates.account_type : mockDatabase.banks[index].account_type,
    initial_balance: updates.initial_balance !== undefined ? updates.initial_balance : mockDatabase.banks[index].initial_balance,
    updated_at: new Date().toISOString(),
  };

  return enrichBankWithIcon(mockDatabase.banks[index]);
};

export const deleteBank = async (id) => {
  await delay();

  const index = mockDatabase.banks.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error("Banco não encontrado");
  }

  mockDatabase.banks.splice(index, 1);
  return true;
};

// =====================================================
// FUNÇÕES CRUD PARA CARDS
// =====================================================

export const createCard = async (card, userId = null) => {
  await delay();

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = card.icon_id;
  if (!iconId && card.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === card.icon);
    iconId = icon?.id || 4; // 4 é o ID do ícone "CreditCard" (padrão)
  }
  if (!iconId) {
    iconId = 4; // Ícone padrão "CreditCard"
  }

  const newCard = {
    id: Math.max(...mockDatabase.cards.map((c) => c.id), 0) + 1,
    user_id: userId || mockDatabase.users[0]?.id,
    name: card.name,
    icon_id: iconId,
    color: card.color || "#6366f1",
    card_type: card.card_type || "credito",
    card_brand: card.card_brand || "Visa",
    limit: card.limit || null,
    closing_day: card.closing_day || null,
    due_day: card.due_day || null,
    bank_id: card.bank_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDatabase.cards.push(newCard);
  return enrichCardWithIcon(newCard);
};

export const updateCard = async (id, updates) => {
  await delay();

  const index = mockDatabase.cards.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Cartão não encontrado");
  }

  // Se receber icon (string), buscar o icon_id correspondente
  let iconId = updates.icon_id;
  if (!iconId && updates.icon) {
    const icon = mockDatabase.icons.find((i) => i.name === updates.icon);
    iconId = icon?.id;
  }

  mockDatabase.cards[index] = {
    ...mockDatabase.cards[index],
    name: updates.name !== undefined ? updates.name : mockDatabase.cards[index].name,
    icon_id: iconId !== undefined ? iconId : mockDatabase.cards[index].icon_id,
    color: updates.color !== undefined ? updates.color : mockDatabase.cards[index].color,
    card_type: updates.card_type !== undefined ? updates.card_type : mockDatabase.cards[index].card_type,
    card_brand: updates.card_brand !== undefined ? updates.card_brand : mockDatabase.cards[index].card_brand,
    limit: updates.limit !== undefined ? updates.limit : mockDatabase.cards[index].limit,
    closing_day: updates.closing_day !== undefined ? updates.closing_day : mockDatabase.cards[index].closing_day,
    due_day: updates.due_day !== undefined ? updates.due_day : mockDatabase.cards[index].due_day,
    bank_id: updates.bank_id !== undefined ? updates.bank_id : mockDatabase.cards[index].bank_id,
    updated_at: new Date().toISOString(),
  };

  return enrichCardWithIcon(mockDatabase.cards[index]);
};

export const deleteCard = async (id) => {
  await delay();

  const index = mockDatabase.cards.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Cartão não encontrado");
  }

  mockDatabase.cards.splice(index, 1);
  return true;
};