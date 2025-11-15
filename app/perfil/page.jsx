'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../src/components/ui/card';
import Avatar from '../../src/components/Avatar';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import Spinner from '../../src/components/Spinner';
import { fetchMock, formatCurrency } from '../../src/utils/mockApi';
import { User, Users, DollarSign, TrendingUp, Settings, Save } from 'lucide-react';

/**
 * Página Perfil - Dados do usuário e configurações
 * Exibe informações pessoais, resumo patrimonial e perfil de risco
 */
export default function Perfil() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [riskProfile, setRiskProfile] = useState('moderado');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, summaryData, assetsData] = await Promise.all([
          fetchMock('/api/user'),
          fetchMock('/api/summary'),
          fetchMock('/api/assets'),
        ]);

        setUser(userData.data);
        setSummary(summaryData.data);
        setAssets(assetsData.data);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveProfile = () => {
    // Simulação de salvamento
    setEditing(false);
    alert('Preferências salvas com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const patrimonyTotal = totalAssets + summary.available_balance;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações e preferências</p>
      </div>

      {/* Informações do usuário */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar name={user.name} size="xl" />

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              {user.partner && (
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Conta familiar com {user.partner}</span>
                </div>
              )}

              <div className="flex items-center gap-3 mt-4">
                <Badge variant="default">
                  Moeda: {user.currency}
                </Badge>
                <Badge variant="default">
                  Perfil: {riskProfile}
                </Badge>
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo patrimonial */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo Patrimonial</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-sm font-medium opacity-90">Patrimônio Total</h3>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(patrimonyTotal)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-brand-500" />
                <h3 className="text-sm font-medium text-gray-600">Investimentos</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((totalAssets / patrimonyTotal) * 100).toFixed(1)}% do patrimônio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-green-500" />
                <h3 className="text-sm font-medium text-gray-600">Saldo Disponível</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.available_balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((summary.available_balance / patrimonyTotal) * 100).toFixed(1)}% do patrimônio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribuição de ativos */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Ativos
          </h2>

          <div className="space-y-4">
            {assets.map((asset) => {
              const percentage = ((asset.value / totalAssets) * 100).toFixed(1);
              return (
                <div key={asset.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="default">{asset.type}</Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(asset.value)}
                      </p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-brand-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preferências e configurações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Preferências de Investimento
            </h2>
            <Button
              variant={editing ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
            >
              {editing ? (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              ) : (
                'Editar'
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Perfil de risco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perfil de Risco
              </label>
              {editing ? (
                <select
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="conservador">Conservador</option>
                  <option value="moderado">Moderado</option>
                  <option value="agressivo">Agressivo</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium capitalize">{riskProfile}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Seu perfil de risco ajuda a recomendar investimentos adequados
              </p>
            </div>

            {/* Informações sobre perfis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Conservador</h4>
                <p className="text-xs text-blue-700">
                  Prefere segurança e estabilidade, com foco em renda fixa e baixa volatilidade.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">Moderado</h4>
                <p className="text-xs text-yellow-700">
                  Equilibra segurança e rentabilidade, diversificando entre renda fixa e variável.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-1">Agressivo</h4>
                <p className="text-xs text-red-700">
                  Busca maior rentabilidade aceitando riscos elevados, com foco em renda variável.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de receita */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Financeiras Mensais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Receita Bruta</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(summary.income_gross)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Receita Líquida</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(summary.income_net)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Descontos Matheus</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(summary.discounts.matheus)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Descontos Nayanna</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(summary.discounts.nayanna)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
