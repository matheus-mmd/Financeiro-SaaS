'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

/**
 * DateRangePicker - Seletor de período com data inicial e final
 * @param {Object} value - Range de datas { from: Date, to: Date }
 * @param {Function} onChange - Callback quando range é selecionado
 * @param {string} placeholder - Texto placeholder
 */
export default function DateRangePicker({ value, onChange, placeholder = "Selecione o período" }) {
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleFromDateChange = (date) => {
    if (date) {
      onChange({
        from: date,
        to: value?.to || date
      });
      setOpenFrom(false);
    }
  };

  const handleToDateChange = (date) => {
    if (date) {
      onChange({
        from: value?.from || date,
        to: date
      });
      setOpenTo(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      {/* Data Inicial */}
      <div className="flex-1">
        <Popover open={openFrom} onOpenChange={setOpenFrom}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {value?.from ? formatDate(value.from) : "Data inicial"}
              </span>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value?.from}
              onSelect={handleFromDateChange}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              defaultMonth={value?.from}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Final */}
      <div className="flex-1">
        <Popover open={openTo} onOpenChange={setOpenTo}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {value?.to ? formatDate(value.to) : "Data final"}
              </span>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value?.to}
              onSelect={handleToDateChange}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              defaultMonth={value?.to}
              disabled={(date) => value?.from && date < value.from}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}