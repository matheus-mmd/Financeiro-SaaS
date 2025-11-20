"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import MonthPicker from "../../src/components/MonthPicker";
import { Card, CardContent } from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../src/components/ui/alert-dialog";
import Spinner from "../../src/components/Spinner";
import Table from "../../src/components/Table";
import TableActions from "../../src/components/TableActions";
import DatePicker from "../../src/components/DatePicker";
import { fetchMock, formatCurrency, formatDate } from "../../src/utils/mockApi";
import { exportToCSV } from "../../src/utils/exportData";
import {
  Receipt,
  Plus,
  Trash2,
  TrendingDown,
  PieChart,
  Filter,
  Download,
} from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Função para obter intervalo do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          fetchMock("/api/expenses"),
          fetchMock("/api/categories"),
        ]);
        setExpenses(expensesRes.data);
        setFilteredExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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
    if (selectedCategory !== "all") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((e) => {
        // Separar a string de data para evitar problemas com timezone
        const [year, month, day] = e.date.split("-");
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
      title: "",
      category: "",
      amount: "",
      date: new Date(),
    });
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    // Converter string de data para Date object
    const [year, month, day] = expense.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      setExpenses(expenses.filter((e) => e.id !== expenseToDelete.id));
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setExpenses(expenses.filter((e) => !selectedExpenses.includes(e.id)));
    setSelectedExpenses([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converter Date object para string YYYY-MM-DD
    const dateString = formData.date.toISOString().split("T")[0];

    const newExpense = {
      id: editingExpense?.id || Date.now(),
      title: formData.title,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: dateString,
    };

    if (editingExpense) {
      setExpenses(
        expenses.map((e) => (e.id === editingExpense.id ? newExpense : e))
      );
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setModalOpen(false);
    setFormData({ title: "", category: "", amount: "", date: new Date() });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExport = () => {
    const columns = [
      { key: "date", label: "Data", format: (row) => formatDate(row.date) },
      { key: "title", label: "Descrição" },
      { key: "category", label: "Categoria" },
      {
        key: "amount",
        label: "Valor",
        format: (row) => formatCurrency(row.amount),
      },
    ];

    exportToCSV(filteredExpenses, columns, "despesas");
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
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      // Buscar cor da categoria
      const category = categories.find(
        (c) =>
          c.name === expense.category || c.id === expense.category.toLowerCase()
      );
      acc.push({
        name: expense.category,
        value: expense.amount,
        color: category?.color || "#64748b",
      });
    }
    return acc;
  }, []);

  // Configuração de colunas da tabela
  const expenseColumns = [
    {
      key: "title",
      label: "Descrição",
      sortable: true,
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      render: (row) => {
        const category = categories.find(
          (c) => c.name === row.category || c.id === row.category.toLowerCase()
        );
        return (
          <Badge
            variant="default"
            style={{
              backgroundColor: category?.color || "#64748b",
              color: "white",
            }}
          >
            {row.category}
          </Badge>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <button
          onClick={() => handleDeleteExpense(row)}
          className="p-1 hover:bg-red-50 rounded transition-colors"
          aria-label="Excluir despesa"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
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
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCategoryModalOpen(true)}
            >
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
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
              <span className="text-sm font-medium text-gray-700">
                Filtrar por:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por categoria */}
              <div className="space-y-2">
                <Label
                  htmlFor="filter-category"
                  className="text-sm font-medium text-gray-700"
                >
                  Categoria
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
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
            {(selectedCategory !== "all" || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setFilterMonth(null);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de despesas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory === "all"
                ? "Todas as Despesas"
                : `Despesas - ${selectedCategory}`}{" "}
              ({filteredExpenses.length})
            </h2>
          </div>

          {/* Barra de ações da tabela */}
          <TableActions
            onAdd={handleAddExpense}
            onExport={handleExport}
            onDelete={handleBulkDelete}
            selectedCount={selectedExpenses.length}
            addLabel="Nova despesa"
            exportLabel="Exportar despesas"
            deleteLabel="Excluir despesas selecionadas"
          />

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhuma despesa encontrada.{" "}
                <button
                  onClick={handleAddExpense}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Adicionar nova despesa
                </button>
              </p>
            </div>
          ) : (
            <Table
              columns={expenseColumns}
              data={filteredExpenses}
              pageSize={10}
              onRowClick={handleEditExpense}
              selectable={true}
              selectedRows={selectedExpenses}
              onSelectionChange={setSelectedExpenses}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar despesa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Despesa" : "Nova Despesa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Descrição</Label>
              <Input
                id="title"
                placeholder="Ex: Conta de luz, Mercado..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
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
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              {editingExpense ? "Salvar" : "Adicionar Despesa"}
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
            <Button onClick={() => setCategoryModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a despesa "{expenseToDelete?.title}
              "? Esta ação não pode ser desfeita.
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

      {/* AlertDialog de confirmação de exclusão em lote */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedExpenses.length}{" "}
              despesa(s) selecionada(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}