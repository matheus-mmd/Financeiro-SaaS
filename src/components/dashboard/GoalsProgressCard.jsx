import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils';
import Link from 'next/link';

/**
 * Card de Progresso de Metas
 * Mostra as metas ativas com progresso visual e estimativa de conclusão
 */
export default function GoalsProgressCard({ goals = [] }) {
  // Pegar até 3 metas em progresso
  const activeGoals = goals.filter(g => g.status === 'in_progress').slice(0, 3);

  if (activeGoals.length === 0) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-r-4 border-accent-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl shadow-sm bg-accent-50">
              <Target className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Metas Ativas</h3>
          </div>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">Você não tem metas ativas no momento</p>
            <Link
              href="/metas"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              Criar nova meta →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-r-4 border-accent-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl shadow-sm bg-accent-50">
              <Target className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Metas Ativas</h3>
          </div>
          <Link
            href="/metas"
            className="text-sm text-accent-600 hover:text-accent-700 font-medium"
          >
            Ver todas →
          </Link>
        </div>

        <div className="space-y-4">
          {activeGoals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalItem({ goal }) {
  const percentage = (goal.progress / goal.goal) * 100;
  const remaining = goal.goal - goal.progress;
  const isNearCompletion = percentage >= 80;

  // Estimar data de conclusão (simplificado - baseado em progresso linear)
  const estimateCompletion = () => {
    if (percentage >= 100) return 'Concluída!';
    if (!goal.date) return null;

    // Calcular meses restantes baseado no ritmo atual
    // Isso é simplificado - em produção você calcularia com base no histórico real
    const monthsToGo = Math.ceil(remaining / (goal.progress / 12));
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGo);

    return estimatedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const completionEstimate = estimateCompletion();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{goal.title}</h4>
        {isNearCompletion && (
          <TrendingUp className="w-4 h-4 text-success-600" />
        )}
      </div>

      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-semibold text-accent-600">
          {formatCurrency(goal.progress)}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{formatCurrency(goal.goal)}</span>
        <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isNearCompletion ? 'bg-success-500' : 'bg-accent-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Status */}
      {completionEstimate && (
        <div className="flex items-center gap-2 text-xs">
          {percentage >= 100 ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-success-600" />
              <span className="text-success-600 font-medium">Meta atingida!</span>
            </>
          ) : (
            <>
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">
                No ritmo: <span className="font-medium">{completionEstimate}</span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}