import React from 'react';
import { Card, CardContent } from '../ui/card';
import {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

/**
 * Seção de Alertas Inteligentes
 * Mostra alertas críticos e avisos importantes no topo do dashboard
 */
export default function AlertsSection({ alerts = [], onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {alerts.map((alert, index) => (
        <AlertCard
          key={index}
          alert={alert}
          onDismiss={onDismiss ? () => onDismiss(index) : null}
        />
      ))}
    </div>
  );
}

function AlertCard({ alert, onDismiss }) {
  const { severity, message, action, icon } = alert;

  // Configurações baseadas na severidade
  const config = {
    critical: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      actionColor: 'text-red-700',
      Icon: AlertCircle,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      actionColor: 'text-yellow-700',
      Icon: AlertTriangle,
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      actionColor: 'text-green-700',
      Icon: CheckCircle,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      actionColor: 'text-blue-700',
      Icon: Info,
    },
  };

  const style = config[severity] || config.info;
  const IconComponent = style.Icon;

  return (
    <Card className={`${style.bgColor} border-2 ${style.borderColor} overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${style.textColor} mb-1`}>
              {message}
            </p>
            {action && (
              <p className={`text-xs ${style.actionColor}`}>
                💡 {action}
              </p>
            )}
          </div>

          {/* Botão de fechar (se permitido) */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`flex-shrink-0 ${style.iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Dispensar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
