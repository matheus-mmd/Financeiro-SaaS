import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Card de Saúde Financeira - Score 0-100
 * Mostra um resumo visual da saúde financeira com breakdown de critérios
 */
export default function FinancialHealthCard({ score, breakdown }) {
  // Determinar cor e status baseado no score
  const getScoreColor = (score) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Excelente' };
    if (score >= 60) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Bom' };
    if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Regular' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Atenção' };
  };

  const scoreInfo = getScoreColor(score);
  const percentage = (score / 100) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scoreInfo.bg}`}>
              <Activity className={`w-5 h-5 ${scoreInfo.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Saúde Financeira</h3>
              <Badge variant={score >= 60 ? "success" : "warning"} className="mt-1">
                {scoreInfo.label}
              </Badge>
            </div>
          </div>
          <div className={`text-3xl font-bold ${scoreInfo.color}`}>
            {score}
            <span className="text-lg text-gray-400">/100</span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-green-500' :
                score >= 60 ? 'bg-blue-500' :
                score >= 40 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Breakdown dos critérios */}
        <div className="space-y-2">
          <BreakdownItem
            icon={breakdown?.balancePositive ? CheckCircle : AlertCircle}
            label="Saldo positivo no mês"
            status={breakdown?.balancePositive}
          />
          <BreakdownItem
            icon={breakdown?.savingsRate ? CheckCircle : AlertCircle}
            label="Taxa de poupança >10%"
            status={breakdown?.savingsRate}
          />
          <BreakdownItem
            icon={breakdown?.expenseRatio ? CheckCircle : AlertCircle}
            label="Despesas <70% da receita"
            status={breakdown?.expenseRatio}
          />
          <BreakdownItem
            icon={breakdown?.growthTrend ? CheckCircle : AlertCircle}
            label="Patrimônio >3 meses despesas"
            status={breakdown?.growthTrend}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownItem({ icon: Icon, label, status }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`w-4 h-4 ${status ? 'text-green-600' : 'text-gray-400'}`} />
      <span className={status ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
    </div>
  );
}
