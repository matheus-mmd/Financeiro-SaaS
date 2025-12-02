'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

/**
 * Componente Table - Tabela otimizada com ordenação e paginação
 * Usa componentes do shadcn/ui internamente
 * @param {Array} columns - Configuração das colunas: [{ key, label, sortable, render }]
 * @param {Array} data - Dados a serem exibidos
 * @param {number} pageSize - Itens por página padrão
 * @param {Function} onRowClick - Função opcional chamada ao clicar em uma linha
 */
export default function Table({
  columns,
  data,
  pageSize = 10,
  onRowClick,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Ordenação
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleRowClick = (row, event) => {
    // Não aciona clique se clicar em botões ou elementos interativos
    if (
      event.target.closest('button') ||
      event.target.closest('a') ||
      event.target.closest('[role="button"]')
    ) {
      return;
    }

    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Função para alterar quantidade de itens por página
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Resetar para primeira página
  };

  return (
    <div className="w-full">
      {/* Tabela responsiva com overflow controlado */}
      <div className="rounded-lg border overflow-x-auto">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2 uppercase text-xs font-semibold">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ?
                        <ChevronUp className="w-4 h-4" /> :
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                onClick={(e) => handleRowClick(row, e)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        {/* Informações de resultados e seletor de itens por página */}
        <div className="flex flex-col sm:flex-row items-center gap-3 order-2 sm:order-1">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedData.length)} de {sortedData.length} resultados
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Itens por página:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controles de paginação */}
        {totalPages > 1 && (
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm flex items-center">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}