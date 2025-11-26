/**
 * Storage Adapter - Abstração para diferentes tipos de storage
 */

class StorageAdapter {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  get(key) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  }

  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

export const localStorageAdapter = new StorageAdapter(
  typeof window !== 'undefined' ? localStorage : null
);

export const sessionStorageAdapter = new StorageAdapter(
  typeof window !== 'undefined' ? sessionStorage : null
);

export default StorageAdapter;