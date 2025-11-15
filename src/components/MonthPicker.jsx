'use client';

import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * MonthPicker - Seletor de intervalo de datas usando shadcn/ui Calendar
 * @param {Object} value - Range de datas { from: Date, to: Date }
 * @param {Function} onChange - Callback quando range é selecionado
 * @param {string} placeholder - Texto placeholder
 */
export default function MonthPicker({ value, onChange, placeholder = "Selecione o período" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range) => {
    onChange(range);
    // Fecha apenas se ambas as datas foram selecionadas
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!value?.from) {
      return <span>{placeholder}</span>;
    }

    if (value.from && !value.to) {
      return format(value.from, "dd 'de' MMMM", { locale: ptBR });
    }

    if (value.from && value.to) {
      // Se é o mesmo mês, mostra apenas o mês
      const sameMonth = value.from.getMonth() === value.to.getMonth() &&
                       value.from.getFullYear() === value.to.getFullYear();

      if (sameMonth) {
        return format(value.from, "MMMM 'de' yyyy", { locale: ptBR });
      }

      // Caso contrário, mostra o range completo
      return `${format(value.from, "dd/MM/yy", { locale: ptBR })} - ${format(value.to, "dd/MM/yy", { locale: ptBR })}`;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !value?.from && "text-muted-foreground"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
          defaultMonth={value?.from || new Date()}
          numberOfMonths={2}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
