import { useState, useCallback } from 'react';
import { toISODate } from '../formatters';

export const useFormModal = (initialFormState = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setFormData(initialFormState);
    setIsOpen(true);
  }, [initialFormState]);

  const openEdit = useCallback((item, transformer = null) => {
    setEditingItem(item);
    const data = transformer ? transformer(item) : item;
    setFormData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
  }, [initialFormState]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (submitFn) => {
    try {
      const preparedData = { ...formData };

      // Convert Date objects to ISO strings
      Object.keys(preparedData).forEach(key => {
        if (preparedData[key] instanceof Date) {
          preparedData[key] = toISODate(preparedData[key]);
        }
      });

      await submitFn(preparedData, editingItem);
      close();
    } catch (error) {
      console.error('Form submit error:', error);
      throw error;
    }
  }, [formData, editingItem, close]);

  return {
    isOpen,
    editingItem,
    formData,
    openCreate,
    openEdit,
    close,
    updateField,
    handleSubmit,
    isEditing: !!editingItem,
  };
};