import { useMemo } from 'react';
import {
  calculateMonthData,
  calculateHealthScore,
  generateAlerts,
  calculateMonthEndProjection,
  calculateExpensesByCategory,
  calculateBudgetRule503020,
} from '../utils/dashboardAnalytics';
import { getPreviousMonth } from '../formatters';

export const useDashboardAnalytics = (transactions, expenses, assets, categories, currentMonth = '2025-11') => {
  const previousMonth = getPreviousMonth(currentMonth);

  const currentMonthExpenses = useMemo(
    () => expenses.filter(e => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const previousMonthExpenses = useMemo(
    () => expenses.filter(e => e.date.startsWith(previousMonth)),
    [expenses, previousMonth]
  );

  const currentMonthData = useMemo(
    () => calculateMonthData(transactions, currentMonthExpenses, currentMonth),
    [transactions, currentMonthExpenses, currentMonth]
  );

  const previousMonthData = useMemo(
    () => calculateMonthData(transactions, previousMonthExpenses, previousMonth),
    [transactions, previousMonthExpenses, previousMonth]
  );

  const projectionData = useMemo(
    () => calculateMonthEndProjection(transactions, expenses, currentMonth),
    [transactions, expenses, currentMonth]
  );

  const expensesByCategoryWithChange = useMemo(
    () => calculateExpensesByCategory(currentMonthExpenses, previousMonthExpenses, categories),
    [currentMonthExpenses, previousMonthExpenses, categories]
  );

  const totalAssets = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.value, 0),
    [assets]
  );

  const avgMonthlyExpenses = useMemo(() => {
    const months = [currentMonth, previousMonth, getPreviousMonth(previousMonth)];
    let totalExpenses = 0;
    let count = 0;

    months.forEach(month => {
      const monthExpenses = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);

      if (monthExpenses > 0) {
        totalExpenses += monthExpenses;
        count++;
      }
    });

    return count > 0 ? totalExpenses / count : currentMonthData.expenses;
  }, [expenses, currentMonth, previousMonth, currentMonthData.expenses]);

  const healthScore = useMemo(
    () => calculateHealthScore(currentMonthData, assets, avgMonthlyExpenses),
    [currentMonthData, assets, avgMonthlyExpenses]
  );

  const alerts = useMemo(
    () => generateAlerts(
      currentMonthData,
      previousMonthData,
      projectionData,
      expensesByCategoryWithChange,
      categories
    ),
    [currentMonthData, previousMonthData, projectionData, expensesByCategoryWithChange, categories]
  );

  const runwayData = useMemo(() => ({
    totalAssets,
    avgMonthlyExpenses,
    runwayMonths: avgMonthlyExpenses > 0 ? totalAssets / avgMonthlyExpenses : 0,
  }), [totalAssets, avgMonthlyExpenses]);

  const budgetRule503020Data = useMemo(
    () => calculateBudgetRule503020(currentMonthExpenses, currentMonthData, categories),
    [currentMonthExpenses, currentMonthData, categories]
  );

  return {
    currentMonthData,
    previousMonthData,
    projectionData,
    expensesByCategoryWithChange,
    totalAssets,
    avgMonthlyExpenses,
    healthScore,
    alerts,
    runwayData,
    budgetRule503020Data,
  };
};