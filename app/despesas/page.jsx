'use client';

import React, { useState, useEffect } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import Spinner from '../../src/components/Spinner';
import Table from '../../src/components/Table';
import DoughnutChart from '../../src/components/charts/DoughnutChart';
import { fetchMock, formatCurrency, formatDate } from '../../src/utils/mockApi';
import { Receipt, Plus, Edit, Trash2, TrendingDown, PieChart, Filter } from 'lucide-react';

/**
 * Página Despesas - Gerenciamento detalhado de despesas por categoria
 * Permite visualizar, adicionar, editar e excluir despesas
 */
export default function Despesas() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Função para obter intervalo do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          fetchMock('/api/expenses'),
          fetchMock('/api/categories'),
        ]);
        setExpenses(expensesRes.data);
        setFilteredExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = expenses;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter(e => {
        // Separar a string de data para evitar problemas com timezone
        const [year, month, day] = e.date.split('-');
        const expenseDate = new Date(year, month - 1, day);
        expenseDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return expenseDate >= from && expenseDate <= to;
      });
    }

    setFilteredExpenses(filtered);
  }, [selectedCategory, filterMonth, expenses]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setModalOpen(true);
  };

  const handleDeleteExpense = (id) => {
    if (confirm('Deseja realmente excluir esta despesa?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExpense = {
      id: editingExpense?.id || Date.now(),
      title: formData.title,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
    };

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? newExpense : e));
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setModalOpen(false);
    setFormData({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
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

  // Calcular estatísticas baseadas nas despesas filtradas
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      // Buscar cor da categoria
      const category = categories.find(c => c.name === expense.category || c.id === expense.category.toLowerCase());
      acc.push({
        name: expense.category,
        value: expense.amount,
        color: category?.color || '#64748b'
      });
    }
    return acc;
  }, []);

  // Configuração de colunas da tabela
  const expenseColumns = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: 'title',
      label: 'Descrição',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (row) => {
        const category = categories.find(c => c.name === row.category || c.id === row.category.toLowerCase());
        return (
          <Badge variant="default" style={{ backgroundColor: category?.color || '#64748b', color: 'white' }}>
            {row.category}
          </Badge>
        );
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (row) => (
        <span className="text-red-600 font-semibold">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditExpense(row)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Editar despesa"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteExpense(row.id)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            aria-label="Excluir despesa"
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
        title="Despesas"
        description="Gerencie suas despesas por categoria"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
              <PieChart className="w-4 h-4" />
              Categorias
            </Button>
            <Button onClick={handleAddExpense}>
              <Plus className="w-4 h-4" />
              Nova Despesa
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={TrendingDown}
          label="Total de Despesas"
          value={formatCurrency(totalExpenses)}
          iconColor="red"
          valueColor="text-red-600"
        />

        <StatsCard
          icon={Receipt}
          label="Total de Itens"
          value={expenses.length}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={PieChart}
          label="Categorias Ativas"
          value={expensesByCategory.length}
          iconColor="purple"
          valueColor="text-purple-600"
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
              {/* Filtro por categoria */}
              <div className="space-y-2">
                <Label htmlFor="filter-category" className="text-sm font-medium text-gray-700">
                  Categoria
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="filter-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
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
            {(selectedCategory !== 'all' || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de despesas por categoria */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Categoria
            </h2>
            <div className="h-[300px] sm:h-[350px]">
              <DoughnutChart data={expensesByCategory} />
            </div>
          </CardContent>
        </Card>

        {/* Lista de categorias */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria
          </h2>
          <div className="space-y-3">
            {expensesByCategory
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const category = categories.find(c => c.name === item.name || c.id === item.name.toLowerCase());
                const percentage = ((item.value / totalExpenses) * 100).toFixed(1);

                return (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category?.color || '#64748b' }}
                      />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{percentage}%</span>
                      <span className="font-semibold text-red-600">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de despesas */}
      <Card>
        <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'Todas as Despesas' : `Despesas - ${selectedCategory}`}
          {' '}({filteredExpenses.length})
        </h2>
        <Table
          columns={expenseColumns}
          data={filteredExpenses}
          pageSize={10}
          onRowClick={handleEditExpense}
        />
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar despesa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Descrição</Label>
              <Input
                id="title"
                placeholder="Ex: Conta de luz, Mercado..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {editingExpense ? 'Salvar' : 'Adicionar Despesa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de categorias */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias de Despesas</DialogTitle>
          </DialogHeader>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-gray-900">{cat.name}</span>
            </div>
          ))}
        </div>
          <DialogFooter>
            <Button onClick={() => setCategoryModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
