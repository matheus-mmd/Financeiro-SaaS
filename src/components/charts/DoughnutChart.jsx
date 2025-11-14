import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

/**
 * Componente DoughnutChart - Gráfico de rosca moderno para categorias
 * Componente de gráfico usando Recharts com visual aprimorado
 */
export default function DoughnutChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Cores padrão vibrantes
  const DEFAULT_COLORS = ['#0ea5a4', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

  // Calcular total para percentuais
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  // Custom tooltip melhorado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-2xl border border-gray-200/50">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].payload.color }}
            />
            <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">
            {payload[0].value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 2
            })}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: payload[0].payload.color
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Renderizar setor ativo com destaque
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Renderizar label personalizado
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Não mostrar label se menor que 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend com percentuais
  const renderLegend = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 px-2">
        {data.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div
              key={`legend-${index}`}
              className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeIndex === index
                  ? 'bg-gray-100 shadow-sm scale-105 ring-2 ring-gray-200'
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                    activeIndex === index ? 'shadow-md scale-125' : 'shadow-sm'
                  }`}
                  style={{ backgroundColor: entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                />
                <span className={`text-xs font-medium truncate transition-colors duration-200 ${
                  activeIndex === index ? 'text-gray-900 font-semibold' : 'text-gray-700'
                }`}>
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold transition-all duration-200 ${
                  activeIndex === index ? 'text-gray-900 scale-110' : 'text-gray-600'
                }`}>
                  {percentage}%
                </span>
                <span className="text-xs text-gray-500">
                  {(entry.value / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="60%" minHeight={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                strokeWidth={2}
                stroke="#fff"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 overflow-y-auto">
        {renderLegend()}
      </div>
    </div>
  );
}
