import mockRepository from '../repositories/mockRepository';

class AssetService {
  async getAll() {
    const assets = await mockRepository.findAll('assets');
    return assets.map(asset => mockRepository.enrichWithAssetType(asset));
  }

  async getById(id) {
    const asset = await mockRepository.findById('assets', id);
    return asset ? mockRepository.enrichWithAssetType(asset) : null;
  }

  async create(data, userId) {
    const assetData = {
      user_id: userId,
      asset_types_id: data.assetTypesid,
      name: data.name,
      value: data.value,
      yield: data.yield || 0,
      currency: data.currency || 'BRL',
      date: data.date,
    };
    const newAsset = await mockRepository.create('assets', assetData);
    return mockRepository.enrichWithAssetType(newAsset);
  }

  async update(id, data) {
    const updateData = {
      asset_types_id: data.assetTypesid,
      name: data.name,
      value: data.value,
      yield: data.yield,
      currency: data.currency,
      date: data.date,
    };
    const updated = await mockRepository.update('assets', id, updateData);
    return mockRepository.enrichWithAssetType(updated);
  }

  async delete(id) {
    return mockRepository.delete('assets', id);
  }
}

export const assetService = new AssetService();
export default assetService;