"use client";

import React, { useState, useEffect, useMemo, useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  formatCurrency,
  formatDate,
  getCurrentMonthRange,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import { useTransactions } from "../../src/lib/supabase/hooks/useTransactions";
import { useReferenceData } from "../../src/lib/supabase/hooks/useReferenceData";
import { useBanks } from "../../src/lib/supabase/hooks/useBanks";
import { useCards } from "../../src/lib/supabase/hooks/useCards";
import { useDebounce } from "../../src/hooks/useDebounce";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import FABMenu from "../../src/components/FABMenu";
import {
  TRANSACTION_TYPES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
} from "../../src/constants";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Trash2,
  Download,
  Copy,
  Upload,
  Repeat,
  CheckCircle2,
  Clock,
} from "lucide-react";

/**
 * Estado inicial do formulário de transações
 */
const initialFormState = {
  description: "",
  amount: "",
  categoryId: null,
  transactionTypeId: null,
  date: new Date(),
  notes: "",
  status: PAYMENT_STATUS.PENDING,
  payment_method: "",
  payment_date: null,
  card_id: null,
  bank_id: null,
  installments_current: "",
  installments_total: "",
  is_recurring: false,
  recurrence_frequency: "monthly",
};

const normalizePaymentMethodName = (name = "") =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/**
 * Reducer para gerenciar o estado do formulário
 * Previne re-renders desnecessários e facilita manutenção
 */
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };

    case 'UPDATE_MULTIPLE':
      return { ...state, ...action.updates };

    case 'RESET':
      return action.initialState || initialFormState;

    case 'SET_EDITING':
      return { ...state, ...action.transaction };

    default:
      return state;
  }
}

/**
 * Página Transações - Gerenciamento de transações
 * Nova estrutura: Categoria (Salário, Moradia, etc.) + Tipo de Transação (Receita, Despesa, Patrimônio)
 */
export default function Transacoes() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { transactions, loading: transactionsLoading, refresh, create, update, remove } = useTransactions();
  const { data: referenceData } = useReferenceData({
    resources: [
      "categories",
      "transactionTypes",
      "paymentStatuses",
      "paymentMethods",
      "recurrenceFrequencies",
    ],
  });
  const { banks, loading: banksLoading } = useBanks();
  const { cards, loading: cardsLoading } = useCards();
  const {
    categories = [],
    transactionTypes = [],
    paymentStatuses = [],
    paymentMethods = [],
    recurrenceFrequencies = [],
  } = referenceData || {};
  const paymentMethodOptions = useMemo(
    () =>
      paymentMethods.length
        ? paymentMethods
        : PAYMENT_METHODS.map((name) => ({
            id: name,
            name,
            internal_name: normalizePaymentMethodName(name),
          })),
    [paymentMethods]
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [columnSelectorElement, setColumnSelectorElement] = useState(null);

  // Usar useReducer para formulário complexo (16 campos)
  // Previne re-renders desnecessários quando apenas um campo muda
  const [formData, dispatch] = useReducer(formReducer, initialFormState);

  // OTIMIZAÇÃO: Debounce na descrição para evitar re-renders excessivos na categorização inteligente
  const debouncedDescription = useDebounce(formData.description, 500);

  const mapTransactions = useCallback((data = []) =>
    data.map((t) => ({
      ...t,
      date: t.transaction_date,
      type_internal_name: t.transaction_type_internal_name,
      status: t.payment_status_internal_name,
      payment_method: normalizePaymentMethodName(t.payment_method_name || ""),
      payment_method_label: t.payment_method_name || "",
      installments: t.installment_total > 1 ? {
        current: t.installment_number,
        total: t.installment_total,
      } : null,
    })), []);


  const handleAuthFailure = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [router, signOut]);

  const isAuthError = useCallback((error) => {
    return error?.code === 'AUTH_REQUIRED' || error?.message?.includes('Usuário não autenticado');
  }, []);

  const handleApiError = useCallback(async (error) => {
    if (isAuthError(error)) {
      await handleAuthFailure();
      return true;
    }
    return false;
  }, [handleAuthFailure, isAuthError]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (editingTransaction) return;
    if (!categories.length || !transactionTypes.length) return;

    // Definir categoria e tipo padrão
    const defaultCategory = categories[0];
    const defaultTypeId = defaultCategory.transaction_type_id || transactionTypes[0].id;

    dispatch({
      type: 'UPDATE_MULTIPLE',
      updates: {
        categoryId: defaultCategory.id,
        transactionTypeId: defaultTypeId,
      }
    });
  }, [categories, transactionTypes, editingTransaction]);

  // OTIMIZAÇÃO: Categorização inteligente com debounce
  // Só executa após o usuário parar de digitar por 500ms
  useEffect(() => {
    if (editingTransaction) return;
    if (!debouncedDescription) return;
    if (formData.categoryId) return; // Não sobrescrever categoria já selecionada

    const suggestedCategoryId = suggestCategory(debouncedDescription);
    if (suggestedCategoryId) {
      const category = categories.find((c) => c.id === suggestedCategoryId);
      if (category) {
        dispatch({
          type: 'UPDATE_MULTIPLE',
          updates: {
            categoryId: suggestedCategoryId,
            transactionTypeId: category.transaction_type_id,
          }
        });
      }
    }
  }, [debouncedDescription, editingTransaction, formData.categoryId, categories]);

  const mappedTransactions = useMemo(() => mapTransactions(transactions || []), [transactions, mapTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = mappedTransactions;

    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category_id === parseInt(filterCategory));
    }

    if (filterTransactionType !== "all") {
      filtered = filtered.filter((t) => t.type_internal_name === filterTransactionType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((t) => isDateInRange(t.date, filterMonth));
    }

    return filtered;
  }, [mappedTransactions, filterCategory, filterTransactionType, filterStatus, filterMonth]);

  const loading = useMemo(
    () => authLoading || (transactionsLoading && transactions.length === 0),
    [authLoading, transactions.length, transactionsLoading]
  );

  const handleAddTransaction = useCallback(() => {
    setEditingTransaction(null);
    const defaultCategory = categories[0];
    const defaultTypeId = defaultCategory?.transaction_type_id || transactionTypes[0]?.id;
    dispatch({
      type: 'RESET',
      initialState: {
        ...initialFormState,
        categoryId: defaultCategory?.id || null,
        transactionTypeId: defaultTypeId || null,
      }
    });
    setModalOpen(true);
  }, [categories, transactionTypes]);

  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    dispatch({
      type: 'SET_EDITING',
      transaction: {
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        categoryId: transaction.category_id,
        transactionTypeId: transaction.transaction_type_id,
        date: parseDateString(transaction.date) || new Date(),
        notes: transaction.notes || "",
        status: transaction.status || PAYMENT_STATUS.PENDING,
        payment_method: transaction.payment_method || "",
        payment_date: transaction.payment_date ? parseDateString(transaction.payment_date) : null,
        card_id: transaction.card_id || null,
        bank_id: transaction.bank_id || null,
        installments_current: transaction.installments?.current || "",
        installments_total: transaction.installments?.total || "",
        is_recurring: transaction.is_recurring || false,
        recurrence_frequency: transaction.recurrence_frequency || "monthly",
      }
    });
    setModalOpen(true);
  }, []);

  // Duplicar transação
  const handleDuplicateTransaction = useCallback((transaction) => {
    setEditingTransaction(null);
    dispatch({
      type: 'SET_EDITING',
      transaction: {
        description: transaction.description + " (Cópia)",
        amount: Math.abs(transaction.amount).toString(),
        categoryId: transaction.category_id,
        transactionTypeId: transaction.transaction_type_id,
        date: new Date(),
        notes: transaction.notes || "",
        status: PAYMENT_STATUS.PENDING,
        payment_method: transaction.payment_method || "",
        payment_date: null,
        card_id: transaction.card_id || null,
        bank_id: transaction.bank_id || null,
        installments_current: "",
        installments_total: "",
        is_recurring: false,
        recurrence_frequency: "monthly",
      }
    });
    setModalOpen(true);
  }, []);

  // Toggle status de pagamento (pago/pendente)
  const handleToggleStatus = useCallback(async (transaction) => {
    try {
      const newStatus =
        transaction.status === PAYMENT_STATUS.PAID
          ? PAYMENT_STATUS.PENDING
          : PAYMENT_STATUS.PAID;

      const result = await update(transaction.id, {
        status: newStatus,
      });

      if (result.error) throw result.error;

      await refresh();
    } catch (error) {
      if (!(await handleApiError(error))) {
        console.error("Erro ao atualizar status:", error);
      }
    }
  }, [refresh, update, handleApiError]);

  // Categorização inteligente - sugere categoria baseado na descrição
  const suggestCategory = (description) => {
    if (!description) return null;

    const desc = description.toLowerCase();

    // Mapear palavras-chave para categorias
    const keywords = {
      // Receitas
      salário: { type: 1, keywords: ["salário", "pagamento", "vencimento"] },
      freelance: { type: 1, keywords: ["freelance", "freela", "projeto"] },

      // Despesas
      mercado: {
        type: 2,
        keywords: ["mercado", "supermercado", "feira", "alimentação"],
      },
      aluguel: { type: 2, keywords: ["aluguel", "rent", "moradia"] },
      uber: { type: 2, keywords: ["uber", "99", "taxi", "transporte"] },
      netflix: {
        type: 2,
        keywords: ["netflix", "spotify", "streaming", "assinatura"],
      },
      gasolina: { type: 2, keywords: ["gasolina", "combustível", "posto"] },
      restaurante: { type: 2, keywords: ["restaurante", "ifood", "delivery"] },

      // Investimentos
      ação: { type: 3, keywords: ["ação", "ações", "bolsa", "b3"] },
      cdb: { type: 3, keywords: ["cdb", "tesouro", "renda fixa"] },
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
          const matchedCategory = categories.find(
            (c) =>
              c.name.toLowerCase().includes(catName) &&
              c.transaction_type_id === config.type
          );
          if (matchedCategory) return matchedCategory.id;
        }
      }
    }

    return null;
  };

  const handleDeleteTransaction = useCallback((transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        const result = await remove(transactionToDelete.id);
        if (result.error) throw result.error;

        await refresh();
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        if (!(await handleApiError(error))) {
          console.error("Erro ao deletar transação:", error);
          alert("Erro ao deletar transação.");
        }
      }
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      // Determinar o sinal do valor baseado no tipo de transação
      const transactionType = transactionTypes.find(
        (t) => t.id === formData.transactionTypeId
      );
      let amount = parseFloat(formData.amount);

      // Receitas são positivas, Despesas e Patrimônio são negativos
      if (transactionType?.internal_name === TRANSACTION_TYPES.INCOME) {
        amount = Math.abs(amount);
      } else {
        amount = -Math.abs(amount);
      }

      const dateString = formData.date.toISOString().split("T")[0];
      const paymentDateString = formData.payment_date ? formData.payment_date.toISOString().split("T")[0] : null;

      // Find IDs for enums
      const paymentStatus = paymentStatuses.find(s => s.internal_name === formData.status);
      const paymentMethod = paymentMethodOptions.find(m => m.internal_name === formData.payment_method);
      const recurrenceFreq = recurrenceFrequencies.find(f => f.internal_name === formData.recurrence_frequency);

      const transactionData = {
        categoryId: formData.categoryId,
        transactionTypeId: formData.transactionTypeId,
        description: formData.description,
        amount: amount,
        transactionDate: dateString,
        notes: formData.notes || null,
        statusId: paymentStatus?.id || 1, // Default to 'pending'
        paymentMethodId: paymentMethod?.id || null,
        paymentDate: paymentDateString,
        cardId: formData.card_id || null,
        bankId: formData.bank_id || null,
        installmentNumber: formData.installments_total && parseInt(formData.installments_total) > 1
          ? parseInt(formData.installments_current) || 1
          : null,
        installmentTotal: formData.installments_total && parseInt(formData.installments_total) > 1
          ? parseInt(formData.installments_total)
          : null,
        isRecurring: formData.is_recurring || false,
        recurrenceFrequencyId: formData.is_recurring && recurrenceFreq ? recurrenceFreq.id : null,
      };

      let result;
      if (editingTransaction) {
        result = await update(editingTransaction.id, transactionData);
      } else {
        result = await create(transactionData);
      }

      if (result.error) throw result.error;

      await refresh();

      setModalOpen(false);
      const defaultCategory = categories[0];
      const defaultTypeId = defaultCategory?.transaction_type_id || transactionTypes[0]?.id;
      dispatch({
        type: 'RESET',
        initialState: {
          ...initialFormState,
          categoryId: defaultCategory?.id || null,
          transactionTypeId: defaultTypeId || null,
        }
      });
    } catch (error) {
      if (!(await handleApiError(error))) {
        console.error("Erro ao salvar transação:", error);
        alert("Erro ao salvar transação.");
      }
    }
  }, [formData, transactionTypes, paymentStatuses, paymentMethodOptions, recurrenceFrequencies, editingTransaction, categories, handleApiError, update, create, refresh]);

  const handleInputChange = useCallback((field, value) => {
    // Atualizar campo principal
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  // Quando muda a categoria, o tipo de transação é automaticamente definido
  const handleCategoryChange = useCallback((categoryId) => {
    const category = categories.find((c) => c.id === parseInt(categoryId));

    // Definir o tipo de transação baseado no tipo da categoria
    const newTypeId = category?.transaction_type_id || transactionTypes[0]?.id;

    dispatch({
      type: 'UPDATE_MULTIPLE',
      updates: {
        categoryId: parseInt(categoryId),
        transactionTypeId: newTypeId,
      }
    });
  }, [categories, transactionTypes]);

  // Calcular estatísticas baseadas nas transações filtradas
  const totalIncome = useMemo(() =>
    filteredTransactions
      .filter((t) => t.type_internal_name === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(() =>
    filteredTransactions
      .filter((t) => t.type_internal_name === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [filteredTransactions]
  );

  const totalInvestment = useMemo(() =>
    filteredTransactions
      .filter((t) => t.type_internal_name === TRANSACTION_TYPES.INVESTMENT)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [filteredTransactions]
  );

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

  const handleExport = useCallback(() => {
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
  }, [sortedTransactions]);

  if (!authLoading && !user) {
    router.replace('/login');
    return <PageSkeleton />;
  }

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
              style={{ backgroundColor: row.category_color + "20" }}
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
              {row.amount >= 0 ? "+" : "-"}{" "}
              {formatCurrency(Math.abs(row.amount))}
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
            <Badge
              variant="outline"
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
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
      />

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
              <Label
                htmlFor="filter-category"
                className="text-sm font-medium text-gray-700"
              >
                Categoria
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>

                  {/* Receitas */}
                  {categories.filter((cat) => cat.transaction_type_id === 1)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-green-600 font-bold text-xs uppercase">
                        Receitas
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 1)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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
                  {categories.filter((cat) => cat.transaction_type_id === 2)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-red-600 font-bold text-xs uppercase">
                        Despesas
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 2)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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

                  {/* Patrimônio/Investimentos */}
                  {categories.filter((cat) => cat.transaction_type_id === 3)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-purple-600 font-bold text-xs uppercase">
                        Patrimônio
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 3)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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
              <Label
                htmlFor="filter-type"
                className="text-sm font-medium text-gray-700"
              >
                Tipo
              </Label>
              <Select
                value={filterTransactionType}
                onValueChange={setFilterTransactionType}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {transactionTypes.map((type) => {
                    const colorMap = {
                      income: "text-green-600",
                      expense: "text-red-600",
                      investment: "text-blue-600",
                    };
                    const color =
                      colorMap[type.internal_name] || "text-gray-900";
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
              <Label
                htmlFor="filter-status"
                className="text-sm font-medium text-gray-700"
              >
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
          label="Total em Patrimônio"
          value={formatCurrency(totalInvestment)}
          iconColor="purple"
          valueColor="text-purple-600"
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
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Transações ({sortedTransactions.length})
            </h2>
            {columnSelectorElement}
          </div>

          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <ArrowUpRight className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">Nenhuma transação encontrada</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTransaction}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Transação
              </Button>
            </div>
          ) : (
            <Table
              columns={transactionColumns}
              data={sortedTransactions}
              pageSize={10}
              onRowClick={handleEditTransaction}
              tableId="transactions-table"
              renderColumnSelector={setColumnSelectorElement}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar transação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingTransaction ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form
              id="transaction-form"
              onSubmit={handleSubmit}
              className="space-y-3"
            >
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ex: Salário, Mercado, Investimento..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Categoria</Label>
                {/* Badge indicador do tipo de transação */}
                {formData.transactionTypeId && (() => {
                  const selectedType = transactionTypes.find(t => t.id === formData.transactionTypeId);
                  if (!selectedType) return null;

                  const typeConfig = {
                    income: { label: 'Receita', color: 'bg-green-100 text-green-700 border-green-200' },
                    expense: { label: 'Despesa', color: 'bg-red-100 text-red-700 border-red-200' },
                    investment: { label: 'Patrimônio', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                  };

                  const config = typeConfig[selectedType.internal_name] || { label: selectedType.name, color: 'bg-gray-100 text-gray-700' };

                  return (
                    <Badge variant="outline" className={`${config.color} text-xs font-semibold`}>
                      {config.label}
                    </Badge>
                  );
                })()}
              </div>
              <Select
                value={formData.categoryId?.toString() || ""}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {/* Receitas */}
                  {categories.filter((cat) => cat.transaction_type_id === 1)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-green-600 font-bold text-xs uppercase">
                        Receitas
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 1)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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
                  {categories.filter((cat) => cat.transaction_type_id === 2)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-red-600 font-bold text-xs uppercase">
                        Despesas
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 2)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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

                  {/* Patrimônio/Investimentos */}
                  {categories.filter((cat) => cat.transaction_type_id === 3)
                    .length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-purple-600 font-bold text-xs uppercase">
                        Patrimônio
                      </SelectLabel>
                      {categories
                        .filter((cat) => cat.transaction_type_id === 3)
                        .map((category) => {
                          const IconComponent = getIconComponent(
                            category.icon || "Tag"
                          );
                          return (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                              className="pl-6"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{
                                    backgroundColor: category.color + "20",
                                  }}
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
                name="amount"
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
                id="date"
                name="date"
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
                autoComplete="off"
              />
            </div>

            {/* Status de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status" className="text-sm">
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
              <Label htmlFor="payment-method" className="text-sm">
                Pagamento (Opcional)
              </Label>
              <Select
                value={formData.payment_method || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "payment_method",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger id="payment-method" className="text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {paymentMethodOptions.map((method) => (
                    <SelectItem
                      key={method.id || method.internal_name || method.name}
                      value={method.internal_name}
                    >
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parcelas */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Parcelas (Opcional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="installments-current" className="text-xs text-gray-600">
                    Parcela atual
                  </Label>
                  <Input
                    id="installments-current"
                    name="installments_current"
                    type="number"
                    placeholder="Atual"
                    value={formData.installments_current}
                    onChange={(e) =>
                      handleInputChange("installments_current", e.target.value)
                    }
                    min="1"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="installments-total" className="text-xs text-gray-600">
                    Total de parcelas
                  </Label>
                  <Input
                    id="installments-total"
                    name="installments_total"
                    type="number"
                    placeholder="Total"
                    value={formData.installments_total}
                    onChange={(e) =>
                      handleInputChange("installments_total", e.target.value)
                    }
                    min="1"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Data de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment-date" className="text-sm">
                Data de Pagamento (Opcional)
              </Label>
              <DatePicker
                id="payment-date"
                name="payment-date"
                value={formData.payment_date}
                onChange={(date) => handleInputChange("payment_date", date)}
                autoComplete="off"
              />
            </div>

            {/* Cartão */}
            <div className="space-y-2">
              <Label htmlFor="card" className="text-sm">
                Cartão (Opcional)
              </Label>
              <Select
                value={formData.card_id ? formData.card_id.toString() : "none"}
                onValueChange={(value) =>
                  handleInputChange("card_id", value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger id="card" className="text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banco */}
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-sm">
                Banco (Opcional)
              </Label>
              <Select
                value={formData.bank_id ? formData.bank_id.toString() : "none"}
                onValueChange={(value) =>
                  handleInputChange("bank_id", value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger id="bank" className="text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">
                Observações (Opcional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Adicione observações sobre esta transação..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Recorrência */}
            <div className="space-y-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_recurring", checked)
                  }
                />
                <Label
                  htmlFor="is-recurring"
                  className="cursor-pointer text-sm font-medium"
                >
                  Recorrente
                </Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-1.5 pl-6">
                  <Label
                    htmlFor="recurrence-frequency"
                    className="text-xs text-gray-600"
                  >
                    Frequência
                  </Label>
                  <Select
                    value={formData.recurrence_frequency}
                    onValueChange={(value) =>
                      handleInputChange("recurrence_frequency", value)
                    }
                  >
                    <SelectTrigger
                      id="recurrence-frequency"
                      className="text-sm h-9"
                    >
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
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 flex-shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="transaction-form"
              className="flex-1 sm:flex-none"
            >
              {editingTransaction ? "Salvar" : "Adicionar"}
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
              <h4 className="font-semibold text-blue-900 mb-2">
                Formato do arquivo CSV
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                O arquivo deve conter as seguintes colunas (nesta ordem):
              </p>
              <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs">
                data,descrição,valor,categoria,tipo,status,notas
              </div>
              <p className="text-xs text-blue-700 mt-2">
                • Data: formato AAAA-MM-DD (ex: 2024-01-15)
                <br />
                • Valor: número positivo ou negativo (ex: 1500.00 ou -350.50)
                <br />
                • Tipo: income, expense ou investment
                <br />
                • Status: paid ou pending (opcional)
                <br />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
              <Input
                id="csv-file"
                name="csv-file"
                type="file"
                accept=".csv"
                className="cursor-pointer"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Atenção:</strong> Esta funcionalidade está em
                desenvolvimento. Por enquanto, as transações precisam ser
                adicionadas manualmente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Fechar
            </Button>
            <Button disabled>
              <Upload className="w-4 h-4 mr-2" />
              Importar (Em breve)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Transações"
        actions={[
          {
            icon: <Upload className="w-5 h-5" />,
            label: "Importar CSV",
            onClick: () => setImportModalOpen(true),
          },
          {
            icon: <Download className="w-5 h-5" />,
            label: "Exportar",
            onClick: handleExport,
          },
          {
            icon: <Plus className="w-5 h-5" />,
            label: "Nova Transação",
            onClick: handleAddTransaction,
          },
        ]}
      />
    </div>
  );
}