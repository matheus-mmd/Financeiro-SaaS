"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/contexts/AuthContext";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "../../src/components/ui/dialog";
import { useCategories } from "../../src/lib/supabase/hooks/useCategories";
import {
  ArrowLeft,
  Plus,
  TrendingDown,
  TrendingUp,
  Layers,
} from "lucide-react";
import EmojiPicker from "../../src/components/EmojiPicker";
import PageSkeleton from "../../src/components/PageSkeleton";

// Categorias padrão de Despesas
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

// Categorias padrão de Receitas
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
 * Design atualizado com tabs e categorias padrão
 */
export default function CategoriasPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    create: createCategory,
    remove: removeCategory,
  } = useCategories();

  const loading = (categoriesLoading && categories.length === 0) || authLoading;

  // Estado da tab ativa: 'despesas' ou 'receitas'
  const [activeTab, setActiveTab] = useState('despesas');

  // Estados para modal de categoria
  const [modalOpen, setModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    emoji: '',
    name: '',
  });

  // Funções auxiliares
  const handleAuthFailure = async () => {
    await signOut();
    router.replace('/');
  };

  const isAuthError = (err) => {
    return err?.code === 'AUTH_REQUIRED' || err?.message?.includes('Usuário não autenticado');
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
    setNewCategoryData({ emoji: '', name: '' });
    setShowEmojiPicker(false);
    setModalOpen(true);
  };

  // Criar categoria
  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      alert('Por favor, informe o nome da categoria');
      return;
    }

    try {
      const transactionTypeId = activeTab === 'despesas' ? 2 : 1;

      const result = await createCategory({
        name: newCategoryData.name,
        emoji: newCategoryData.emoji || '📦',
        color: activeTab === 'despesas' ? '#ef4444' : '#22c55e',
        transactionTypeId,
      });

      if (result.error) {
        throw result.error;
      }

      setModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao criar categoria:", err);
        alert("Erro ao criar categoria: " + (err.message || err));
      }
    }
  };

  // Deletar categoria
  const handleDeleteCategory = async (id) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      const result = await removeCategory(id);
      if (result.error) throw result.error;
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao deletar categoria:", err);
        alert("Erro ao deletar categoria. Tente novamente.");
      }
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  const currentUserCategories = activeTab === 'despesas' ? userExpenseCategories : userIncomeCategories;
  const currentDefaultCategories = activeTab === 'despesas' ? defaultExpenseCategories : defaultIncomeCategories;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <Layers className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Categorias</h1>
                <p className="text-sm text-gray-500">Gerencie suas categorias personalizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Categorias Personalizadas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Categorias Personalizadas</h2>
                <p className="text-sm text-gray-500">
                  Suas categorias de {activeTab === 'despesas' ? 'despesa' : 'receita'} criadas
                </p>
              </div>
              <Button
                onClick={handleOpenModal}
                size="sm"
                className="bg-brand-600 hover:bg-brand-700"
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
                <p className="text-sm text-gray-400">Clique em "Nova" para criar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentUserCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji || '📦'}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias Padrão */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">Categorias Padrão</h2>
              <p className="text-sm text-gray-500">Categorias pré-definidas do sistema</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentDefaultCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                >
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    padrão
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Nova Categoria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-0">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Nova Categoria de {activeTab === 'despesas' ? 'Despesa' : 'Receita'}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Crie uma categoria personalizada para organizar suas finanças
            </p>

            {/* Emoji Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {newCategoryData.emoji ? (
                  <span className="text-2xl">{newCategoryData.emoji}</span>
                ) : (
                  <span className="text-gray-400">🎯 Clique para escolher</span>
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

            {/* Nome */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Categoria
              </label>
              <Input
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                placeholder="Ex: Apostas, Academia, Investimento..."
              />
            </div>

            {/* Preview */}
            {newCategoryData.name && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{newCategoryData.emoji || '📦'}</span>
                  <span className="font-medium text-gray-900">{newCategoryData.name}</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCategory}
                className="flex-1 bg-brand-600 hover:bg-brand-700"
              >
                Criar Categoria
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}