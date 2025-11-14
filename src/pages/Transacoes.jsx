import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import Select from '../components/Select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import Spinner from '../components/Spinner';
import Table from '../components/Table';
import { fetchMock, formatCurrency, formatDate } from '../utils/mockApi';
import { ArrowUpRight, ArrowDownRight, Plus, Filter, Download, Edit, Trash2 } from 'lucide-react';

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
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'debit',
    date: new Date().toISOString().split('T')[0],
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

    // Filtrar por data inicial
    if (filterDateStart) {
      filtered = filtered.filter(t => t.date >= filterDateStart);
    }

    // Filtrar por data final
    if (filterDateEnd) {
      filtered = filtered.filter(t => t.date <= filterDateEnd);
    }

    setFilteredTransactions(filtered);
  }, [filterType, filterDateStart, filterDateEnd, transactions]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      type: 'debit',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type,
      date: transaction.date,
    });
    setModalOpen(true);
  };

  const handleDeleteTransaction = (id) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const transactionData = {
      id: editingTransaction?.id || Date.now(),
      description: formData.description,
      amount: formData.type === 'debit' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      type: formData.type,
      date: formData.date,
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? transactionData : t));
    } else {
      setTransactions([transactionData, ...transactions]);
    }

    setModalOpen(false);
    setFormData({ description: '', amount: '', type: 'debit', date: new Date().toISOString().split('T')[0] });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calcular estatísticas
  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalCredit - totalDebit;

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
      render: (row) => (
        <Badge variant={row.type === 'credit' ? 'default' : 'destructive'}>
          {row.type === 'credit' ? (
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Crédito
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              Débito
            </span>
          )}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (row) => (
        <span className={row.type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {formatCurrency(Math.abs(row.amount))}
        </span>
      ),
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
            onClick={() => handleDeleteTransaction(row.id)}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          icon={ArrowUpRight}
          label="Saldo"
          value={formatCurrency(balance)}
          iconColor={balance >= 0 ? 'blue' : 'yellow'}
          valueColor={balance >= 0 ? 'text-blue-600' : 'text-orange-600'}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Filtro por tipo */}
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-sm font-medium text-gray-700">
                  Tipo de Transação
                </Label>
                <Select
                  id="filter-type"
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { value: 'all', label: 'Todas as transações' },
                    { value: 'credit', label: 'Apenas créditos' },
                    { value: 'debit', label: 'Apenas débitos' },
                  ]}
                />
              </div>

              {/* Filtro por data inicial */}
              <div className="space-y-2">
                <Label htmlFor="filter-date-start" className="text-sm font-medium text-gray-700">
                  Data Inicial
                </Label>
                <Input
                  id="filter-date-start"
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  placeholder="Selecione a data inicial"
                />
              </div>

              {/* Filtro por data final */}
              <div className="space-y-2">
                <Label htmlFor="filter-date-end" className="text-sm font-medium text-gray-700">
                  Data Final
                </Label>
                <Input
                  id="filter-date-end"
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  placeholder="Selecione a data final"
                />
              </div>
            </div>

            {/* Limpar filtros */}
            {(filterType !== 'all' || filterDateStart || filterDateEnd) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
                    setFilterDateStart('');
                    setFilterDateEnd('');
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
            data={filteredTransactions}
            pageSize={10}
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
              <div className="grid grid-cols-2 gap-3">
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
                  <span className="block text-xs text-gray-500">Entrada de dinheiro</span>
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
                  <span className="block text-xs text-gray-500">Saída de dinheiro</span>
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
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
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
    </div>
  );
}
