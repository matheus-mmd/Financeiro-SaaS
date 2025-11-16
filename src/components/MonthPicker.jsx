'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

/**
 * MonthPicker - Seletor de mês e ano com dropdowns
 * @param {Object} value - Range de datas { from: Date, to: Date }
 * @param {Function} onChange - Callback quando range é selecionado
 * @param {string} placeholder - Texto placeholder (não usado, mantido para compatibilidade)
 */
export default function MonthPicker({ value, onChange, placeholder = "Selecione o período" }) {
  const currentDate = value?.from || new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Gerar lista de anos (5 anos atrás até 2 anos à frente)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  // Atualizar quando o valor externo mudar
  useEffect(() => {
    if (value?.from) {
      setSelectedMonth(value.from.getMonth());
      setSelectedYear(value.from.getFullYear());
    }
  }, [value]);

  const handleMonthChange = (month) => {
    const monthIndex = parseInt(month);
    setSelectedMonth(monthIndex);
    updateDateRange(monthIndex, selectedYear);
  };

  const handleYearChange = (year) => {
    const yearValue = parseInt(year);
    setSelectedYear(yearValue);
    updateDateRange(selectedMonth, yearValue);
  };

  const updateDateRange = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    onChange({ from: firstDay, to: lastDay });
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {months[selectedMonth]}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[120px]">
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue>{selectedYear}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
