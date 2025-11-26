import mockData from '../data/mockData.json';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

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

class MockRepository {
  async delay() {
    await delay();
  }

  // Generic CRUD
  async findAll(entity) {
    await this.delay();
    return [...mockDatabase[entity]];
  }

  async findById(entity, id) {
    await this.delay();
    return mockDatabase[entity].find(item => item.id === id);
  }

  async create(entity, data) {
    await this.delay();
    const newId = Math.max(...mockDatabase[entity].map(e => e.id), 0) + 1;
    const newItem = {
      id: newId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDatabase[entity].push(newItem);
    return newItem;
  }

  async update(entity, id, updates) {
    await this.delay();
    const index = mockDatabase[entity].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${entity} not found`);
    }
    mockDatabase[entity][index] = {
      ...mockDatabase[entity][index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockDatabase[entity][index];
  }

  async delete(entity, id) {
    await this.delay();
    const index = mockDatabase[entity].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${entity} not found`);
    }
    mockDatabase[entity].splice(index, 1);
    return true;
  }

  reset() {
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
  }

  // Enrichment helpers
  enrichWithCategory(item) {
    const category = mockDatabase.categories.find(c => c.id === item.categories_id);
    return {
      ...item,
      categoriesId: item.categories_id,
      category: category?.name || 'Desconhecido',
      category_color: category?.color || '#64748b',
    };
  }

  enrichWithAssetType(item) {
    const assetType = mockDatabase.assetTypes.find(t => t.id === item.asset_types_id);
    return {
      ...item,
      assetTypesid: item.asset_types_id,
      type: assetType?.name || 'Desconhecido',
      type_color: assetType?.color || '#64748b',
    };
  }

  enrichWithTransactionType(item) {
    const transactionType = mockDatabase.transactionTypes.find(t => t.id === item.transaction_types_id);
    return {
      ...item,
      transactionTypesid: item.transaction_types_id,
      type: transactionType?.internal_name || 'desconhecido',
      type_name: transactionType?.name || 'Desconhecido',
      type_color: transactionType?.color || '#64748b',
    };
  }
}

export const mockRepository = new MockRepository();
export default mockRepository;