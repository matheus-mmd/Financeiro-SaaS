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
import { fetchMock, formatCurrency, formatDate } from '../../src/utils/mockApi';
import { TrendingUp, DollarSign, Percent, Plus, Filter, Download, Edit, Trash2, Wallet } from 'lucide-react';

/**
 * Página Investimentos - Gerenciamento de ativos e investimentos
 * Permite visualizar, filtrar, adicionar e gerenciar investimentos
 */
export default function Investimentos() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Inicializa com primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    name: '',
    type: 'Poupança',
    value: '',
    yield: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/assets');
        // Adicionar data aos ativos se não tiver
        const assetsWithDate = response.data.map(asset => ({
          ...asset,
          date: asset.date || new Date().toISOString().split('T')[0]
        }));
        setAssets(assetsWithDate);
        setFilteredAssets(assetsWithDate);
      } catch (error) {
        console.error('Erro ao carregar investimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = assets;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter(a => {
        const [year, month, day] = a.date.split('-');
        const assetDate = new Date(year, month - 1, day);
        assetDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return assetDate >= from && assetDate <= to;
      });
    }

    setFilteredAssets(filtered);
  }, [filterType, filterMonth, assets]);

  const totalInvestments = filteredAssets.reduce((sum, asset) => sum + asset.value, 0);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      type: 'Poupança',
      value: '',
      yield: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      yield: asset.yield ? (asset.yield * 100).toString() : '',
      date: asset.date,
    });
    setModalOpen(true);
  };

  const handleDeleteAsset = (id) => {
    if (confirm('Deseja realmente excluir este investimento?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const assetData = {
      id: editingAsset?.id || Date.now(),
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      yield: formData.yield ? parseFloat(formData.yield) / 100 : 0,
      date: formData.date,
      currency: 'BRL'
    };

    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? assetData : a));
    } else {
      setAssets([assetData, ...assets]);
    }

    setModalOpen(false);
    setFormData({ name: '', type: 'Poupança', value: '', yield: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Calcular estatísticas baseadas nos investimentos filtrados
  const averageYield = filteredAssets.length > 0
    ? filteredAssets.reduce((sum, a) => sum + (a.yield || 0), 0) / filteredAssets.length
    : 0;

  // Ordenar investimentos por valor (maior primeiro)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      // Ordenar por valor (descendente - maior primeiro)
      return b.value - a.value;
    });
  }, [filteredAssets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Tipos de investimento únicos
  const investmentTypes = ['Poupança', 'CDB', 'Tesouro Direto', 'Ações', 'Fundos', 'Criptomoedas', 'Outros'];

  // Configuração de colunas da tabela
  const assetColumns = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (row) => (
        <Badge variant="default" className="bg-blue-500">
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'value',
      label: 'Valor',
      sortable: true,
      render: (row) => (
        <span className="text-green-600 font-semibold">
          {formatCurrency(row.value)}
        </span>
      ),
    },
    {
      key: 'yield',
      label: 'Rendimento',
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">
          {(row.yield * 100).toFixed(2)}% a.m.
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditAsset(row)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Editar investimento"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteAsset(row.id)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            aria-label="Excluir investimento"
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
        title="Investimentos"
        description="Gerencie seus ativos e acompanhe rendimentos"
        actions={
          <>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="w-4 h-4" />
              Novo Investimento
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          icon={DollarSign}
          label="Total Investido"
          value={formatCurrency(totalInvestments)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={Wallet}
          label="Total de Ativos"
          value={filteredAssets.length}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={Percent}
          label="Rendimento Médio"
          value={`${(averageYield * 100).toFixed(2)}% a.m.`}
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
              {/* Filtro por tipo */}
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-sm font-medium text-gray-700">
                  Tipo de Investimento
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
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
            {(filterType !== 'all' || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
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

      {/* Tabela de investimentos */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Todos os Investimentos ({filteredAssets.length})
          </h2>
          <Table
            columns={assetColumns}
            data={sortedAssets}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar investimento */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Investimento</Label>
              <Input
                id="name"
                placeholder="Ex: Poupança Banco X, CDB, Tesouro Direto"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield">
                Rendimento Mensal (%) <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="yield"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.yield}
                onChange={(e) => handleInputChange('yield', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: Para 0,7% ao mês, digite 0.7
              </p>
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
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              {editingAsset ? 'Salvar' : 'Adicionar Investimento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
