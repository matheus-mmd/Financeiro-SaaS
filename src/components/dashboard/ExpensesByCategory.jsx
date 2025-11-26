import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import DoughnutChart from '../charts/DoughnutChart';
import { formatCurrency, calculatePercentage } from '../../formatters';

export default function ExpensesByCategory({ expenses, categories }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category);
      if (existing) {
        existing.value += expense.amount;
      } else {
        const category = categories.find(
          c => c.name === expense.category || c.id === expense.category.toLowerCase()
        );
        acc.push({
          name: expense.category,
          value: expense.amount,
          color: category?.color || '#64748b',
        });
      }
      return acc;
    }, []);
  }, [expenses, categories]);

  const totalExpenses = useMemo(
    () => expensesByCategory.reduce((sum, item) => sum + item.value, 0),
    [expensesByCategory]
  );

  const sortedExpenses = useMemo(
    () => [...expensesByCategory].sort((a, b) => b.value - a.value),
    [expensesByCategory]
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Despesas por Categoria
        </h2>

        <div className="h-[300px] mb-6">
          <DoughnutChart
            data={expensesByCategory}
            showLegend={false}
            externalActiveIndex={activeIndex}
            onIndexChange={setActiveIndex}
          />
        </div>

        <div className="space-y-3">
          {sortedExpenses.map((item, index) => {
            const percentage = calculatePercentage(item.value, totalExpenses).toFixed(1);
            const isActive = activeIndex === index;

            return (
              <div
                key={item.name}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gray-100 shadow-sm scale-105 ring-2 ring-gray-200'
                    : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isActive ? 'shadow-md scale-125' : 'shadow-sm'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`font-medium transition-colors duration-200 ${
                    isActive ? 'text-gray-900 font-semibold' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'text-gray-900 scale-110' : 'text-gray-500'
                  }`}>
                    {percentage}%
                  </span>
                  <span className={`font-semibold text-red-600 transition-all duration-200 ${
                    isActive ? 'scale-105' : ''
                  }`}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}