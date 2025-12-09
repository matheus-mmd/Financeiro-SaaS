'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Settings, GripVertical, RotateCcw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/**
 * Componente Table - Tabela otimizada com ordenação, paginação e seleção de colunas
 * Usa componentes do shadcn/ui internamente
 * @param {Array} columns - Configuração das colunas: [{ key, label, sortable, render }]
 * @param {Array} data - Dados a serem exibidos
 * @param {number} pageSize - Itens por página padrão
 * @param {Function} onRowClick - Função opcional chamada ao clicar em uma linha
 * @param {string} tableId - ID único para salvar preferências de colunas no localStorage
 * @param {React.ReactNode} renderColumnSelector - Função para renderizar o seletor de colunas externamente
 */
export default function Table({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  tableId,
  renderColumnSelector,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // State para ordem e visibilidade das colunas (com persistência no localStorage)
  const [columnOrder, setColumnOrder] = useState(() => {
    if (tableId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`table-columns-${tableId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          // Verificar se é o novo formato (objeto com order e visible)
          if (data && typeof data === 'object' && data.order && data.visible) {
            return data;
          }
          // Compatibilidade com formato antigo (array de strings)
          if (Array.isArray(data)) {
            return {
              order: columns.map(col => col.key),
              visible: data
            };
          }
        } catch (e) {
          console.error('Erro ao carregar preferências de colunas:', e);
        }
      }
    }
    // Padrão: todas as colunas visíveis na ordem original
    return {
      order: columns.map(col => col.key),
      visible: columns.map(col => col.key)
    };
  });

  // Salvar preferências no localStorage sempre que mudar
  useEffect(() => {
    if (tableId && typeof window !== 'undefined') {
      localStorage.setItem(
        `table-columns-${tableId}`,
        JSON.stringify(columnOrder)
      );
    }
  }, [columnOrder, tableId]);

  // Aplicar ordem personalizada e filtrar apenas colunas visíveis
  const displayColumns = useMemo(() => {
    // Ordenar colunas baseado em columnOrder.order
    const orderedColumns = columnOrder.order
      .map(key => columns.find(col => col.key === key))
      .filter(Boolean); // Remover undefined (colunas que não existem mais)

    // Filtrar apenas visíveis
    return orderedColumns.filter(col => columnOrder.visible.includes(col.key));
  }, [columns, columnOrder]);

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

  // Função para alternar visibilidade de uma coluna
  const toggleColumn = (columnKey) => {
    setColumnOrder(prev => ({
      ...prev,
      visible: prev.visible.includes(columnKey)
        ? prev.visible.filter(k => k !== columnKey)
        : [...prev.visible, columnKey]
    }));
  };

  // Verificar se uma coluna é obrigatória (apenas coluna 'actions')
  const isColumnRequired = (col) => {
    return col.key === 'actions';
  };

  // Componente para item arrastável do dropdown
  const SortableColumnItem = ({ col, required, visible, onToggle }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: col.key });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-1 rounded-md ${isDragging ? 'bg-accent/50 shadow-lg' : ''}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent/50 rounded transition-colors"
          title="Arraste para reordenar"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <DropdownMenuCheckboxItem
          checked={visible}
          onCheckedChange={() => !required && onToggle(col.key)}
          disabled={required}
          className="flex-1"
        >
          <span className={visible ? 'font-medium' : 'text-muted-foreground'}>
            {col.label}
          </span>
          {required && (
            <span className="ml-2 text-xs text-muted-foreground italic">
              (obrigatório)
            </span>
          )}
        </DropdownMenuCheckboxItem>
      </div>
    );
  };

  // Componente ColumnSelector (Dropdown de seleção de colunas com drag and drop)
  const ColumnSelector = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Configurar sensores para drag and drop
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // Handler para quando o drag termina
    const handleDragEnd = (event) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        setColumnOrder(prev => {
          const oldIndex = prev.order.indexOf(active.id);
          const newIndex = prev.order.indexOf(over.id);

          return {
            ...prev,
            order: arrayMove(prev.order, oldIndex, newIndex)
          };
        });
      }
    };

    // Ordenar colunas para exibição no dropdown
    const orderedColumnsForDisplay = columnOrder.order
      .map(key => columns.find(col => col.key === key))
      .filter(Boolean);

    const visibleCount = columnOrder.visible.length;
    const totalCount = columns.length;

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Colunas</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {visibleCount}/{totalCount}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>Colunas Visíveis</span>
              <span className="text-xs font-normal text-muted-foreground">
                {visibleCount} de {totalCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-normal mt-1">
              Arraste para reordenar
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnOrder.order}
              strategy={verticalListSortingStrategy}
            >
              {orderedColumnsForDisplay.map((col) => (
                <SortableColumnItem
                  key={col.key}
                  col={col}
                  required={isColumnRequired(col)}
                  visible={columnOrder.visible.includes(col.key)}
                  onToggle={toggleColumn}
                />
              ))}
            </SortableContext>
          </DndContext>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setColumnOrder({
              order: columns.map(c => c.key),
              visible: columns.map(c => c.key)
            })}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Padrão</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Expor o ColumnSelector para uso externo via renderColumnSelector
  useEffect(() => {
    if (renderColumnSelector && tableId) {
      renderColumnSelector(<ColumnSelector />);
    }
  }, [columnOrder, renderColumnSelector, tableId]);

  return (
    <div className="w-full">
      {/* Tabela responsiva com overflow controlado */}
      <div className="rounded-lg border overflow-x-auto">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              {displayColumns.map((column) => (
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
                {displayColumns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>

      {/* Paginação e Controles */}
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