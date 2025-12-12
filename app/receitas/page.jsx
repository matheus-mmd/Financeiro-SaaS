"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import DateRangePicker from "../../src/components/DateRangePicker";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { Textarea } from "../../src/components/ui/textarea";
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
import {
  formatCurrency,
  formatDate,
  getCurrentMonthRange,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../src/lib/supabase/api/transactions";
import { getCategories } from "../../src/lib/supabase/api/categories";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import FABMenu from "../../src/components/FABMenu";
import { TRANSACTION_TYPE_IDS, DEFAULT_CATEGORY_COLOR } from "../../src/constants";
import { Receipt, Plus, Trash2, TrendingUp, PieChart, Download, Copy } from "lucide-react";

/**
 * Página Receitas - Gerenciamento detalhado de receitas por categoria
 * Permite visualizar, adicionar, editar e excluir receitas
 */
export default function Receitas() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [columnSelectorElement, setColumnSelectorElement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date(),
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [incomesRes, categoriesRes] = await Promise.all([
          getTransactions({ transaction_type_id: TRANSACTION_TYPE_IDS.INCOME }),
          getCategories({ transaction_type_id: TRANSACTION_TYPE_IDS.INCOME }),
        ]);

        if (incomesRes.error) throw incomesRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        // Map Supabase fields to component fields
        const mappedIncomes = (incomesRes.data || []).map((i) => ({
          ...i,
          date: i.transaction_date,
          title: i.description,
          category: i.category_name,
        }));

        setIncomes(mappedIncomes);
        setFilteredIncomes(mappedIncomes);
        setCategories(categoriesRes.data || []);
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
    let filtered = incomes;

    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter((i) => i.category === selectedCategory);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((i) => isDateInRange(i.date, filterMonth));
    }

    setFilteredIncomes(filtered);
  }, [selectedCategory, filterMonth, incomes]);

  const handleAddIncome = () => {
    setEditingIncome(null);
    setFormData({
      title: "",
      category: "",
      amount: "",
      date: new Date(),
      notes: "",
    });
    setModalOpen(true);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      category: income.category,
      amount: income.amount.toString(),
      date: parseDateString(income.date) || new Date(),
      notes: income.notes || "",
    });
    setModalOpen(true);
  };

  // Duplicar receita
  const handleDuplicateIncome = (income) => {
    setEditingIncome(null);
    setFormData({
      title: income.title + " (Cópia)",
      category: income.category,
      amount: income.amount.toString(),
      date: new Date(),
      notes: income.notes || "",
    });
    setModalOpen(true);
  };

  const handleDeleteIncome = (income) => {
    setIncomeToDelete(income);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (incomeToDelete) {
      try {
        const result = await deleteTransaction(incomeToDelete.id);
        if (result.error) throw result.error;

        // Reload data
        const response = await getTransactions({ transaction_type_id: TRANSACTION_TYPE_IDS.INCOME });
        if (response.error) throw response.error;

        const mappedIncomes = (response.data || []).map((i) => ({
          ...i,
          date: i.transaction_date,
          title: i.description,
          category: i.category_name,
        }));

        setIncomes(mappedIncomes);
        setFilteredIncomes(mappedIncomes);

        setDeleteDialogOpen(false);
        setIncomeToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar receita:", error);
        alert(
          "Erro ao deletar receita. Verifique o console para mais detalhes."
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Converter Date object para string YYYY-MM-DD
      const dateString = formData.date.toISOString().split("T")[0];

      // Buscar o ID da categoria pelo nome
      const category = categories.find((c) => c.name === formData.category);

      const transactionData = {
        categoryId: category?.id,
        transactionTypeId: TRANSACTION_TYPE_IDS.INCOME,
        description: formData.title,
        amount: Math.abs(parseFloat(formData.amount)), // Positive for income
        transactionDate: dateString,
        notes: formData.notes || null,
      };

      let result;
      if (editingIncome) {
        result = await updateTransaction(editingIncome.id, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      if (result.error) throw result.error;

      // Reload data
      const response = await getTransactions({ transaction_type_id: TRANSACTION_TYPE_IDS.INCOME });
      if (response.error) throw response.error;

      const mappedIncomes = (response.data || []).map((i) => ({
        ...i,
        date: i.transaction_date,
        title: i.description,
        category: i.category_name,
      }));

      setIncomes(mappedIncomes);
      setFilteredIncomes(mappedIncomes);

      setModalOpen(false);
      setFormData({ title: "", category: "", amount: "", date: new Date(), notes: "" });
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      alert("Erro ao salvar receita. Verifique o console para mais detalhes.");
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

    exportToCSV(filteredIncomes, columns, "receitas");
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // Calcular estatísticas baseadas nas receitas filtradas
  const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const incomesByCategory = filteredIncomes.reduce((acc, income) => {
    const existing = acc.find((item) => item.name === income.category);
    if (existing) {
      existing.value += income.amount;
    } else {
      // Buscar cor da categoria
      const category = categories.find(
        (c) =>
          c.name === income.category || c.id === income.category.toLowerCase()
      );
      acc.push({
        name: income.category,
        value: income.amount,
        color: category?.color || "#64748b",
      });
    }
    return acc;
  }, []);

  // Configuração de colunas da tabela
  const incomeColumns = [
    {
      key: "title",
      label: "Descrição",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900">{row.title}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      render: (row) => {
        const IconComponent = getIconComponent(row.category_icon || "Tag");
        return (
          <div className="flex items-center gap-2">
            <div
              className="p-1 rounded flex-shrink-0"
              style={{ backgroundColor: row.category_color + '20' }}
            >
              <IconComponent
                className="w-4 h-4"
                style={{ color: row.category_color }}
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
      render: (row) => (
        <span className="font-semibold text-green-600">
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
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateIncome(row);
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar receita"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteIncome(row);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Excluir receita"
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
        title="Receitas"
        description="Gerencie suas receitas por categoria"
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
                            style={{ backgroundColor: cat.color + '20' }}
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
          icon={TrendingUp}
          label="Total de Receitas"
          value={formatCurrency(totalIncomes)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={PieChart}
          label="Categorias Ativas"
          value={incomesByCategory.length}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* Tabela de receitas */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Receitas ({filteredIncomes.length})
            </h2>
            {columnSelectorElement}
          </div>

          {filteredIncomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhuma receita encontrada.{" "}
                <button
                  onClick={handleAddIncome}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Adicionar nova receita
                </button>
              </p>
            </div>
          ) : (
            <Table
              columns={incomeColumns}
              data={filteredIncomes}
              pageSize={10}
              onRowClick={handleEditIncome}
              tableId="incomes-table"
              renderColumnSelector={setColumnSelectorElement}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar receita */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? "Editar Receita" : "Nova Receita"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Descrição</Label>
              <Input
                id="title"
                placeholder="Ex: Salário, Freelance..."
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
                            style={{ backgroundColor: cat.color + '20' }}
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
              <Label htmlFor="date">Data</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre esta receita..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
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
              {editingIncome ? "Salvar" : "Adicionar Receita"}
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
              Tem certeza que deseja excluir a receita "{incomeToDelete?.title}
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

      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Receitas"
        actions={[
          {
            icon: <Download className="w-5 h-5" />,
            label: "Exportar",
            onClick: handleExport,
          },
          {
            icon: <Plus className="w-5 h-5" />,
            label: "Nova Receita",
            onClick: handleAddIncome,
          },
        ]}
      />
    </div>
  );
}