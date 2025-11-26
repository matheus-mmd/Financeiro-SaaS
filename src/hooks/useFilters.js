import { useState, useEffect, useMemo } from 'react';
import { getCurrentMonthRange } from '../formatters';

export const useFilters = (data, options = {}) => {
  const {
    categoryField = 'category',
    dateField = 'date',
    defaultCategory = 'all',
    defaultDateRange = null,
  } = options;

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [dateRange, setDateRange] = useState(defaultDateRange || getCurrentMonthRange());

  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item[categoryField] === selectedCategory);
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(item => {
        const [year, month, day] = item[dateField].split('-');
        const itemDate = new Date(year, month - 1, day);
        itemDate.setHours(0, 0, 0, 0);

        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);

        return itemDate >= from && itemDate <= to;
      });
    }

    return filtered;
  }, [data, selectedCategory, dateRange, categoryField, dateField]);

  const clearFilters = () => {
    setSelectedCategory(defaultCategory);
    setDateRange(null);
  };

  const hasActiveFilters = selectedCategory !== defaultCategory || dateRange !== null;

  return {
    filteredData,
    selectedCategory,
    setSelectedCategory,
    dateRange,
    setDateRange,
    clearFilters,
    hasActiveFilters,
  };
};