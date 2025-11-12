import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import LineChart from '../components/charts/LineChart';
import { fetchMock, formatCurrency } from '../utils/mockApi';
import { TrendingUp, DollarSign, Percent, Eye } from 'lucide-react';

/**
 * Página Investimentos - Lista de ativos e detalhamento
 * Permite visualizar detalhes de cada investimento com histórico
 */
export default function Investimentos() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleViewDetails = (asset) => {
    // Gerar histórico mockado para o asset
    const history = generateMockHistory(asset.value, asset.yield);
    setSelectedAsset({ ...asset, history });
    setModalOpen(true);
  };

  // Gera histórico mockado de 4 meses para o ativo
  const generateMockHistory = (currentValue, yieldRate) => {
    const months = ['Ago', 'Set', 'Out', 'Nov'];
    const history = [];
    let value = currentValue;

    for (let i = 3; i >= 0; i--) {
      history.push({
        date: months[3 - i],
        value: parseFloat((value / Math.pow(1 + yieldRate, i)).toFixed(2)),
      });
    }

    return history;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
        <p className="text-gray-500 mt-1">Gerencie seus ativos e acompanhe rendimentos</p>
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
          <Card key={asset.id} hover className="p-6">
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

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => handleViewDetails(asset)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de detalhes do ativo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedAsset?.name}
        size="lg"
      >
        {selectedAsset && (
          <div className="space-y-6">
            {/* Informações principais */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo</p>
                <Badge variant="info">{selectedAsset.type}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Valor Atual</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(selectedAsset.value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rendimento Mensal</p>
                <p className="text-lg font-semibold text-green-600">
                  {(selectedAsset.yield * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Moeda</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedAsset.currency || 'BRL'}
                </p>
              </div>
            </div>

            {/* Gráfico de evolução */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Evolução nos Últimos 4 Meses
              </h3>
              <LineChart data={selectedAsset.history} color="#0ea5a4" />
            </div>

            {/* Comparação com indicador */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Comparação com CDI</h4>
              <p className="text-sm text-gray-600">
                Rendimento acumulado: <span className="font-semibold text-green-600">
                  +{(selectedAsset.yield * 4 * 100).toFixed(2)}%
                </span> (últimos 4 meses)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                * CDI médio no período: ~0.9% a.m. (referência)
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
