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
 */
export default function Table({ columns, data, pageSize = 10 }) {
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

  return (
    <div className="w-full">
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block rounded-lg border">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
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
              <TableRow key={index}>
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

      {/* Mobile Card View - Visible only on mobile */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((row, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {column.label}
                  </span>
                  <span className="text-sm text-right">
                    {column.render ? column.render(row) : row[column.key]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
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
