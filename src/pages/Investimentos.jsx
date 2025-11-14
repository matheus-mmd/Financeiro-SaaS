import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { fetchMock, formatCurrency } from '../utils/mockApi';
import { TrendingUp, DollarSign, Percent, Plus } from 'lucide-react';

/**
 * Página Investimentos - Lista de ativos e detalhamento
 * Permite visualizar detalhes de cada investimento com histórico
 */
export default function Investimentos() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newInvestmentModalOpen, setNewInvestmentModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'Poupança',
    value: '',
    yield: ''
  });
  const [contributeAmount, setContributeAmount] = useState('');
  const [editYield, setEditYield] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/assets');
        setAssets(response.data);
      } catch (error) {
        console.error('Erro ao carregar investimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalInvestments = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Criar novo investimento
  const handleCreateInvestment = () => {
    if (!newInvestment.name || !newInvestment.value) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    const investment = {
      id: Date.now(),
      name: newInvestment.name,
      type: newInvestment.type,
      value: parseFloat(newInvestment.value),
      yield: newInvestment.yield ? parseFloat(newInvestment.yield) / 100 : 0,
      currency: 'BRL'
    };

    setAssets([...assets, investment]);
    setNewInvestmentModalOpen(false);
    setNewInvestment({ name: '', type: 'Poupança', value: '', yield: '' });
  };

  // Fazer aporte/retirada em investimento existente
  const handleContribute = () => {
    const amount = contributeAmount ? parseFloat(contributeAmount) : 0;
    const newValue = selectedAsset.value + amount;

    if (newValue < 0) {
      alert('O saldo do investimento não pode ficar negativo');
      return;
    }

    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          value: newValue,
          yield: editYield !== '' ? parseFloat(editYield) / 100 : 0
        };
      }
      return asset;
    });

    setAssets(updatedAssets);
    setContributeModalOpen(false);
    setContributeAmount('');
    setEditYield('');
  };

  const handleOpenContribute = (asset) => {
    setSelectedAsset(asset);
    setEditYield(asset.yield > 0 ? (asset.yield * 100).toFixed(2) : '');
    setContributeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus ativos e acompanhe rendimentos</p>
        </div>
        <Button onClick={() => setNewInvestmentModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Novo Investimento
        </Button>
      </div>

      {/* Total investido */}
      <Card className="p-6 bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8" />
          <h2 className="text-lg font-medium opacity-90">Total Investido</h2>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(totalInvestments)}</p>
        <p className="text-sm opacity-75 mt-2">
          {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'} na carteira
        </p>
      </Card>

      {/* Grid de ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card
            key={asset.id}
            hover
            className="p-6 cursor-pointer"
            onClick={() => handleOpenContribute(asset)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="info" className="mb-2">
                  {asset.type}
                </Badge>
                <h3 className="font-semibold text-gray-900 text-lg">{asset.name}</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Valor Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(asset.value)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Rendimento: {(asset.yield * 100).toFixed(2)}% a.m.
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de novo investimento */}
      <Modal
        isOpen={newInvestmentModalOpen}
        onClose={() => setNewInvestmentModalOpen(false)}
        title="Novo Investimento"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Investimento
            </label>
            <input
              type="text"
              value={newInvestment.name}
              onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
              placeholder="Ex: Poupança Banco X, CDB, Tesouro Direto"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={newInvestment.type}
              onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Poupança">Poupança</option>
              <option value="CDB">CDB</option>
              <option value="Tesouro Direto">Tesouro Direto</option>
              <option value="Ações">Ações</option>
              <option value="Fundos">Fundos de Investimento</option>
              <option value="Criptomoedas">Criptomoedas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Inicial (R$)
            </label>
            <input
              type="number"
              value={newInvestment.value}
              onChange={(e) => setNewInvestment({ ...newInvestment, value: e.target.value })}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rendimento Mensal (%) <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              value={newInvestment.yield}
              onChange={(e) => setNewInvestment({ ...newInvestment, yield: e.target.value })}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ex: Para 0,7% ao mês, digite 0.7. Deixe em branco se não souber.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setNewInvestmentModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateInvestment}
            >
              Criar Investimento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de aporte/retirada */}
      <Modal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        title={selectedAsset?.name}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Atual
            </label>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(selectedAsset?.value || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adicionar ou Retirar (R$)
            </label>
            <input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              placeholder="0,00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use valores positivos para adicionar e negativos para retirar (ex: -500)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rendimento Mensal (%)
            </label>
            <input
              type="number"
              value={editYield}
              onChange={(e) => setEditYield(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Atualize o rendimento ou deixe vazio para 0%
            </p>
          </div>

          {contributeAmount && contributeAmount !== '0' && (
            <div className={`p-3 rounded-lg ${parseFloat(contributeAmount) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">
                {parseFloat(contributeAmount) >= 0 ? 'Novo valor total:' : 'Novo valor após retirada:'}
              </p>
              <p className={`text-xl font-bold ${parseFloat(contributeAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency((selectedAsset?.value || 0) + parseFloat(contributeAmount))}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setContributeModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleContribute}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
