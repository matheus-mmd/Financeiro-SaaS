'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../formatters';
import { Button } from '../ui/button';

/**
 * TopTransactions - Top 5 maiores transações (débitos ou créditos)
 * @param {Array} transactions - Array de transações
 * @param {Array} categories - Array de categorias
 */
export default function TopTransactions({ transactions, categories, currentMonth }) {
  const [viewType, setViewType] = useState('debits'); // 'debits' ou 'credits'

  // Processar transações por categoria
  const processedData = useMemo(() => {
    const currentMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );

    if (viewType === 'debits') {
      // Agrupar débitos por categoria
      const debitsByCategory = {};
      let totalDebits = 0;

      currentMonthTransactions.forEach((t) => {
        if (t.type === 'debit') {
          const amount = Math.abs(t.amount);
          const category = t.description || 'Outros'; // Usar descrição como categoria temporária

          if (!debitsByCategory[category]) {
            debitsByCategory[category] = 0;
          }
          debitsByCategory[category] += amount;
          totalDebits += amount;
        }
      });

      // Converter para array e ordenar
      const debitsArray = Object.keys(debitsByCategory).map((category) => ({
        name: category,
        amount: debitsByCategory[category],
        percentage: totalDebits > 0 ? (debitsByCategory[category] / totalDebits) * 100 : 0,
        color: '#ef4444', // Vermelho para débitos
      }));

      return {
        items: debitsArray.sort((a, b) => b.amount - a.amount),
        total: totalDebits,
      };
    } else {
      // Agrupar créditos por descrição/categoria
      const creditsByCategory = {};
      let totalCredits = 0;

      currentMonthTransactions.forEach((t) => {
        if (t.type === 'credit') {
          const amount = Math.abs(t.amount);
          const category = t.description || 'Outros';

          if (!creditsByCategory[category]) {
            creditsByCategory[category] = 0;
          }
          creditsByCategory[category] += amount;
          totalCredits += amount;
        }
      });

      // Converter para array e ordenar
      const creditsArray = Object.keys(creditsByCategory).map((category) => ({
        name: category,
        amount: creditsByCategory[category],
        percentage: totalCredits > 0 ? (creditsByCategory[category] / totalCredits) * 100 : 0,
        color: '#10b981', // Verde para créditos
      }));

      return {
        items: creditsArray.sort((a, b) => b.amount - a.amount),
        total: totalCredits,
      };
    }
  }, [transactions, currentMonth, viewType]);

  const isDebits = viewType === 'debits';
  const Icon = isDebits ? TrendingDown : TrendingUp;
  const iconColor = isDebits ? 'text-red-600' : 'text-green-600';
  const barColor = isDebits ? 'bg-red-500' : 'bg-green-500';
  const valueColor = isDebits ? 'text-red-600' : 'text-green-600';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h3 className="font-semibold text-gray-900">
              Top 5 Maiores {isDebits ? 'Gastos' : 'Créditos'}
            </h3>
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewType === 'debits' ? 'default' : 'ghost'}
              onClick={() => setViewType('debits')}
              className={`text-xs px-3 py-1 h-7 ${
                viewType === 'debits'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              Débitos
            </Button>
            <Button
              size="sm"
              variant={viewType === 'credits' ? 'default' : 'ghost'}
              onClick={() => setViewType('credits')}
              className={`text-xs px-3 py-1 h-7 ${
                viewType === 'credits'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              Créditos
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {processedData.items.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Ranking */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">#{index + 1}</span>
              </div>

              {/* Cor da categoria */}
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.name}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${barColor} h-1.5 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Valor */}
              <div className="text-right">
                <p className={`font-semibold ${valueColor}`}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          ))}

          {processedData.items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum {isDebits ? 'débito' : 'crédito'} encontrado neste mês</p>
            </div>
          )}
        </div>

        {/* Total */}
        {processedData.items.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Total de {processedData.items.length} {isDebits ? 'categorias' : 'fontes'}
              </span>
              <span className={`text-lg font-bold ${valueColor}`}>
                {formatCurrency(processedData.total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}