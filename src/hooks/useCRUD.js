import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useCRUD = (service, { onSuccess, entityName = 'Item' } = {}) => {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await service.create(data, user?.id);
      success(`${entityName} criado com sucesso`);
      onSuccess?.();
      return result;
    } catch (err) {
      notifyError(`Erro ao criar ${entityName.toLowerCase()}`);
      console.error('Create error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, user, entityName, success, notifyError, onSuccess]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const result = await service.update(id, data);
      success(`${entityName} atualizado com sucesso`);
      onSuccess?.();
      return result;
    } catch (err) {
      notifyError(`Erro ao atualizar ${entityName.toLowerCase()}`);
      console.error('Update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, entityName, success, notifyError, onSuccess]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      await service.delete(id);
      success(`${entityName} excluído com sucesso`);
      onSuccess?.();
      return true;
    } catch (err) {
      notifyError(`Erro ao excluir ${entityName.toLowerCase()}`);
      console.error('Delete error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, entityName, success, notifyError, onSuccess]);

  return { create, update, remove, loading };
};