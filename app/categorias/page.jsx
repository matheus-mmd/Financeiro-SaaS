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
import { useCategories } from "../../src/lib/supabase/hooks/useCategories";
import { useToast } from "../../src/components/Toast";
import {
  Plus,
  Trash2,
  Pencil,
  TrendingDown,
  TrendingUp,
  Layers,
} from "lucide-react";
import EmojiPicker from "../../src/components/EmojiPicker";
import ConfirmDialog from "../../src/components/ConfirmDialog";

// Categorias padrão de Despesas (apenas referência visual)
const defaultExpenseCategories = [
  { emoji: '🏠', name: 'Moradia' },
  { emoji: '🍔', name: 'Alimentação' },
  { emoji: '🚗', name: 'Transporte' },
  { emoji: '💊', name: 'Saúde' },
  { emoji: '📚', name: 'Educação' },
  { emoji: '🎮', name: 'Lazer' },
  { emoji: '👗', name: 'Vestuário' },
  { emoji: '🛒', name: 'Compras' },
  { emoji: '🔧', name: 'Serviços' },
  { emoji: '📱', name: 'Assinaturas' },
  { emoji: '📋', name: 'Impostos' },
  { emoji: '🤝', name: 'Doações e Ofertas' },
  { emoji: '🐕', name: 'Pet' },
  { emoji: '✈️', name: 'Viagens' },
  { emoji: '💄', name: 'Beleza e Cuidados' },
  { emoji: '📺', name: 'Streaming/Apps' },
  { emoji: '📦', name: 'Outros' },
];

// Categorias padrão de Receitas (apenas referência visual)
const defaultIncomeCategories = [
  { emoji: '💰', name: 'Salário Líquido' },
  { emoji: '🍽️', name: 'Vale Refeição' },
  { emoji: '🛒', name: 'Vale Alimentação' },
  { emoji: '🏆', name: 'Bônus/PLR' },
  { emoji: '🏖️', name: 'Férias' },
  { emoji: '💵', name: '13º Salário' },
  { emoji: '📦', name: 'Outros' },
  { emoji: '🛠️', name: 'Serviços Prestados' },
  { emoji: '💼', name: 'Projeto/Freela' },
  { emoji: '🎯', name: 'Consultoria' },
  { emoji: '📱', name: 'Venda de Produto' },
  { emoji: '💎', name: 'Comissão' },
  { emoji: '🏠', name: 'Aluguel/Locação' },
  { emoji: '📈', name: 'Dividendos/Lucros' },
];

/**
 * Página de Categorias - Gerenciamento de categorias
 * Layout padronizado com o resto da aplicação
 */
export default function CategoriasPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const toast = useToast();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useCategories();

  const loading = (categoriesLoading && categories.length === 0) || authLoading;

  // Estado da tab ativa: 'despesas' ou 'receitas'
  const [activeTab, setActiveTab] = useState('despesas');

  // Estados para modal de categoria
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [categoryData, setCategoryData] = useState({
    emoji: '',
    name: '',
  });

  // Estados para modal de confirmação de exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Funções auxiliares
  const handleAuthFailure = async () => {
    await signOut();
    router.replace('/');
  };

  const isAuthError = (err) => {
    return err?.code === 'AUTH_REQUIRED' || err?.message?.includes('Usuário não autenticado');
  };

  // Função para traduzir mensagens de erro técnicas para mensagens amigáveis
  const getErrorMessage = (err) => {
    const errorMessage = err?.message || String(err);

    // Erro de nome duplicado
    if (errorMessage.includes('categories_unique_name_per_user') ||
        errorMessage.includes('duplicate key')) {
      return 'Já existe uma categoria com esse nome. Escolha um nome diferente.';
    }

    // Erro genérico
    return 'Erro ao salvar categoria. Tente novamente.';
  };

  if (categoriesError && isAuthError(categoriesError)) {
    handleAuthFailure();
    return null;
  }

  if (!authLoading && !user) {
    router.replace('/');
    return <PageSkeleton />;
  }

  // Filtrar categorias por tipo
  const userExpenseCategories = categories.filter(cat => cat.transaction_type_id === 2);
  const userIncomeCategories = categories.filter(cat => cat.transaction_type_id === 1);

  // Abrir modal para nova categoria
  const handleOpenModal = () => {
    setEditingCategory(null);
    setCategoryData({ emoji: '', name: '' });
    setShowEmojiPicker(false);
    setModalOpen(true);
  };

  // Abrir modal para editar categoria
  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setCategoryData({
      emoji: category.emoji || '📦',
      name: category.name,
    });
    setShowEmojiPicker(false);
    setModalOpen(true);
  };

  // Criar ou editar categoria
  const handleSubmitCategory = async () => {
    if (!categoryData.name.trim()) {
      toast.warning('Por favor, informe o nome da categoria');
      return;
    }

    try {
      if (editingCategory) {
        // Editar categoria existente
        const result = await updateCategory(editingCategory.id, {
          name: categoryData.name,
          emoji: categoryData.emoji || '📦',
        });

        if (result.error) {
          throw result.error;
        }

        toast.success(`Categoria "${categoryData.name}" atualizada com sucesso!`);
      } else {
        // Criar nova categoria
        const transactionTypeId = activeTab === 'despesas' ? 2 : 1;

        const result = await createCategory({
          name: categoryData.name,
          emoji: categoryData.emoji || '📦',
          color: activeTab === 'despesas' ? '#ef4444' : '#22c55e',
          transactionTypeId,
        });

        if (result.error) {
          throw result.error;
        }

        toast.success(`Categoria "${categoryData.name}" criada com sucesso!`);
      }

      setModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar categoria:", err);
        toast.error(getErrorMessage(err));
      }
    }
  };

  // Abrir modal de confirmação para deletar
  const handleOpenDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setConfirmDeleteOpen(true);
  };

  // Confirmar exclusão da categoria
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const result = await removeCategory(categoryToDelete.id);
      if (result.error) throw result.error;
      toast.success(`Categoria "${categoryToDelete.name}" removida com sucesso!`);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao deletar categoria:", err);
        toast.error("Erro ao deletar categoria. Tente novamente.");
      }
    } finally {
      setCategoryToDelete(null);
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  const currentUserCategories = activeTab === 'despesas' ? userExpenseCategories : userIncomeCategories;
  const currentDefaultCategories = activeTab === 'despesas' ? defaultExpenseCategories : defaultIncomeCategories;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Categorias"
        description="Gerencie suas categorias personalizadas"
      />

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('despesas')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'despesas'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Despesas
            </button>
            <button
              onClick={() => setActiveTab('receitas')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'receitas'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Receitas
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categorias Personalizadas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${activeTab === 'despesas' ? 'bg-red-100' : 'bg-green-100'}`}>
              {activeTab === 'despesas' ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Categorias Personalizadas
              </h2>
              <p className="text-sm text-gray-500">
                Suas categorias de {activeTab === 'despesas' ? 'despesa' : 'receita'} criadas ({currentUserCategories.length})
              </p>
            </div>
            {/* Botão sempre visível */}
            <Button
              onClick={handleOpenModal}
              size="sm"
              className={activeTab === 'despesas' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </Button>
          </div>

          {currentUserCategories.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">Nenhuma categoria personalizada</p>
              <p className="text-sm text-gray-400">Clique em "Nova" para criar sua primeira categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUserCategories.map((category) => (
                <div
                  key={category.id}
                  className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji || '📦'}</span>
                    <span className="flex-1 font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar categoria"
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(category)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Deletar categoria"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias Padrão (Referência) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Layers className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Categorias Padrão</h2>
              <p className="text-sm text-gray-500">Sugestões de categorias para você criar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDefaultCategories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg"
              >
                <span className="text-2xl">{category.emoji}</span>
                <span className="flex-1 font-medium text-gray-700">{category.name}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">
                  padrão
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova/Editar Categoria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingCategory
                ? `Editar Categoria`
                : `Nova Categoria de ${activeTab === 'despesas' ? 'Despesa' : 'Receita'}`
              }
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
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {categoryData.emoji ? (
                    <span className="text-2xl">{categoryData.emoji}</span>
                  ) : (
                    <span className="text-gray-400">🎯 Clique para escolher</span>
                  )}
                </button>

                {showEmojiPicker && (
                  <div className="mt-2">
                    <EmojiPicker
                      selectedEmoji={categoryData.emoji}
                      onEmojiSelect={(emoji) => {
                        setCategoryData({ ...categoryData, emoji });
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  placeholder="Ex: Apostas, Academia, Investimento..."
                />
              </div>

              {/* Preview */}
              {categoryData.name && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryData.emoji || '📦'}</span>
                    <span className="font-medium text-gray-900">{categoryData.name}</span>
                  </div>
                </div>
              )}
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
              onClick={handleSubmitCategory}
              className="flex-1 sm:flex-none"
            >
              {editingCategory ? 'Salvar' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir categoria"
        description={
          categoryToDelete
            ? `Tem certeza que deseja excluir a categoria "${categoryToDelete.name}"? Esta ação não pode ser desfeita.`
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