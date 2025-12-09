"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import DateRangePicker from "../../src/components/DateRangePicker";
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
import PageSkeleton from "../../src/components/PageSkeleton";
import Table from "../../src/components/Table";
import DatePicker from "../../src/components/DatePicker";
import FilterButton from "../../src/components/FilterButton";
import FABMenu from "../../src/components/FABMenu";
import {
  fetchData,
  formatCurrency,
  formatDate,
  createExpense,
  updateExpense,
  deleteExpense,
  getCurrentMonthRange,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import {
  TRANSACTION_TYPE_IDS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  DEFAULT_CATEGORY_COLOR,
} from "../../src/constants";
import {
  Receipt,
  Plus,
  Trash2,
  TrendingDown,
  PieChart,
  Download,
  Copy,
} from "lucide-react";

/**
 * Página Despesas - Gerenciamento detalhado de despesas por categoria
 * Permite visualizar, adicionar, editar e excluir despesas
 */
export default function Despesas() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [columnSelectorElement, setColumnSelectorElement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date(),
    paid_date: null,
    status: PAYMENT_STATUS.PENDING,
    payment_method: "",
    installments_current: "",
    installments_total: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          fetchData("/api/expenses"),
          fetchData("/api/categories"),
        ]);
        setExpenses(expensesRes.data);
        setFilteredExpenses(expensesRes.data);
        // Filtrar apenas categorias de despesa
        const expenseCategories = categoriesRes.data.filter(
          (cat) => cat.transaction_type_id === TRANSACTION_TYPE_IDS.EXPENSE
        );
        setCategories(expenseCategories);
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
      filtered = filtered.filter((e) => isDateInRange(e.date, filterMonth));
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
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      payment_method: "",
      installments_current: "",
      installments_total: "",
    });
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      date: parseDateString(expense.date) || new Date(),
      paid_date: parseDateString(expense.paid_date),
      status: expense.status || PAYMENT_STATUS.PENDING,
      payment_method: expense.payment_method || "",
      installments_current: expense.installments?.current?.toString() || "",
      installments_total: expense.installments?.total?.toString() || "",
    });
    setModalOpen(true);
  };

  // Duplicar despesa
  const handleDuplicateExpense = (expense) => {
    setEditingExpense(null);
    setFormData({
      title: expense.title + " (Cópia)",
      category: expense.category,
      amount: expense.amount.toString(),
      date: new Date(),
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      payment_method: expense.payment_method || "",
      installments_current: "",
      installments_total: "",
    });
    setModalOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      try {
        // Deletar usando mock API
        await deleteExpense(expenseToDelete.id);

        // Recarregar dados da mock API
        const response = await fetchData("/api/expenses");
        setExpenses(response.data);
        setFilteredExpenses(response.data);

        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar despesa:", error);
        alert(
          "Erro ao deletar despesa. Verifique o console para mais detalhes."
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Converter Date object para string YYYY-MM-DD
      const dateString = formData.date.toISOString().split("T")[0];
      const paidDateString = formData.paid_date
        ? formData.paid_date.toISOString().split("T")[0]
        : null;

      // Buscar o ID da categoria pelo nome
      const category = categories.find((c) => c.name === formData.category);

      // Processar parcelamento
      let installments = null;
      if (formData.installments_current && formData.installments_total) {
        installments = {
          current: parseInt(formData.installments_current),
          total: parseInt(formData.installments_total),
        };
      }

      const expenseData = {
        categoriesId: category?.id,
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: dateString,
        paid_date: paidDateString,
        status: formData.status,
        payment_method: formData.payment_method || null,
        installments: installments,
      };

      if (editingExpense) {
        // Atualizar despesa existente
        await updateExpense(editingExpense.id, expenseData);
      } else {
        // Criar nova despesa
        await createExpense(expenseData, user.id);
      }

      // Recarregar dados da mock API
      const response = await fetchData("/api/expenses");
      setExpenses(response.data);
      setFilteredExpenses(response.data);

      setModalOpen(false);
      setFormData({
        title: "",
        category: "",
        amount: "",
        date: new Date(),
        paid_date: null,
        status: PAYMENT_STATUS.PENDING,
        payment_method: "",
        installments_current: "",
        installments_total: "",
      });
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Erro ao salvar despesa. Verifique o console para mais detalhes.");
    }
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
    return <PageSkeleton />;
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
        const IconComponent = getIconComponent(
          category?.icon || row.category_icon || "Tag"
        );
        return (
          <div className="flex items-center gap-2">
            <div
              className="p-1 rounded flex-shrink-0"
              style={{ backgroundColor: (category?.color || "#64748b") + "20" }}
            >
              <IconComponent
                className="w-4 h-4"
                style={{ color: category?.color || "#64748b" }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {row.category}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => <span>{formatCurrency(row.amount)}</span>,
    },
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "paid_date",
      label: "Data Pago",
      sortable: true,
      render: (row) =>
        row.paid_date ? (
          formatDate(row.paid_date)
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge
          variant={row.status === PAYMENT_STATUS.PAID ? "success" : "warning"}
        >
          {row.status === PAYMENT_STATUS.PAID ? "Pago" : "Pendente"}
        </Badge>
      ),
    },
    {
      key: "payment_info",
      label: "Pagamento",
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {row.payment_method || "-"}
          </div>
          {row.installments && (
            <div className="text-gray-500 text-xs">
              {row.installments.current}/{row.installments.total}x
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateExpense(row);
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar despesa"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteExpense(row);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Excluir despesa"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Despesas"
        description="Gerencie suas despesas por categoria"
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <FilterButton
          activeFiltersCount={
            (selectedCategory !== "all" ? 1 : 0) + (filterMonth ? 1 : 0)
          }
          onClearFilters={() => {
            setSelectedCategory("all");
            setFilterMonth(null);
          }}
        >
          <div className="grid grid-cols-1 gap-4">
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
                  {categories.map((cat) => {
                    const IconComponent = getIconComponent(cat.icon || "Tag");
                    return (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: cat.color + "20" }}
                          >
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: cat.color }}
                            />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por período */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Período
              </Label>
              <DateRangePicker
                value={filterMonth}
                onChange={setFilterMonth}
                placeholder="Selecione o período"
              />
            </div>
          </div>
        </FilterButton>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <StatsCard
          icon={TrendingDown}
          label="Total de Despesas"
          value={formatCurrency(totalExpenses)}
          iconColor="red"
          valueColor="text-red-600"
        />

        <StatsCard
          icon={PieChart}
          label="Categorias Ativas"
          value={expensesByCategory.length}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* Tabela de despesas */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory === "all"
                ? "Todas as Despesas"
                : `Despesas - ${selectedCategory}`}{" "}
              ({filteredExpenses.length})
            </h2>
            {columnSelectorElement}
          </div>

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
              tableId="expenses-table"
              renderColumnSelector={setColumnSelectorElement}
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
                  {categories.map((cat) => {
                    const IconComponent = getIconComponent(cat.icon || "Tag");
                    return (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: cat.color + "20" }}
                          >
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: cat.color }}
                            />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
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
              <Label htmlFor="date">Data da Despesa</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === PAYMENT_STATUS.PAID && (
              <div className="space-y-2">
                <Label htmlFor="paid_date">Data do Pagamento</Label>
                <DatePicker
                  value={formData.paid_date || new Date()}
                  onChange={(date) => handleInputChange("paid_date", date)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  handleInputChange("payment_method", value)
                }
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Débito Automático">
                    Débito Automático
                  </SelectItem>
                  <SelectItem value="Cartão de Crédito">
                    Cartão de Crédito
                  </SelectItem>
                  <SelectItem value="Cartão de Débito">
                    Cartão de Débito
                  </SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="installments_current">Parcela Atual</Label>
                <Input
                  id="installments_current"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.installments_current}
                  onChange={(e) =>
                    handleInputChange("installments_current", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="installments_total">Total de Parcelas</Label>
                <Input
                  id="installments_total"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.installments_total}
                  onChange={(e) =>
                    handleInputChange("installments_total", e.target.value)
                  }
                />
              </div>
            </div>
            {formData.installments_current && formData.installments_total && (
              <p className="text-xs text-gray-500">
                Parcela {formData.installments_current} de{" "}
                {formData.installments_total}
              </p>
            )}
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

      {/* Floating Action Menu */}
      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Despesas"
        actions={[
          {
            icon: <Download className="w-5 h-5" />,
            label: "Exportar",
            onClick: handleExport,
          },
          {
            icon: <Plus className="w-5 h-5" />,
            label: "Nova Despesa",
            onClick: handleAddExpense,
          },
        ]}
      />
    </div>
  );
}
