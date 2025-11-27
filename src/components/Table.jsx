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
import { Card, CardContent } from './ui/card';

/**
 * Componente Table - Tabela com ordenação e paginação
 * Usa componentes do shadcn/ui internamente
 * @param {Array} columns - Configuração das colunas: [{ key, label, sortable, render }]
 * @param {Array} data - Dados a serem exibidos
 * @param {number} pageSize - Itens por página
 * @param {Function} onRowClick - Função opcional chamada ao clicar em uma linha
 * @param {boolean} selectable - Habilita seleção múltipla
 * @param {Array} selectedRows - Array de IDs das linhas selecionadas
 * @param {Function} onSelectionChange - Callback quando seleção muda
 */
export default function Table({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

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
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleRowClick = (row, event) => {
    // Não aciona clique se clicar em botões, checkboxes ou elementos interativos
    if (
      event.target.closest('button') ||
      event.target.closest('a') ||
      event.target.closest('[role="button"]') ||
      event.target.closest('input[type="checkbox"]')
    ) {
      return;
    }

    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Funções de seleção
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedData.map(row => row.id);
      onSelectionChange([...new Set([...selectedRows, ...allIds])]);
    } else {
      const pageIds = paginatedData.map(row => row.id);
      onSelectionChange(selectedRows.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (rowId) => {
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row.id));
  const isSomeSelected = paginatedData.some(row => selectedRows.includes(row.id)) && !isAllSelected;

  return (
    <div className="w-full">
      {/* Table View - mantém formato de linhas em todas as telas */}
      <div className="rounded-lg border overflow-x-auto">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => el && (el.indeterminate = isSomeSelected)}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2 uppercase">
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
                key={index}
                onClick={(e) => handleRowClick(row, e)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {selectable && (
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
                )}
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
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, sortedData.length)} de {sortedData.length} resultados
          </p>
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
        </div>
      )}
    </div>
  );
}
