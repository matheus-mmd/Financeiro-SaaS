"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import PageSkeleton from "../../src/components/PageSkeleton";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { useBudgets } from "../../src/lib/supabase/hooks/useBudgets";
import { useCategories } from "../../src/lib/supabase/hooks/useCategories";
import { useToast } from "../../src/components/Toast";
import ConfirmDialog from "../../src/components/ConfirmDialog";
import EmojiPicker from "../../src/components/EmojiPicker";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "../../src/utils";
import { TRANSACTION_TYPE_IDS } from "../../src/constants";

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Página de Orçamento por Categoria
 * Permite definir limites mensais de gastos por categoria
 */
export default function OrcamentoCategoriaPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const toast = useToast();

  // Estado do período selecionado
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const {
    budgets,
    loading: budgetsLoading,
    error: budgetsError,
    totals,
    create: createBudget,
    update: updateBudget,
    remove: removeBudget,
  } = useBudgets(selectedYear, selectedMonth);

  const {
    categories,
    loading: categoriesLoading,
    create: createCategory,
  } = useCategories();

  // Loading composto - usado para determinar se esta carregando dados novos
  const loading = budgetsLoading || categoriesLoading;

  // Tem dados em cache disponiveis para renderizar?
  const hasData = budgets.length > 0 || categories.length > 0;

  // Estados para modal de orçamento
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState(TRANSACTION_TYPE_IDS.EXPENSE);
  const [budgetData, setBudgetData] = useState({
    categoryId: '',
    limitAmount: '',
    alertPercentage: 80,
  });

  // Estados para modal de nova categoria
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ emoji: '', name: '' });

  // Estados para modal de confirmação de exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Filtrar categorias por tipo selecionado
  const filteredCategories = categories.filter(cat => cat.transaction_type_id === selectedTransactionTypeId);

  // Categorias que ainda não têm orçamento no mês (do tipo selecionado)
  const availableCategories = filteredCategories.filter(
    cat => !budgets.some(b => b.category_id === cat.id)
  );

  // Todas as categorias de despesa (para verificar se precisa criar)
  const expenseCategories = categories.filter(cat => cat.transaction_type_id === 2);

  // Funções auxiliares
  const handleAuthFailure = async () => {
    await signOut();
    router.replace('/');
  };

  const isAuthError = (err) => {
    return err?.code === 'AUTH_REQUIRED' || err?.message?.includes('Usuário não autenticado');
  };

  // Função para traduzir mensagens de erro
  const getErrorMessage = (err) => {
    const errorMessage = err?.message || String(err);

    if (errorMessage.includes('category_budgets_unique_per_month') ||
        errorMessage.includes('duplicate key')) {
      return 'Já existe um orçamento para esta categoria neste mês.';
    }

    return 'Erro ao salvar orçamento. Tente novamente.';
  };

  if (budgetsError && isAuthError(budgetsError)) {
    handleAuthFailure();
    return null;
  }

  if (!authLoading && !user) {
    router.replace('/');
    return <PageSkeleton />;
  }

  // Navegação de mês
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Abrir modal para novo orçamento
  const handleOpenModal = () => {
    setEditingBudget(null);
    setSelectedTransactionTypeId(TRANSACTION_TYPE_IDS.EXPENSE);
    setBudgetData({
      categoryId: '',
      limitAmount: '',
      alertPercentage: 80,
    });
    setModalOpen(true);
  };

  // Abrir modal para editar orçamento
  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setBudgetData({
      categoryId: budget.category_id,
      limitAmount: budget.limit_amount,
      alertPercentage: budget.alert_percentage || 80,
    });
    setModalOpen(true);
  };

  // Lidar com mudança de categoria (interceptar criação de nova)
  const handleCategoryChange = (categoryId) => {
    if (categoryId === "__create_new__") {
      setNewCategoryData({ emoji: '', name: '' });
      setShowEmojiPicker(false);
      setNewCategoryModalOpen(true);
      return;
    }
    setBudgetData({ ...budgetData, categoryId });
  };

  // Criar nova categoria inline
  const handleCreateCategoryInline = async () => {
    if (!newCategoryData.name.trim()) {
      toast.warning('Por favor, informe o nome da categoria');
      return;
    }

    try {
      const color = selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INCOME ? '#22c55e'
        : selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INVESTMENT ? '#8b5cf6'
        : '#ef4444';

      const result = await createCategory({
        name: newCategoryData.name,
        emoji: newCategoryData.emoji || '📦',
        color,
        transactionTypeId: selectedTransactionTypeId,
      });

      if (result.error) throw result.error;

      // Selecionar a categoria recém-criada
      if (result.data) {
        setBudgetData({ ...budgetData, categoryId: String(result.data.id) });
      }

      toast.success(`Categoria "${newCategoryData.name}" criada!`);
      setNewCategoryModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('categories_unique_name_per_user') || errorMessage.includes('duplicate key')) {
        toast.error('Já existe uma categoria com esse nome.');
      } else {
        toast.error('Erro ao criar categoria. Tente novamente.');
      }
    }
  };

  // Criar ou editar orçamento
  const handleSubmitBudget = async () => {
    if (!budgetData.categoryId && !editingBudget) {
      toast.warning('Selecione uma categoria');
      return;
    }

    if (!budgetData.limitAmount || parseFloat(budgetData.limitAmount) <= 0) {
      toast.warning('Informe um valor limite válido');
      return;
    }

    try {
      if (editingBudget) {
        const result = await updateBudget(editingBudget.id, {
          limitAmount: parseFloat(budgetData.limitAmount),
          alertPercentage: parseInt(budgetData.alertPercentage) || 80,
        });

        if (result.error) {
          throw result.error;
        }

        toast.success('Orçamento atualizado com sucesso!');
      } else {
        const result = await createBudget({
          categoryId: parseInt(budgetData.categoryId),
          year: selectedYear,
          month: selectedMonth,
          limitAmount: parseFloat(budgetData.limitAmount),
          alertPercentage: parseInt(budgetData.alertPercentage) || 80,
        });

        if (result.error) {
          throw result.error;
        }

        toast.success('Orçamento criado com sucesso!');
      }

      setModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar orçamento:", err);
        toast.error(getErrorMessage(err));
      }
    }
  };

  // Abrir modal de confirmação para deletar
  const handleOpenDeleteConfirm = (budget) => {
    setBudgetToDelete(budget);
    setConfirmDeleteOpen(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;

    try {
      const result = await removeBudget(budgetToDelete.id);
      if (result.error) throw result.error;
      toast.success(`Orçamento de "${budgetToDelete.category_name}" removido!`);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao deletar orçamento:", err);
        toast.error("Erro ao deletar orçamento. Tente novamente.");
      }
    } finally {
      setBudgetToDelete(null);
    }
  };

  // Calcular percentual e status de cada orçamento
  const getBudgetStatus = (budget) => {
    const spent = parseFloat(budget.spent_amount || 0);
    const limit = parseFloat(budget.limit_amount || 0);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const alertThreshold = budget.alert_percentage || 80;

    let status = 'ok';
    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= alertThreshold) {
      status = 'warning';
    }

    return { spent, limit, percentage, status };
  };

  // Mostrar skeleton apenas se estiver carregando E nao ha dados em cache
  // Isso permite renderizacao progressiva quando ha dados em cache
  if ((authLoading || loading) && !hasData) {
    return <PageSkeleton />;
  }

  // Indicador de carregamento sutil quando revalidando dados em background
  const isRevalidating = loading && hasData;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Orcamento por Categoria"
        description="Defina limites mensais de gastos por categoria"
      />

      {/* Indicador sutil de revalidacao */}
      {isRevalidating && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Atualizando...</span>
          </div>
        </div>
      )}

      {/* Card principal */}
      <Card>
        <CardContent className="p-4">
          {/* Header com navegação de mês e botão adicionar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <PiggyBank className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Controle de Categoria</h2>
              </div>
            </div>
            <Button
              onClick={handleOpenModal}
              size="sm"
              className="bg-brand-500 hover:bg-brand-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </div>

          {/* Navegação de mês */}
          <div className="flex items-center justify-center gap-4 mb-6 py-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[160px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-600 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Lista de orçamentos ou estado vazio */}
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <PiggyBank className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Comece a controlar seus gastos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Defina limites mensais por categoria e receba alertas antes de estourar o orçamento.
              </p>
              <Button
                onClick={handleOpenModal}
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Orçamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo geral */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Orçamento Total</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(totals.totalLimit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gasto</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(totals.totalSpent)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Disponível</p>
                  <p className={`text-lg font-semibold ${totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.remaining)}
                  </p>
                </div>
              </div>

              {/* Lista de orçamentos */}
              <div className="space-y-3">
                {budgets.map((budget) => {
                  const { spent, limit, percentage, status } = getBudgetStatus(budget);

                  return (
                    <div
                      key={budget.id}
                      className="group p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{budget.category_emoji || '📦'}</span>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{budget.category_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(spent)} de {formatCurrency(limit)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'warning' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Atenção</span>
                            </div>
                          )}
                          {status === 'exceeded' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs">
                              <TrendingDown className="w-3 h-3" />
                              <span>Excedido</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(budget)}
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Editar orçamento"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(budget)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Deletar orçamento"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      <div className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            status === 'exceeded'
                              ? 'bg-red-500'
                              : status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(0)}% utilizado
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Restam {formatCurrency(Math.max(limit - spent, 0))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Novo/Editar Orçamento */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Tipo de Categoria - Toggle (apenas para novo) */}
              {!editingBudget && (
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransactionTypeId(TRANSACTION_TYPE_IDS.EXPENSE);
                        setBudgetData({ ...budgetData, categoryId: '' });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-all ${
                        selectedTransactionTypeId === TRANSACTION_TYPE_IDS.EXPENSE
                          ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransactionTypeId(TRANSACTION_TYPE_IDS.INCOME);
                        setBudgetData({ ...budgetData, categoryId: '' });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-all ${
                        selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INCOME
                          ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransactionTypeId(TRANSACTION_TYPE_IDS.INVESTMENT);
                        setBudgetData({ ...budgetData, categoryId: '' });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-all ${
                        selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INVESTMENT
                          ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <PiggyBank className="w-4 h-4" />
                      Patrimônio
                    </button>
                  </div>
                </div>
              )}

              {/* Categoria (apenas para novo) */}
              {!editingBudget && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    key={selectedTransactionTypeId}
                    value={budgetData.categoryId ? String(budgetData.categoryId) : ''}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__create_new__" className="text-brand-600 dark:text-brand-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Criar nova categoria
                        </div>
                      </SelectItem>
                      <SelectSeparator />
                      {availableCategories.length > 0 ? (
                        availableCategories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            <span className="flex items-center gap-2">
                              <span>{cat.emoji || '📦'}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                          Nenhuma categoria disponível
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Categoria (apenas exibição para edição) */}
              {editingBudget && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-xl">{editingBudget.category_emoji || '📦'}</span>
                    <span className="font-medium">{editingBudget.category_name}</span>
                  </div>
                </div>
              )}

              {/* Valor limite */}
              <div className="space-y-2">
                <Label htmlFor="limit-amount">Limite Mensal (R$)</Label>
                <Input
                  id="limit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetData.limitAmount}
                  onChange={(e) => setBudgetData({ ...budgetData, limitAmount: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              {/* Percentual de alerta */}
              <div className="space-y-2">
                <Label htmlFor="alert-percentage">Alertar quando atingir (%)</Label>
                <Select
                  value={String(budgetData.alertPercentage)}
                  onValueChange={(value) => setBudgetData({ ...budgetData, alertPercentage: parseInt(value) })}
                >
                  <SelectTrigger id="alert-percentage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80% (Recomendado)</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="100">100% (Sem alerta)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Você receberá um aviso quando atingir este percentual do limite.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 dark:bg-slate-800 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitBudget}
              className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600"
            >
              {editingBudget ? 'Salvar' : 'Criar Orçamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Categoria (inline) */}
      <Dialog open={newCategoryModalOpen} onOpenChange={setNewCategoryModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              Nova Categoria de {selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INCOME ? 'Receita'
                : selectedTransactionTypeId === TRANSACTION_TYPE_IDS.INVESTMENT ? 'Patrimônio'
                : 'Despesa'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Emoji Picker */}
              <div className="space-y-2">
                <Label>Emoji</Label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {newCategoryData.emoji ? (
                    <span className="text-2xl">{newCategoryData.emoji}</span>
                  ) : (
                    <span className="text-gray-400">Clique para escolher</span>
                  )}
                </button>

                {showEmojiPicker && (
                  <div className="mt-2">
                    <EmojiPicker
                      selectedEmoji={newCategoryData.emoji}
                      onEmojiSelect={(emoji) => {
                        setNewCategoryData({ ...newCategoryData, emoji });
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Nome da Categoria */}
              <div className="space-y-2">
                <Label htmlFor="new-category-name">Nome da Categoria</Label>
                <Input
                  id="new-category-name"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                  placeholder="Ex: Apostas, Academia, Investimento..."
                />
              </div>

              {/* Preview */}
              {newCategoryData.name && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    {newCategoryData.emoji && (
                      <span className="text-2xl">{newCategoryData.emoji}</span>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{newCategoryData.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 dark:bg-slate-800 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewCategoryModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategoryInline}
              className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600"
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir orçamento"
        description={
          budgetToDelete
            ? `Tem certeza que deseja excluir o orçamento de "${budgetToDelete.category_name}"?`
            : ''
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}