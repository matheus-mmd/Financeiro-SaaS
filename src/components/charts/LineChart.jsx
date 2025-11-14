import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Componente LineChart - Gráfico de área para evolução temporal
 * Componente de gráfico usando Recharts com visual moderno
 */
export default function LineChart({ data, dataKey = 'value', color = '#0ea5a4' }) {
  // Custom tooltip melhorado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const prevIndex = data.findIndex(item => item.date === label) - 1;
      const prevValue = prevIndex >= 0 ? data[prevIndex][dataKey] : value;
      const variation = value - prevValue;
      const isPositive = variation >= 0;

      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-2xl border border-gray-200/50">
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-gray-900">
              {value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2
              })}
            </p>
            {prevIndex >= 0 && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {Math.abs(variation).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f3f4f6"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          style={{ fontSize: '11px', fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: '10px', fontWeight: 500 }}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          }}
          width={45}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          fill="url(#colorValue)"
          dot={{
            fill: '#fff',
            stroke: color,
            strokeWidth: 2,
            r: 4
          }}
          activeDot={{
            r: 6,
            fill: color,
            stroke: '#fff',
            strokeWidth: 2
          }}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
