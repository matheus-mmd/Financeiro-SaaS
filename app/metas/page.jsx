'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import Spinner from '../../src/components/Spinner';
import ProgressBar from '../../src/components/ProgressBar';
import { fetchMock, formatCurrency } from '../../src/utils/mockApi';
import { Target, Plus, Edit, Trash2, CheckCircle, Minus } from 'lucide-react';

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
    monthlyAmount: '',
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
    setFormData({ title: '', goal: '', progress: '', monthlyAmount: '' });
    setModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    setFormData({
      title: target.title,
      goal: target.goal.toString(),
      progress: target.progress.toString(),
      monthlyAmount: target.monthlyAmount?.toString() || '',
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
      monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : 0,
      status: parseFloat(formData.progress || 0) >= parseFloat(formData.goal) ? 'completed' : 'in_progress',
    };

    if (editingTarget) {
      setTargets(targets.map(t => t.id === editingTarget.id ? newTarget : t));
    } else {
      setTargets([...targets, newTarget]);
    }

    setModalOpen(false);
    setFormData({ title: '', goal: '', progress: '', monthlyAmount: '' });
  };

  const calculateMonthsToGoal = (goal, progress, monthlyAmount) => {
    if (!monthlyAmount || monthlyAmount <= 0) return null;
    const remaining = goal - progress;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / monthlyAmount);
  };

  const getTargetDate = (months) => {
    if (months === null || months === 0) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-brand-500" />
              <div>
                <p className="text-sm text-gray-500">Total de Metas</p>
                <p className="text-2xl font-bold text-gray-900">{targets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedTargets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTargets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas em andamento */}
      {inProgressTargets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Em Andamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressTargets.map((target) => (
              <Card key={target.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="default">Em andamento</Badge>
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

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Faltam</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(target.goal - target.progress)}
                      </span>
                    </div>
                    {target.monthlyAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Guardar por mês</span>
                          <span className="font-semibold text-brand-600">
                            {formatCurrency(target.monthlyAmount)}
                          </span>
                        </div>
                        {(() => {
                          const months = calculateMonthsToGoal(target.goal, target.progress, target.monthlyAmount);
                          const targetDate = getTargetDate(months);
                          return targetDate && (
                            <div className="text-sm text-gray-600 mt-2 p-2 bg-brand-50 rounded">
                              Assim você alcança o seu objetivo em <span className="font-semibold text-brand-600">{targetDate}</span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </CardContent>
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
              <Card key={target.id} className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="default">Concluída</Badge>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTarget(target)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        aria-label="Editar meta"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteTarget(target.id)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        aria-label="Excluir meta"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{target.title}</h3>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{formatCurrency(target.goal)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {targets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma meta cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece definindo suas metas financeiras e acompanhe seu progresso.
            </p>
            <Button onClick={handleAddTarget}>
              <Plus className="w-4 h-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de adicionar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTarget ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Meta</Label>
              <Input
                id="title"
                placeholder="Ex: Reserva de emergência"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Valor Objetivo (R$)</Label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Valor Atual (R$)</Label>
              <Input
                id="progress"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthlyAmount" className="block mb-2">
                Guardar por mês (R$) <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(formData.monthlyAmount) || 0;
                    const newValue = Math.max(0, current - 100);
                    handleInputChange('monthlyAmount', newValue.toString());
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-700" />
                </button>

                <input
                  id="monthlyAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.monthlyAmount}
                  onChange={(e) => handleInputChange('monthlyAmount', e.target.value)}
                  className="flex-1 px-4 py-3 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(formData.monthlyAmount) || 0;
                    const newValue = current + 100;
                    handleInputChange('monthlyAmount', newValue.toString());
                  }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {formData.monthlyAmount && parseFloat(formData.monthlyAmount) > 0 && formData.goal && (
                <div className="mt-3 p-3 bg-brand-50 rounded-lg text-sm">
                  {(() => {
                    const months = calculateMonthsToGoal(
                      parseFloat(formData.goal),
                      parseFloat(formData.progress || 0),
                      parseFloat(formData.monthlyAmount)
                    );
                    const targetDate = getTargetDate(months);
                    return targetDate ? (
                      <p className="text-gray-700">
                        Assim você alcança o seu objetivo em <span className="font-semibold text-brand-600">{targetDate}</span>
                      </p>
                    ) : (
                      <p className="text-green-600 font-semibold">Meta já alcançada!</p>
                    );
                  })()}
                </div>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} type="button">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} type="button">
              {editingTarget ? 'Salvar' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
