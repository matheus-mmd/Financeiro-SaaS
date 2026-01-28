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
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { useBudgets } from "../../src/lib/supabase/hooks/useBudgets";
import { useCategories } from "../../src/lib/supabase/hooks/useCategories";
import { useToast } from "../../src/components/Toast";
import ConfirmDialog from "../../src/components/ConfirmDialog";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "../../src/utils";

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
  } = useCategories();

  // Loading composto - usado para determinar se esta carregando dados novos
  const loading = budgetsLoading || categoriesLoading;

  // Tem dados em cache disponiveis para renderizar?
  const hasData = budgets.length > 0 || categories.length > 0;

  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetData, setBudgetData] = useState({
    categoryId: '',
    limitAmount: '',
    alertPercentage: 80,
  });

  // Estados para modal de confirmação de exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Filtrar apenas categorias de despesa (transaction_type_id = 2)
  const expenseCategories = categories.filter(cat => cat.transaction_type_id === 2);

  // Categorias que ainda não têm orçamento no mês
  const availableCategories = expenseCategories.filter(
    cat => !budgets.some(b => b.category_id === cat.id)
  );

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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Atualizando...</span>
          </div>
        </div>
      )}

      {/* Card principal */}
      <Card>
        <CardContent className="p-4">
          {/* Header com navegação de mês e botão adicionar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PiggyBank className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Controle de Categoria</h2>
              </div>
            </div>
            <Button
              onClick={handleOpenModal}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
              disabled={availableCategories.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </div>

          {/* Navegação de mês */}
          <div className="flex items-center justify-center gap-4 mb-6 py-3 bg-gray-50 rounded-lg">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[160px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Lista de orçamentos ou estado vazio */}
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <PiggyBank className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Comece a controlar seus gastos
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Defina limites mensais por categoria e receba alertas antes de estourar o orçamento.
              </p>
              <Button
                onClick={handleOpenModal}
                className="bg-green-500 hover:bg-green-600"
                disabled={availableCategories.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Orçamento
              </Button>
              {availableCategories.length === 0 && expenseCategories.length === 0 && (
                <p className="text-sm text-gray-400 mt-4">
                  Você precisa criar categorias de despesa primeiro.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo geral */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Orçamento Total</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totals.totalLimit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Gasto</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(totals.totalSpent)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Disponível</p>
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
                      className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{budget.category_emoji || '📦'}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{budget.category_name}</h3>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(spent)} de {formatCurrency(limit)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'warning' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Atenção</span>
                            </div>
                          )}
                          {status === 'exceeded' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              <TrendingDown className="w-3 h-3" />
                              <span>Excedido</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(budget)}
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar orçamento"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(budget)}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              title="Deletar orçamento"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(0)}% utilizado
                        </span>
                        <span className="text-xs text-gray-500">
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
              {/* Categoria (apenas para novo) */}
              {!editingBudget && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={budgetData.categoryId ? String(budgetData.categoryId) : ''}
                    onValueChange={(value) => setBudgetData({ ...budgetData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          <span className="flex items-center gap-2">
                            <span>{cat.emoji || '📦'}</span>
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Categoria (apenas exibição para edição) */}
              {editingBudget && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
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
                <p className="text-xs text-gray-500">
                  Você receberá um aviso quando atingir este percentual do limite.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
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
              className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600"
            >
              {editingBudget ? 'Salvar' : 'Criar Orçamento'}
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