import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Spinner from '../components/Spinner';
import MultiLineChart from '../components/charts/MultiLineChart';
import { fetchMock } from '../utils/mockApi';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Página Comparador - Compara rendimento de 2 ativos vs indicador
 * Permite selecionar ativos e visualizar métricas comparativas
 */
export default function Comparador() {
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/comparison');
        setAssets(response.data.assets);
      } catch (error) {
        console.error('Erro ao carregar dados de comparação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectAsset = (index, symbol) => {
    const newSelected = [...selectedAssets];
    newSelected[index] = assets.find(a => a.symbol === symbol) || null;
    setSelectedAssets(newSelected);
  };

  // Prepara dados para o gráfico
  const getChartData = () => {
    if (!selectedAssets[0] || !selectedAssets[1]) return [];

    const dates = selectedAssets[0].history.map(h => h.date);
    return dates.map((date, index) => ({
      date,
      [selectedAssets[0].symbol]: selectedAssets[0].history[index].value,
      [selectedAssets[1].symbol]: selectedAssets[1].history[index].value,
    }));
  };

  // Calcula métricas
  const calculateMetrics = (asset) => {
    if (!asset || !asset.history.length) return null;

    const initial = asset.history[0].value;
    const final = asset.history[asset.history.length - 1].value;
    const returns = ((final - initial) / initial * 100);

    // Volatilidade simplificada (desvio padrão das variações)
    const variations = asset.history.slice(1).map((h, i) =>
      ((h.value - asset.history[i].value) / asset.history[i].value) * 100
    );
    const avgVariation = variations.reduce((sum, v) => sum + v, 0) / variations.length;
    const volatility = Math.sqrt(
      variations.reduce((sum, v) => sum + Math.pow(v - avgVariation, 2), 0) / variations.length
    );

    // Drawdown (maior queda do pico)
    let maxValue = initial;
    let maxDrawdown = 0;
    asset.history.forEach(h => {
      maxValue = Math.max(maxValue, h.value);
      const drawdown = ((h.value - maxValue) / maxValue) * 100;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    });

    return {
      returns: returns.toFixed(2),
      volatility: volatility.toFixed(2),
      drawdown: maxDrawdown.toFixed(2),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const metrics1 = calculateMetrics(selectedAssets[0]);
  const metrics2 = calculateMetrics(selectedAssets[1]);
  const showComparison = selectedAssets[0] && selectedAssets[1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comparador de Ativos</h1>
        <p className="text-gray-500 mt-1">Compare o desempenho de diferentes investimentos</p>
      </div>

      {/* Seletores de ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-gray-900">
                  Ativo {index + 1}
                </h3>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione um ativo
              </label>
              <select
                value={selectedAssets[index]?.symbol || ''}
                onChange={(e) => handleSelectAsset(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">-- Selecionar --</option>
                {assets.map((asset) => (
                  <option
                    key={asset.symbol}
                    value={asset.symbol}
                    disabled={selectedAssets[1-index]?.symbol === asset.symbol}
                  >
                    {asset.name}
                  </option>
                ))}
              </select>

              {selectedAssets[index] && (
                <div className="mt-4">
                  <Badge variant="default">{selectedAssets[index].symbol}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico comparativo */}
      {showComparison && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Comparação de Desempenho
            </h2>
            <MultiLineChart
              data={getChartData()}
              lines={[
                {
                  dataKey: selectedAssets[0].symbol,
                  color: '#0ea5a4',
                  name: selectedAssets[0].name,
                },
                {
                  dataKey: selectedAssets[1].symbol,
                  color: '#8b5cf6',
                  name: selectedAssets[1].name,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabela de métricas */}
      {showComparison && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Métricas Comparativas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Métrica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {selectedAssets[0].name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {selectedAssets[1].name}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Retorno Acumulado
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${parseFloat(metrics1.returns) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics1.returns}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${parseFloat(metrics2.returns) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics2.returns}%
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Volatilidade
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {metrics1.volatility}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {metrics2.volatility}%
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Drawdown Máximo
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600">
                        {metrics1.drawdown}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600">
                        {metrics2.drawdown}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Análise resumida */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Análise Resumida</h3>
              <p className="text-sm text-blue-800">
                {parseFloat(metrics1.returns) > parseFloat(metrics2.returns) ? (
                  <>
                    <strong>{selectedAssets[0].name}</strong> apresentou melhor retorno (+{metrics1.returns}%)
                    comparado a <strong>{selectedAssets[1].name}</strong> (+{metrics2.returns}%).
                  </>
                ) : (
                  <>
                    <strong>{selectedAssets[1].name}</strong> apresentou melhor retorno (+{metrics2.returns}%)
                    comparado a <strong>{selectedAssets[0].name}</strong> (+{metrics1.returns}%).
                  </>
                )}
                {' '}A volatilidade indica o risco de oscilação dos ativos no período.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!showComparison && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecione dois ativos para comparar
            </h3>
            <p className="text-gray-500">
              Escolha os ativos acima para visualizar gráficos e métricas comparativas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
