import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Table from '../components/Table';
import DoughnutChart from '../components/charts/DoughnutChart';
import { fetchMock, formatCurrency, formatDate } from '../utils/mockApi';
import { Receipt, Plus, Edit, Trash2, TrendingDown, PieChart } from 'lucide-react';

/**
 * Página Despesas - Gerenciamento detalhado de despesas por categoria
 * Permite visualizar, adicionar, editar e excluir despesas
 */
export default function Despesas() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Filtrar despesas
  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === selectedCategory);

  // Calcular estatísticas
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas despesas por categoria</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
            <PieChart className="w-4 h-4 mr-2" />
            Categorias
          </Button>
          <Button onClick={handleAddExpense}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Itens</p>
              <p className="text-2xl font-bold text-blue-600">{expenses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categorias Ativas</p>
              <p className="text-2xl font-bold text-purple-600">{expensesByCategory.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de despesas por categoria */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Categoria
          </h2>
          <DoughnutChart data={expensesByCategory} />
        </Card>

        {/* Lista de categorias */}
        <Card className="p-6 lg:col-span-2">
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
        </Card>
      </div>

      {/* Filtro por categoria */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Receipt className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por categoria:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.name
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabela de despesas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'Todas as Despesas' : `Despesas - ${selectedCategory}`}
          {' '}({filteredExpenses.length})
        </h2>
        <Table
          columns={expenseColumns}
          data={filteredExpenses}
          pageSize={10}
        />
      </Card>

      {/* Modal de adicionar/editar despesa */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingExpense ? 'Salvar' : 'Adicionar Despesa'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição"
            placeholder="Ex: Conta de luz, Mercado..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            required
          />

          <Input
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Modal de categorias */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Categorias de Despesas"
        footer={
          <Button onClick={() => setCategoryModalOpen(false)}>
            Fechar
          </Button>
        }
      >
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
      </Modal>
    </div>
  );
}
