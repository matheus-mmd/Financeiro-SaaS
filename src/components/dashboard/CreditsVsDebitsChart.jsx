import React from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../formatters';

/**
 * CreditsVsDebitsChart - Gráfico comparativo de Créditos vs Débitos
 * Mostra a comparação mensal entre entradas e saídas
 */
export default function CreditsVsDebitsChart({ transactions }) {
  // Processar transações por mês
  const processData = () => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dataByMonth = {};

    transactions.forEach((t) => {
      const yearMonth = t.date.substring(0, 7);
      if (!dataByMonth[yearMonth]) {
        dataByMonth[yearMonth] = { credits: 0, debits: 0 };
      }

      if (t.type === "credit") {
        dataByMonth[yearMonth].credits += Math.abs(t.amount);
      } else if (t.type === "debit") {
        dataByMonth[yearMonth].debits += Math.abs(t.amount);
      }
    });

    // Ordenar meses e converter para array
    const sortedMonths = Object.keys(dataByMonth).sort();

    return sortedMonths.map((yearMonth) => {
      const [year, month] = yearMonth.split("-");
      const monthIndex = parseInt(month) - 1;
      const data = dataByMonth[yearMonth];

      return {
        month: monthNames[monthIndex],
        créditos: Math.round(data.credits),
        débitos: Math.round(data.debits),
        saldo: Math.round(data.credits - data.debits),
      };
    });
  };

  const chartData = processData();

  // Calcular totais
  const totalCredits = chartData.reduce((sum, item) => sum + item.créditos, 0);
  const totalDebits = chartData.reduce((sum, item) => sum + item.débitos, 0);
  const balance = totalCredits - totalDebits;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-green-600">
            Créditos: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-red-600">
            Débitos: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1 pt-1 border-t">
            Saldo: {formatCurrency(payload[0].payload.saldo)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Créditos vs Débitos
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Créditos: {formatCurrency(totalCredits)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Débitos: {formatCurrency(totalDebits)}</span>
            </div>
            <div className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Saldo: {formatCurrency(balance)}
            </div>
          </div>
        </div>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="square"
              />
              <Bar
                dataKey="créditos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Créditos"
              />
              <Bar
                dataKey="débitos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Débitos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}