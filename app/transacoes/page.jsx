"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import DateRangePicker from "../../src/components/DateRangePicker";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { Textarea } from "../../src/components/ui/textarea";
import { Checkbox } from "../../src/components/ui/checkbox";
import { Badge } from "../../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCurrentMonthRange,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import FloatingActionButton from "../../src/components/FloatingActionButton";
import { TRANSACTION_TYPES, PAYMENT_STATUS, PAYMENT_METHODS } from "../../src/constants";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Trash2,
  Download,
  Copy,
  Search,
  Upload,
  Repeat,
  CheckCircle2,
  Clock,
  X,
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    categoryId: null,
    transactionTypeId: null,
    date: new Date(),
    notes: "",
    status: PAYMENT_STATUS.PENDING,
    payment_method: "",
    installments_current: "",
    installments_total: "",
    is_recurring: false,
    recurrence_frequency: "monthly",
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

    // Filtrar por status de pagamento
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((t) => isDateInRange(t.date, filterMonth));
    }

    // Filtrar por busca (descrição, categoria, notas)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => {
        return (
          t.description?.toLowerCase().includes(search) ||
          t.category_name?.toLowerCase().includes(search) ||
          t.notes?.toLowerCase().includes(search) ||
          formatCurrency(Math.abs(t.amount)).includes(search)
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [filterCategory, filterTransactionType, filterStatus, filterMonth, searchTerm, transactions]);

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
      notes: "",
      status: PAYMENT_STATUS.PENDING,
      payment_method: "",
      installments_current: "",
      installments_total: "",
      is_recurring: false,
      recurrence_frequency: "monthly",
    });
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      categoryId: transaction.category_id,
      transactionTypeId: transaction.transaction_type_id,
      date: parseDateString(transaction.date) || new Date(),
      notes: transaction.notes || "",
      status: transaction.status || PAYMENT_STATUS.PENDING,
      payment_method: transaction.payment_method || "",
      installments_current: transaction.installments?.current || "",
      installments_total: transaction.installments?.total || "",
      is_recurring: transaction.is_recurring || false,
      recurrence_frequency: transaction.recurrence_frequency || "monthly",
    });
    setModalOpen(true);
  };

  // Duplicar transação
  const handleDuplicateTransaction = (transaction) => {
    setEditingTransaction(null);
    setFormData({
      description: transaction.description + " (Cópia)",
      amount: Math.abs(transaction.amount).toString(),
      categoryId: transaction.category_id,
      transactionTypeId: transaction.transaction_type_id,
      date: new Date(),
      notes: transaction.notes || "",
      status: PAYMENT_STATUS.PENDING,
      payment_method: transaction.payment_method || "",
      installments_current: "",
      installments_total: "",
      is_recurring: false,
      recurrence_frequency: "monthly",
    });
    setModalOpen(true);
  };

  // Toggle status de pagamento (pago/pendente)
  const handleToggleStatus = async (transaction) => {
    try {
      const newStatus = transaction.status === PAYMENT_STATUS.PAID ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID;
      await updateTransaction(transaction.id, { ...transaction, status: newStatus });
      const response = await fetchData("/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Seleção em lote
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === sortedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(sortedTransactions.map(t => t.id));
    }
  };

  // Deletar múltiplas transações
  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;

    if (!confirm(`Tem certeza que deseja excluir ${selectedTransactions.length} transação(ões)?`)) return;

    try {
      for (const id of selectedTransactions) {
        await deleteTransaction(id);
      }
      const response = await fetchData("/api/transactions");
      setTransactions(response.data);
      setSelectedTransactions([]);
    } catch (error) {
      console.error("Erro ao deletar transações:", error);
      alert("Erro ao deletar transações.");
    }
  };

  // Categorização inteligente - sugere categoria baseado na descrição
  const suggestCategory = (description) => {
    if (!description) return null;

    const desc = description.toLowerCase();

    // Mapear palavras-chave para categorias
    const keywords = {
      // Receitas
      'salário': { type: 1, keywords: ['salário', 'pagamento', 'vencimento'] },
      'freelance': { type: 1, keywords: ['freelance', 'freela', 'projeto'] },

      // Despesas
      'mercado': { type: 2, keywords: ['mercado', 'supermercado', 'feira', 'alimentação'] },
      'aluguel': { type: 2, keywords: ['aluguel', 'rent', 'moradia'] },
      'uber': { type: 2, keywords: ['uber', '99', 'taxi', 'transporte'] },
      'netflix': { type: 2, keywords: ['netflix', 'spotify', 'streaming', 'assinatura'] },
      'gasolina': { type: 2, keywords: ['gasolina', 'combustível', 'posto'] },
      'restaurante': { type: 2, keywords: ['restaurante', 'ifood', 'delivery'] },

      // Investimentos
      'ação': { type: 3, keywords: ['ação', 'ações', 'bolsa', 'b3'] },
      'cdb': { type: 3, keywords: ['cdb', 'tesouro', 'renda fixa'] },
    };

    // Procurar categoria correspondente
    for (const category of categories) {
      const categoryName = category.name.toLowerCase();
      if (desc.includes(categoryName)) {
        return category.id;
      }
    }

    // Buscar por palavras-chave
    for (const [catName, config] of Object.entries(keywords)) {
      for (const keyword of config.keywords) {
        if (desc.includes(keyword)) {
          const matchedCategory = categories.find(c =>
            c.name.toLowerCase().includes(catName) && c.transaction_type_id === config.type
          );
          if (matchedCategory) return matchedCategory.id;
        }
      }
    }

    return null;
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
      if (transactionType?.internal_name === TRANSACTION_TYPES.INCOME) {
        amount = Math.abs(amount);
      } else {
        amount = -Math.abs(amount);
      }

      const dateString = formData.date.toISOString().split("T")[0];

      // Preparar dados de parcelas
      let installments = null;
      if (formData.installments_total && parseInt(formData.installments_total) > 1) {
        installments = {
          current: parseInt(formData.installments_current) || 1,
          total: parseInt(formData.installments_total),
        };
      }

      const transactionData = {
        categoryId: formData.categoryId,
        transactionTypeId: formData.transactionTypeId,
        description: formData.description,
        amount: amount,
        date: dateString,
        notes: formData.notes || null,
        status: formData.status,
        payment_method: formData.payment_method || null,
        installments: installments,
        is_recurring: formData.is_recurring || false,
        recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : null,
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
        notes: "",
        status: PAYMENT_STATUS.PENDING,
        payment_method: "",
        installments_current: "",
        installments_total: "",
        is_recurring: false,
        recurrence_frequency: "monthly",
      });
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar transação.");
    }
  };

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };

    // Categorização inteligente: sugerir categoria baseado na descrição
    if (field === "description" && !editingTransaction) {
      const suggestedCategoryId = suggestCategory(value);
      if (suggestedCategoryId && !formData.categoryId) {
        const category = categories.find(c => c.id === suggestedCategoryId);
        if (category) {
          newFormData.categoryId = suggestedCategoryId;
          newFormData.transactionTypeId = category.transaction_type_id;
        }
      }
    }

    setFormData(newFormData);
  };

  // Quando muda a categoria, o tipo de transação é automaticamente definido
  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId));

    // Definir o tipo de transação baseado no tipo da categoria
    const newTypeId = category?.transaction_type_id || transactionTypes[0]?.id;

    setFormData({
      ...formData,
      categoryId: parseInt(categoryId),
      transactionTypeId: newTypeId,
    });
  };

  // Calcular estatísticas baseadas nas transações filtradas
  const totalIncome = filteredTransactions
    .filter((t) => t.type_internal_name === TRANSACTION_TYPES.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type_internal_name === TRANSACTION_TYPES.EXPENSE)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalInvestment = filteredTransactions
    .filter((t) => t.type_internal_name === TRANSACTION_TYPES.INVESTMENT)
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

  const handleExport = () => {
    const columns = [
      { key: "date", label: "Data", format: (row) => formatDate(row.date) },
      { key: "description", label: "Descrição" },
      { key: "category_name", label: "Categoria" },
      { key: "type_name", label: "Tipo" },
      {
        key: "amount",
        label: "Valor",
        format: (row) => formatCurrency(Math.abs(row.amount)),
      },
    ];

    exportToCSV(sortedTransactions, columns, "transacoes");
  };

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
      key: "select",
      label: (
        <Checkbox
          checked={selectedTransactions.length === sortedTransactions.length && sortedTransactions.length > 0}
          onCheckedChange={handleSelectAll}
        />
      ),
      render: (row) => (
        <Checkbox
          checked={selectedTransactions.includes(row.id)}
          onCheckedChange={() => handleSelectTransaction(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "description",
      label: "Descrição",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.description}</span>
          {row.notes && (
            <span className="text-xs text-gray-500 mt-0.5">{row.notes}</span>
          )}
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
              {row.category_name}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => {
        let colorClass = "text-gray-900";
        if (row.type_internal_name === "income") {
          colorClass = "text-green-600";
        } else if (row.type_internal_name === "expense") {
          colorClass = "text-red-600";
        } else if (row.type_internal_name === "investment") {
          colorClass = "text-blue-600";
        }

        return (
          <div className="flex flex-col">
            <span className={`${colorClass} font-medium`}>
              {row.amount >= 0 ? "+" : "-"} {formatCurrency(Math.abs(row.amount))}
            </span>
            {row.installments && (
              <span className="text-xs text-gray-500">
                {row.installments.current}/{row.installments.total}x
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row);
          }}
          className="hover:scale-105 transition-transform"
        >
          {row.status === PAYMENT_STATUS.PAID ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Pago
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50">
              <Clock className="w-3 h-3 mr-1" />
              Pendente
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span>{formatDate(row.date)}</span>
          {row.is_recurring && (
            <Badge variant="outline" className="text-xs w-fit mt-1">
              <Repeat className="w-3 h-3 mr-1" />
              Recorrente
            </Badge>
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
              handleDuplicateTransaction(row);
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar transação"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTransaction(row);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Excluir transação"
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
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
            <Button variant="secondary" onClick={handleExport}>
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

      {/* Busca e Ações em Lote */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por descrição, categoria, valor ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ações em Lote */}
        {selectedTransactions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {selectedTransactions.length} selecionada(s)
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Deletar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTransactions([])}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <FilterButton
          activeFiltersCount={
            (filterCategory !== "all" ? 1 : 0) +
            (filterTransactionType !== "all" ? 1 : 0) +
            (filterStatus !== "all" ? 1 : 0) +
            (filterMonth ? 1 : 0)
          }
          onClearFilters={() => {
            setFilterCategory("all");
            setFilterTransactionType("all");
            setFilterStatus("all");
            setFilterMonth(null);
          }}
          width="w-[calc(100vw-2rem)] sm:w-[28rem]"
        >
          <div className="grid grid-cols-1 gap-4">
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

                  {/* Receitas */}
                  {categories.filter(cat => cat.transaction_type_id === 1).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-green-600 font-bold text-xs uppercase">
                        Receitas
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 1)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}

                  {/* Despesas */}
                  {categories.filter(cat => cat.transaction_type_id === 2).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-red-600 font-bold text-xs uppercase">
                        Despesas
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 2)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}

                  {/* Aportes/Investimentos */}
                  {categories.filter(cat => cat.transaction_type_id === 3).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-blue-600 font-bold text-xs uppercase">
                        Aportes
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 3)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}
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
                  {transactionTypes.map((type) => {
                    const colorMap = {
                      income: 'text-green-600',
                      expense: 'text-red-600',
                      investment: 'text-blue-600'
                    };
                    const color = colorMap[type.internal_name] || 'text-gray-900';
                    return (
                      <SelectItem key={type.id} value={type.internal_name}>
                        <span className={`font-medium ${color}`}>
                          {type.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por status de pagamento */}
            <div className="space-y-2">
              <Label htmlFor="filter-status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={PAYMENT_STATUS.PAID}>
                    <span className="font-medium text-green-600">Pago</span>
                  </SelectItem>
                  <SelectItem value={PAYMENT_STATUS.PENDING}>
                    <span className="font-medium text-amber-600">Pendente</span>
                  </SelectItem>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
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
              Todas as Transações ({sortedTransactions.length})
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
                  {/* Receitas */}
                  {categories.filter(cat => cat.transaction_type_id === 1).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-green-600 font-bold text-xs uppercase">
                        Receitas
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 1)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}

                  {/* Despesas */}
                  {categories.filter(cat => cat.transaction_type_id === 2).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-red-600 font-bold text-xs uppercase">
                        Despesas
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 2)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}

                  {/* Aportes/Investimentos */}
                  {categories.filter(cat => cat.transaction_type_id === 3).length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-blue-600 font-bold text-xs uppercase">
                        Aportes
                      </SelectLabel>
                      {categories
                        .filter(cat => cat.transaction_type_id === 3)
                        .map((category) => {
                          const IconComponent = getIconComponent(category.icon || "Tag");
                          return (
                            <SelectItem key={category.id} value={category.id.toString()} className="pl-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: category.color + '20' }}
                                >
                                  <IconComponent
                                    className="w-4 h-4"
                                    style={{ color: category.color }}
                                  />
                                </div>
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  )}
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

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: Compra relacionada ao projeto X..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Status de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="status">Status de Pagamento</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PAYMENT_STATUS.PENDING}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Pendente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={PAYMENT_STATUS.PAID}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Pago</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Forma de Pagamento (Opcional)</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange("payment_method", value)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parcelas */}
            <div className="space-y-2">
              <Label>Parcelas (Opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="number"
                    placeholder="Atual"
                    value={formData.installments_current}
                    onChange={(e) => handleInputChange("installments_current", e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Total"
                    value={formData.installments_total}
                    onChange={(e) => handleInputChange("installments_total", e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Ex: Parcela 1 de 12</p>
            </div>

            {/* Recorrência */}
            <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => handleInputChange("is_recurring", checked)}
                />
                <Label htmlFor="is-recurring" className="cursor-pointer">
                  Transação recorrente
                </Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence-frequency">Frequência</Label>
                  <Select
                    value={formData.recurrence_frequency}
                    onValueChange={(value) => handleInputChange("recurrence_frequency", value)}
                  >
                    <SelectTrigger id="recurrence-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

      {/* Modal de Importação CSV */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Transações via CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Formato do arquivo CSV</h4>
              <p className="text-sm text-blue-800 mb-3">
                O arquivo deve conter as seguintes colunas (nesta ordem):
              </p>
              <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs">
                data,descrição,valor,categoria,tipo,status,notas
              </div>
              <p className="text-xs text-blue-700 mt-2">
                • Data: formato AAAA-MM-DD (ex: 2024-01-15)<br />
                • Valor: número positivo ou negativo (ex: 1500.00 ou -350.50)<br />
                • Tipo: income, expense ou investment<br />
                • Status: paid ou pending (opcional)<br />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="cursor-pointer"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Atenção:</strong> Esta funcionalidade está em desenvolvimento.
                Por enquanto, as transações precisam ser adicionadas manualmente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(false)}
            >
              Fechar
            </Button>
            <Button disabled>
              <Upload className="w-4 h-4 mr-2" />
              Importar (Em breve)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FloatingActionButton
        onClick={handleAddTransaction}
        label="Nova Transação"
      />
    </div>
  );
}