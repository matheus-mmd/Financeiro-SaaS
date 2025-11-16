'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ptBR } from 'date-fns/locale';

/**
 * DatePicker - Seletor de data com calendário e dropdowns
 * @param {Date} value - Data selecionada
 * @param {Function} onChange - Callback quando data é selecionada
 * @param {string} placeholder - Texto placeholder
 */
export default function DatePicker({ value, onChange, placeholder = "Selecione a data" }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal"
        >
          {value ? value.toLocaleDateString('pt-BR') : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          locale={ptBR}
          defaultMonth={value || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
