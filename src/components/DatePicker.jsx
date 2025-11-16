'use client';

import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * DatePicker - Seletor de data única usando shadcn/ui Calendar
 * @param {Date} value - Data selecionada
 * @param {Function} onChange - Callback quando data é selecionada
 * @param {string} placeholder - Texto placeholder
 */
export default function DatePicker({ value, onChange, placeholder = "Selecione a data" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const formatDate = () => {
    if (!value) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }
    return format(value, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
          defaultMonth={value || new Date()}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
