'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Bell } from 'lucide-react';

/**
 * FinancialAlerts - Alertas inteligentes baseados em análise financeira
 * @param {Object} alerts - Array de alertas { type, message, severity, icon }
 */
export default function FinancialAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Tudo sob controle!</h3>
              <p className="text-sm text-gray-500">Nenhum alerta no momento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Alertas e Insights</h3>
          <Badge variant="outline" className="ml-auto">
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
          </Badge>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const IconComponent = alert.icon || AlertCircle;

            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border}`}
              >
                <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.icon}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  {alert.action && (
                    <p className="text-xs text-gray-600 mt-1">💡 {alert.action}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}