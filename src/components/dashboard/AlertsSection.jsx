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

  // Configurações baseadas na severidade - Novas cores modernas
  const config = {
    critical: {
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200',
      iconColor: 'text-danger-600',
      textColor: 'text-danger-900',
      actionColor: 'text-danger-700',
      borderRightColor: 'border-r-danger-500',
      Icon: AlertCircle,
    },
    warning: {
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      iconColor: 'text-warning-600',
      textColor: 'text-warning-900',
      actionColor: 'text-warning-700',
      borderRightColor: 'border-r-warning-500',
      Icon: AlertTriangle,
    },
    success: {
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      iconColor: 'text-success-600',
      textColor: 'text-success-900',
      actionColor: 'text-success-700',
      borderRightColor: 'border-r-success-500',
      Icon: CheckCircle,
    },
    info: {
      bgColor: 'bg-info-50',
      borderColor: 'border-info-200',
      iconColor: 'text-info-600',
      textColor: 'text-info-900',
      actionColor: 'text-info-700',
      borderRightColor: 'border-r-info-500',
      Icon: Info,
    },
  };

  const style = config[severity] || config.info;
  const IconComponent = style.Icon;

  return (
    <Card className={`${style.bgColor} border-2 ${style.borderColor} border-r-4 ${style.borderRightColor} overflow-hidden`}>
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