import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { fetchMock, formatCurrency } from '../utils/mockApi';
import { Target, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

/**
 * Página Metas - CRUD de metas financeiras
 * Permite criar, editar, deletar e acompanhar progresso de metas
 */
export default function Metas() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    progress: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/targets');
        setTargets(response.data);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTarget = () => {
    setEditingTarget(null);
    setFormData({ title: '', goal: '', progress: '' });
    setModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    setFormData({
      title: target.title,
      goal: target.goal.toString(),
      progress: target.progress.toString(),
    });
    setModalOpen(true);
  };

  const handleDeleteTarget = (id) => {
    if (confirm('Deseja realmente excluir esta meta?')) {
      setTargets(targets.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTarget = {
      id: editingTarget?.id || `t${Date.now()}`,
      title: formData.title,
      goal: parseFloat(formData.goal),
      progress: parseFloat(formData.progress || 0),
      status: parseFloat(formData.progress || 0) >= parseFloat(formData.goal) ? 'completed' : 'in_progress',
    };

    if (editingTarget) {
      setTargets(targets.map(t => t.id === editingTarget.id ? newTarget : t));
    } else {
      setTargets([...targets, newTarget]);
    }

    setModalOpen(false);
    setFormData({ title: '', goal: '', progress: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const completedTargets = targets.filter(t => t.status === 'completed');
  const inProgressTargets = targets.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-500 mt-1">Defina e acompanhe suas metas</p>
        </div>
        <Button onClick={handleAddTarget}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-brand-500" />
            <div>
              <p className="text-sm text-gray-500">Total de Metas</p>
              <p className="text-2xl font-bold text-gray-900">{targets.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{completedTargets.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Em Andamento</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgressTargets.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Metas em andamento */}
      {inProgressTargets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Em Andamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressTargets.map((target) => (
              <Card key={target.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="warning">Em andamento</Badge>
                    <h3 className="font-semibold text-gray-900 text-lg mt-2">
                      {target.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTarget(target)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Editar meta"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(target.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <ProgressBar
                  progress={target.progress}
                  goal={target.goal}
                  variant="brand"
                />

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Faltam</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(target.goal - target.progress)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Metas concluídas */}
      {completedTargets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Concluídas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTargets.map((target) => (
              <Card key={target.id} className="p-6 bg-green-50 border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="success">Concluída</Badge>
                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    aria-label="Excluir meta"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{target.title}</h3>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{formatCurrency(target.goal)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {targets.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma meta cadastrada
          </h3>
          <p className="text-gray-500 mb-6">
            Comece definindo suas metas financeiras e acompanhe seu progresso.
          </p>
          <Button onClick={handleAddTarget}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Meta
          </Button>
        </Card>
      )}

      {/* Modal de adicionar/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTarget ? 'Editar Meta' : 'Nova Meta'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingTarget ? 'Salvar' : 'Criar Meta'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Título da Meta"
            placeholder="Ex: Reserva de emergência"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />

          <Input
            label="Valor Objetivo (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            required
          />

          <Input
            label="Valor Atual (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.progress}
            onChange={(e) => handleInputChange('progress', e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
