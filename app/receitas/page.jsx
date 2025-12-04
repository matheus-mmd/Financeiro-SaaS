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
import {
  fetchData,
  formatCurrency,
  formatDate,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../../src/utils";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import FloatingActionButton from "../../src/components/FloatingActionButton";
import {
  Receipt,
  Plus,
  Trash2,
  TrendingUp,
  PieChart,
  Download,
} from "lucide-react";

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
        const [incomesRes, categoriesRes] = await Promise.all([
          fetchData("/api/incomes"),
          fetchData("/api/categories"),
        ]);
        setIncomes(incomesRes.data);
        setFilteredIncomes(incomesRes.data);
        // Filtrar apenas categorias de receita (transaction_type_id === 1)
        const incomeCategories = categoriesRes.data.filter(
          (cat) => cat.transaction_type_id === 1
        );
        setCategories(incomeCategories);
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
      filtered = filtered.filter((i) => {
        // Separar a string de data para evitar problemas com timezone
        const [year, month, day] = i.date.split("-");
        const incomeDate = new Date(year, month - 1, day);
        incomeDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return incomeDate >= from && incomeDate <= to;
      });
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
    });
    setModalOpen(true);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    // Converter string de data para Date object
    const [year, month, day] = income.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      title: income.title,
      category: income.category,
      amount: income.amount.toString(),
      date: dateObj,
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
        // Deletar usando mock API
        await deleteIncome(incomeToDelete.id);

        // Recarregar dados da mock API
        const response = await fetchData("/api/incomes");
        setIncomes(response.data);
        setFilteredIncomes(response.data);

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

      const incomeData = {
        categoriesId: category?.id,
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: dateString,
      };

      if (editingIncome) {
        // Atualizar receita existente
        await updateIncome(editingIncome.id, incomeData);
      } else {
        // Criar nova receita
        await createIncome(incomeData, user.id);
      }

      // Recarregar dados da mock API
      const response = await fetchData("/api/incomes");
      setIncomes(response.data);
      setFilteredIncomes(response.data);

      setModalOpen(false);
      setFormData({ title: "", category: "", amount: "", date: new Date() });
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
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      render: (row) => {
        const category = categories.find(
          (c) => c.name === row.category || c.id === row.category.toLowerCase()
        );
        const IconComponent = getIconComponent(category?.icon || row.category_icon || "Tag");
        return (
          <div className="flex items-center gap-2">
            <div
              className="p-1 rounded flex-shrink-0"
              style={{ backgroundColor: (category?.color || "#64748b") + '20' }}
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
      key: "actions",
      label: "Ações",
      render: (row) => (
        <button
          onClick={() => handleDeleteIncome(row)}
          className="p-1 hover:bg-red-50 rounded transition-colors"
          aria-label="Excluir receita"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Receitas"
        description="Gerencie suas receitas por categoria"
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button onClick={handleAddIncome}>
              <Plus className="w-4 h-4" />
              Nova Receita
            </Button>
          </>
        }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        <StatsCard
          icon={TrendingUp}
          label="Total de Receitas"
          value={formatCurrency(totalIncomes)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={Receipt}
          label="Total de Itens"
          value={incomes.length}
          iconColor="blue"
          valueColor="text-blue-600"
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
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Receitas
            </h2>
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

      <FloatingActionButton onClick={handleAddIncome} label="Nova Receita" />
    </div>
  );
}