import mockRepository from '../repositories/mockRepository';

class CategoryService {
  async getCategories() {
    return mockRepository.findAll('categories');
  }

  async getAssetTypes() {
    return mockRepository.findAll('assetTypes');
  }

  async getTransactionTypes() {
    return mockRepository.findAll('transactionTypes');
  }
}

export const categoryService = new CategoryService();
export default categoryService;