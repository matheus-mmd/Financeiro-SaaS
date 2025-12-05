'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Badge } from './ui/badge';

/**
 * FilterButton - Botão que encapsula filtros em um popover
 * Exibe a quantidade de filtros ativos como badge
 *
 * @param {React.ReactNode} children - Conteúdo dos filtros (campos de formulário)
 * @param {number} activeFiltersCount - Quantidade de filtros ativos
 * @param {Function} onClearFilters - Função para limpar todos os filtros
 * @param {string} width - Largura customizada do popover (opcional)
 */
export default function FilterButton({
  children,
  activeFiltersCount = 0,
  onClearFilters,
  width = "w-[calc(100vw-2rem)] sm:w-[36rem] lg:w-[48rem]"
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtrar
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 bg-brand-500 hover:bg-brand-600"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`${width} p-0`}
        align="start"
        sideOffset={5}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtros
              </span>
            </div>
            {activeFiltersCount > 0 && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-4 max-h-[min(calc(100vh-12rem),32rem)] overflow-y-auto overflow-x-hidden pr-1">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}