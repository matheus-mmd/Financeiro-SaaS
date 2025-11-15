'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../src/components/PageHeader';
import StatsCard from '../../src/components/StatsCard';
import MonthPicker from '../../src/components/MonthPicker';
import { Card, CardContent } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import Spinner from '../../src/components/Spinner';
import Table from '../../src/components/Table';
import ProgressBar from '../../src/components/ProgressBar';
import { fetchMock, formatCurrency, formatDate } from '../../src/utils/mockApi';
import { Target, Plus, Edit, Trash2, CheckCircle, Minus, Download, Filter, TrendingUp } from 'lucide-react';

/**
 * Página Metas - Gerenciamento de metas financeiras
 * Permite visualizar, filtrar, adicionar e acompanhar progresso de metas
 */
export default function Metas() {
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Inicializa com primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    progress: '',
    monthlyAmount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/targets');
        // Adicionar data às metas se não tiver
        const targetsWithDate = response.data.map(target => ({
          ...target,
          date: target.date || new Date().toISOString().split('T')[0]
        }));
        setTargets(targetsWithDate);
        setFilteredTargets(targetsWithDate);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = targets;

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter(t => {
        const [year, month, day] = t.date.split('-');
        const targetDate = new Date(year, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return targetDate >= from && targetDate <= to;
      });
    }

    setFilteredTargets(filtered);
  }, [filterStatus, filterMonth, targets]);

  const handleAddTarget = () => {
    setEditingTarget(null);
    setFormData({
      title: '',
      goal: '',
      progress: '',
      monthlyAmount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    setFormData({
      title: target.title,
      goal: target.goal.toString(),
      progress: target.progress.toString(),
      monthlyAmount: target.monthlyAmount?.toString() || '',
      date: target.date,
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
      date: formData.date,
    };

    if (editingTarget) {
      setTargets(targets.map(t => t.id === editingTarget.id ? newTarget : t));
    } else {
      setTargets([newTarget, ...targets]);
    }

    setModalOpen(false);
    setFormData({ title: '', goal: '', progress: '', monthlyAmount: '', date: new Date().toISOString().split('T')[0] });
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

  // Calcular estatísticas baseadas nas metas filtradas
  const completedTargets = filteredTargets.filter(t => t.status === 'completed');
  const inProgressTargets = filteredTargets.filter(t => t.status === 'in_progress');
  const totalGoalAmount = filteredTargets.reduce((sum, t) => sum + t.goal, 0);
  const totalProgressAmount = filteredTargets.reduce((sum, t) => sum + t.progress, 0);

  // Ordenar metas por progresso percentual (maior primeiro)
  const sortedTargets = useMemo(() => {
    return [...filteredTargets].sort((a, b) => {
      const percentA = (a.progress / a.goal) * 100;
      const percentB = (b.progress / b.goal) * 100;
      return percentB - percentA;
    });
  }, [filteredTargets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Configuração de colunas da tabela
  const targetColumns = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: 'title',
      label: 'Meta',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        if (row.status === 'completed') {
          return (
            <Badge variant="default" className="bg-green-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Concluída
              </span>
            </Badge>
          );
        } else {
          return (
            <Badge variant="default" className="bg-yellow-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Em Andamento
              </span>
            </Badge>
          );
        }
      },
    },
    {
      key: 'progress',
      label: 'Progresso',
      render: (row) => (
        <div className="min-w-[200px]">
          <ProgressBar
            progress={row.progress}
            goal={row.goal}
            variant="brand"
          />
        </div>
      ),
    },
    {
      key: 'goal',
      label: 'Objetivo',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.goal)}
        </span>
      ),
    },
    {
      key: 'current',
      label: 'Atual',
      sortable: true,
      render: (row) => (
        <span className="text-blue-600 font-semibold">
          {formatCurrency(row.progress)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditTarget(row)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Editar meta"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteTarget(row.id)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            aria-label="Excluir meta"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Metas Financeiras"
        description="Defina e acompanhe suas metas"
        actions={
          <>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button onClick={handleAddTarget}>
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Target}
          label="Total de Metas"
          value={filteredTargets.length}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={CheckCircle}
          label="Concluídas"
          value={completedTargets.length}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={TrendingUp}
          label="Em Andamento"
          value={inProgressTargets.length}
          iconColor="yellow"
          valueColor="text-yellow-600"
        />

        <StatsCard
          icon={Target}
          label="Total Objetivos"
          value={formatCurrency(totalGoalAmount)}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por status */}
              <div className="space-y-2">
                <Label htmlFor="filter-status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as metas</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por mês/ano */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Mês e Ano
                </Label>
                <MonthPicker
                  value={filterMonth}
                  onChange={setFilterMonth}
                  placeholder="Selecione o período"
                />
              </div>
            </div>

            {/* Limpar filtros */}
            {(filterStatus !== 'all' || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterMonth(getCurrentMonthRange());
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de metas */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Todas as Metas ({filteredTargets.length})
          </h2>
          <Table
            columns={targetColumns}
            data={sortedTargets}
            pageSize={10}
          />
        </CardContent>
      </Card>

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

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
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
