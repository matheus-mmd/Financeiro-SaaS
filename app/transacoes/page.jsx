"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { fetchData, formatCurrency, formatDate, createTransaction, updateTransaction, deleteTransaction } from "../../src/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Trash2,
} from "lucide-react";

/**
 * Página Transações - Gerenciamento de transações
 * Nova estrutura: Categoria (Salário, Moradia, etc.) + Tipo de Transação (Receita, Despesa, Aporte)
 */
export default function Transacoes() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Função para obter intervalo do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    categoryId: null,
    transactionTypeId: null,
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsRes, categoriesRes, transactionTypesRes] = await Promise.all([
          fetchData("/api/transactions"),
          fetchData("/api/categories"),
          fetchData("/api/transactionTypes"),
        ]);
        setTransactions(transactionsRes.data);
        setFilteredTransactions(transactionsRes.data);
        setCategories(categoriesRes.data);
        setTransactionTypes(transactionTypesRes.data);

        // Definir categoria e tipo padrão após carregar os dados
        if (categoriesRes.data.length > 0 && transactionTypesRes.data.length > 0) {
          const defaultCategory = categoriesRes.data[0];
          const defaultType = transactionTypesRes.data[0];
          setFormData(prev => ({
            ...prev,
            categoryId: defaultCategory.id,
            transactionTypeId: defaultType.id,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filtrar por categoria
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category_id === parseInt(filterCategory));
    }

    // Filtrar por tipo de transação
    if (filterTransactionType !== "all") {
      filtered = filtered.filter((t) => t.type_internal_name === filterTransactionType);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((t) => {
        const [year, month, day] = t.date.split("-");
        const transactionDate = new Date(year, month - 1, day);
        transactionDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return transactionDate >= from && transactionDate <= to;
      });
    }

    setFilteredTransactions(filtered);
  }, [filterCategory, filterTransactionType, filterMonth, transactions]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    const defaultCategory = categories[0];
    const defaultType = transactionTypes[0];
    setFormData({
      description: "",
      amount: "",
      categoryId: defaultCategory?.id || null,
      transactionTypeId: defaultType?.id || null,
      date: new Date(),
    });
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    const [year, month, day] = transaction.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      categoryId: transaction.category_id,
      transactionTypeId: transaction.transaction_type_id,
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        const response = await fetchData("/api/transactions");
        setTransactions(response.data);
        setFilteredTransactions(response.data);
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar transação:", error);
        alert("Erro ao deletar transação.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Determinar o sinal do valor baseado no tipo de transação
      const transactionType = transactionTypes.find(t => t.id === formData.transactionTypeId);
      let amount = parseFloat(formData.amount);

      // Receitas são positivas, Despesas e Aportes são negativos
      if (transactionType?.internal_name === "income") {
        amount = Math.abs(amount);
      } else {
        amount = -Math.abs(amount);
      }

      const dateString = formData.date.toISOString().split("T")[0];

      const transactionData = {
        categoryId: formData.categoryId,
        transactionTypeId: formData.transactionTypeId,
        description: formData.description,
        amount: amount,
        date: dateString,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await createTransaction(transactionData, user.id);
      }

      const response = await fetchData("/api/transactions");
      setTransactions(response.data);
      setFilteredTransactions(response.data);

      setModalOpen(false);
      const defaultCategory = categories[0];
      const defaultType = transactionTypes[0];
      setFormData({
        description: "",
        amount: "",
        categoryId: defaultCategory?.id || null,
        transactionTypeId: defaultType?.id || null,
        date: new Date(),
      });
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar transação.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Quando muda a categoria, verificar se o tipo de transação selecionado é válido
  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId));
    let newTypeId = formData.transactionTypeId;

    // Se o tipo atual não está disponível para a nova categoria, selecionar o primeiro disponível
    if (category && !category.transactionTypes?.includes(formData.transactionTypeId)) {
      newTypeId = category.transactionTypes?.[0] || transactionTypes[0]?.id;
    }

    setFormData({
      ...formData,
      categoryId: parseInt(categoryId),
      transactionTypeId: newTypeId,
    });
  };

  // Obter tipos disponíveis para a categoria selecionada
  const getAvailableTypes = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    if (!category) return transactionTypes;

    // Se a categoria não tem tipos especificados, retornar todos
    if (!category.transactionTypes || category.transactionTypes.length === 0) {
      return transactionTypes;
    }

    // Retornar apenas os tipos permitidos para esta categoria
    return transactionTypes.filter(t => category.transactionTypes.includes(t.id));
  };

  // Calcular estatísticas baseadas nas transações filtradas
  const totalIncome = filteredTransactions
    .filter((t) => t.type_internal_name === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type_internal_name === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalInvestment = filteredTransactions
    .filter((t) => t.type_internal_name === "investment")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpense - totalInvestment;

  // Ordenar transações por data (mais recente primeiro)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      return Math.abs(b.amount) - Math.abs(a.amount);
    });
  }, [filteredTransactions]);

  if (loading) {
    return <PageSkeleton />;
  }

  // Ícone baseado no tipo de transação
  const getTypeIcon = (typeInternalName) => {
    const iconMap = {
      income: ArrowUpRight,
      expense: ArrowDownRight,
      investment: TrendingUp,
    };
    return iconMap[typeInternalName] || ArrowDownRight;
  };

  // Configuração de colunas da tabela
  const transactionColumns = [
    {
      key: "description",
      label: "Descrição",
      sortable: true,
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.category_color }}
          />
          <span className="text-sm font-medium text-gray-900">
            {row.category_name}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span className={row.amount >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {row.amount >= 0 ? "+" : "-"} {formatCurrency(Math.abs(row.amount))}
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
          onClick={() => handleDeleteTransaction(row)}
          className="p-1 hover:bg-red-50 rounded transition-colors"
          aria-label="Excluir transação"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
        actions={
          <Button onClick={handleAddTransaction}>
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        }
      />

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Filtro por categoria */}
              <div className="space-y-2">
                <Label htmlFor="filter-category" className="text-sm font-medium text-gray-700">
                  Categoria
                </Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="filter-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por tipo de transação */}
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-sm font-medium text-gray-700">
                  Tipo
                </Label>
                <Select value={filterTransactionType} onValueChange={setFilterTransactionType}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.internal_name}>
                        {type.name}
                      </SelectItem>
                    ))}
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

            {/* Limpar filtros */}
            {(filterCategory !== "all" || filterTransactionType !== "all" || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterCategory("all");
                    setFilterTransactionType("all");
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

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 min-w-0">
        <StatsCard
          icon={ArrowUpRight}
          label="Total de Receitas"
          value={formatCurrency(totalIncome)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={ArrowDownRight}
          label="Total de Despesas"
          value={formatCurrency(totalExpense)}
          iconColor="red"
          valueColor="text-red-600"
        />

        <StatsCard
          icon={TrendingUp}
          label="Total de Aportes"
          value={formatCurrency(totalInvestment)}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={ArrowUpRight}
          label="Saldo"
          value={formatCurrency(balance)}
          iconColor={balance >= 0 ? "purple" : "yellow"}
          valueColor={balance >= 0 ? "text-purple-600" : "text-orange-600"}
        />
      </div>

      {/* Tabela de transações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Transações ({filteredTransactions.length})
            </h2>
          </div>

          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhuma transação encontrada.{" "}
                <button
                  onClick={handleAddTransaction}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Adicionar nova transação
                </button>
              </p>
            </div>
          ) : (
            <Table
              columns={transactionColumns}
              data={sortedTransactions}
              pageSize={10}
              onRowClick={handleEditTransaction}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar transação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Salário, Mercado, Investimento..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.categoryId?.toString() || ""}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Transação */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.transactionTypeId?.toString() || ""}
                  onValueChange={(value) => handleInputChange("transactionTypeId", parseInt(value))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTypes().map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {editingTransaction ? "Salvar" : "Adicionar Transação"}
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
              Tem certeza que deseja excluir a transação "
              {transactionToDelete?.description}"? Esta ação não pode ser
              desfeita.
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
