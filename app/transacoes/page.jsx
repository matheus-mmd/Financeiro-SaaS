'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../src/components/PageHeader';
import StatsCard from '../../src/components/StatsCard';
import MonthPicker from '../../src/components/MonthPicker';
import { Card, CardContent } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../src/components/ui/alert-dialog';
import Spinner from '../../src/components/Spinner';
import Table from '../../src/components/Table';
import DatePicker from '../../src/components/DatePicker';
import { fetchMock, formatCurrency, formatDate } from '../../src/utils/mockApi';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Plus, Filter, Download, Edit, Trash2 } from 'lucide-react';

/**
 * Página Transações - Gerenciamento de todas as transações financeiras
 * Permite visualizar, filtrar, adicionar e exportar transações
 */
export default function Transacoes() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, credit, debit
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Inicializa com primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'debit',
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock('/api/transactions');
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter(t => {
        // Separar a string de data para evitar problemas com timezone
        const [year, month, day] = t.date.split('-');
        const transactionDate = new Date(year, month - 1, day);
        // Remove a parte de hora para comparar apenas datas
        transactionDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return transactionDate >= from && transactionDate <= to;
      });
    }

    setFilteredTransactions(filtered);
  }, [filterType, filterMonth, transactions]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      type: 'debit',
      date: new Date(),
    });
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    // Converter string de data para Date object
    const [year, month, day] = transaction.date.split('-');
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type,
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Investimentos e débitos são negativos (saída), créditos são positivos (entrada)
    let amount = parseFloat(formData.amount);
    if (formData.type === 'debit' || formData.type === 'investment') {
      amount = -Math.abs(amount);
    } else {
      amount = Math.abs(amount);
    }

    // Converter Date object para string YYYY-MM-DD
    const dateString = formData.date.toISOString().split('T')[0];

    const transactionData = {
      id: editingTransaction?.id || Date.now(),
      description: formData.description,
      amount: amount,
      type: formData.type,
      date: dateString,
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? transactionData : t));
    } else {
      setTransactions([transactionData, ...transactions]);
    }

    setModalOpen(false);
    setFormData({ description: '', amount: '', type: 'debit', date: new Date() });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Calcular estatísticas baseadas nas transações filtradas (antes do if loading)
  const totalCredit = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalInvestment = filteredTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalCredit - totalDebit - totalInvestment;

  // Ordenar transações por data (mais recente primeiro) e depois por valor (maior primeiro)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      // Primeiro ordenar por data (descendente - mais recente primeiro)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      // Se as datas forem iguais, ordenar por valor (maior primeiro)
      return Math.abs(b.amount) - Math.abs(a.amount);
    });
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Configuração de colunas da tabela
  const transactionColumns = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: 'description',
      label: 'Descrição',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (row) => {
        if (row.type === 'credit') {
          return (
            <Badge variant="default" className="bg-green-500">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Crédito
              </span>
            </Badge>
          );
        } else if (row.type === 'investment') {
          return (
            <Badge variant="default" className="bg-blue-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Investimento
              </span>
            </Badge>
          );
        } else {
          return (
            <Badge variant="destructive">
              <span className="flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                Débito
              </span>
            </Badge>
          );
        }
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (row) => {
        let colorClass = 'text-red-600';
        if (row.type === 'credit') {
          colorClass = 'text-green-600';
        } else if (row.type === 'investment') {
          colorClass = 'text-blue-600';
        }
        return (
          <span className={`${colorClass} font-semibold`}>
            {formatCurrency(Math.abs(row.amount))}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditTransaction(row)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Editar transação"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteTransaction(row)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            aria-label="Excluir transação"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
        actions={
          <>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button onClick={handleAddTransaction}>
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={ArrowUpRight}
          label="Total de Créditos"
          value={formatCurrency(totalCredit)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={ArrowDownRight}
          label="Total de Débitos"
          value={formatCurrency(totalDebit)}
          iconColor="red"
          valueColor="text-red-600"
        />

        <StatsCard
          icon={TrendingUp}
          label="Total de Investimentos"
          value={formatCurrency(totalInvestment)}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={ArrowUpRight}
          label="Saldo"
          value={formatCurrency(balance)}
          iconColor={balance >= 0 ? 'purple' : 'yellow'}
          valueColor={balance >= 0 ? 'text-purple-600' : 'text-orange-600'}
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por tipo */}
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-sm font-medium text-gray-700">
                  Tipo de Transação
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as transações</SelectItem>
                    <SelectItem value="credit">Apenas créditos</SelectItem>
                    <SelectItem value="debit">Apenas débitos</SelectItem>
                    <SelectItem value="investment">Apenas investimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por mês/ano */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Mês e Ano
                </Label>
                <MonthPicker
                  value={filterMonth}
                  onChange={setFilterMonth}
                  placeholder="Selecione o período"
                />
              </div>
            </div>

            {/* Limpar filtros */}
            {(filterType !== 'all' || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
                    setFilterMonth(getCurrentMonthRange());
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de transações */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Todas as Transações ({filteredTransactions.length})
          </h2>
          <Table
            columns={transactionColumns}
            data={sortedTransactions}
            pageSize={10}
            onRowClick={handleEditTransaction}
          />
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar transação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Salário, Compra de mercado..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'credit')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'credit'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ArrowUpRight className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">Crédito</span>
                  <span className="block text-xs text-gray-500">Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'debit')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'debit'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ArrowDownRight className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">Débito</span>
                  <span className="block text-xs text-gray-500">Saída</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'investment')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'investment'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">Investimento</span>
                  <span className="block text-xs text-gray-500">Aplicação</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange('date', date)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              {editingTransaction ? 'Salvar' : 'Adicionar Transação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "{transactionToDelete?.description}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
