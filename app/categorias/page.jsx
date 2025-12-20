"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
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
import { useReferenceData } from "../../src/lib/supabase/hooks/useReferenceData";
import {
  Plus,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { getIconComponent } from "../../src/components/IconPicker";
import ColorPicker from "../../src/components/ColorPicker";
import IconPickerModal from "../../src/components/IconPickerModal";
import FABMenu from "../../src/components/FABMenu";
import PageSkeleton from "../../src/components/PageSkeleton";

/**
 * Página de Categorias - Gerenciamento de categorias
 * Categorias organizadas por tipo: Receitas, Despesas e Patrimônio/Ativos
 * Visualização simples e objetiva com ações diretas
 */
export default function CategoriasPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  // Hooks com cache para carregamento instantâneo
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useCategories();

  const {
    data: referenceData,
    loading: referenceLoading,
    error: referenceError,
  } = useReferenceData();

  const { transactionTypes, icons } = referenceData;
  const loading = categoriesLoading || referenceLoading;
  const error = categoriesError || referenceError;

  // Estados para modal de categoria
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [iconPickerModalOpen, setIconPickerModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: "#6366f1",
    icon: "Tag",
    transaction_type_id: null,
  });

  // Funções auxiliares para erros de autenticação
  const handleAuthFailure = async () => {
    await signOut();
    router.replace('/login');
  };

  const isAuthError = (err) => {
    return err?.code === 'AUTH_REQUIRED' || err?.message?.includes('Usuário não autenticado');
  };

  // Verificar erro de autenticação
  if (error && isAuthError(error)) {
    handleAuthFailure();
    return null;
  }

  // Separar categorias por tipo
  const categorizeByType = () => {
    const incomeCategories = categories.filter(
      (cat) => cat.transaction_type_id === 1
    );
    const expenseCategories = categories.filter(
      (cat) => cat.transaction_type_id === 2
    );
    const assetCategories = categories.filter(
      (cat) => cat.transaction_type_id === 3
    );

    return {
      income: incomeCategories,
      expense: expenseCategories,
      asset: assetCategories,
    };
  };

  const { income, expense, asset } = categorizeByType();

  // ===== FUNÇÕES PARA CATEGORIAS =====

  const handleOpenCategoryModal = (category = null, defaultType = null) => {
    setEditingCategory(category);
    if (category) {
      setCategoryFormData({
        name: category.name,
        color: category.color,
        icon: category.icon_name || "Tag",
        transaction_type_id: category.transaction_type_id,
      });
    } else {
      setCategoryFormData({
        name: "",
        color: "#6366f1",
        icon: "Tag",
        transaction_type_id: defaultType,
      });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      // Verificar se ícones foram carregados
      if (!icons || icons.length === 0) {
        throw new Error('Ícones não foram carregados. Por favor, recarregue a página.');
      }

      // Buscar o ID do ícone pelo nome
      const icon = icons.find(i => i.name === categoryFormData.icon);

      if (!icon) {
        throw new Error(`Ícone "${categoryFormData.icon}" não encontrado.`);
      }

      const categoryData = {
        name: categoryFormData.name,
        color: categoryFormData.color,
        iconId: icon.id,
        transactionTypeId: categoryFormData.transaction_type_id,
      };

      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, categoryData);
      } else {
        result = await createCategory(categoryData);
      }

      if (result.error) {
        throw result.error;
      }

      setCategoryModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar categoria:", err);
        alert("Erro ao salvar categoria: " + (err.message || err));
      }
    }
  };

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

  const getTransactionTypeById = (id) => {
    return transactionTypes.find((t) => t.id === id);
  };

  // Função para renderizar uma seção de categorias
  const renderCategorySection = (
    sectionCategories,
    title,
    description,
    icon,
    iconColor,
    defaultType = null
  ) => {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${iconColor} rounded-lg`}>{icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                {description} ({sectionCategories.length})
              </p>
            </div>
          </div>

          {sectionCategories.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">Nenhuma categoria cadastrada</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCategoryModal(null, defaultType)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Categoria
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionCategories.map((category) => {
                const IconComponent = getIconComponent(category.icon_name || "Tag");

                return (
                  <div
                    key={category.id}
                    onClick={() => handleOpenCategoryModal(category)}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 flex-1 truncate">
                        {category.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                        title="Deletar categoria"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!authLoading && !user) {
    return null;
  }

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Categorias"
        description="Gerencie categorias organizadas por tipo: Receitas, Despesas e Patrimônio/Ativos"
      />

      {/* Seção: Categorias de Receitas */}
      {renderCategorySection(
        income,
        "Categorias de Receitas",
        "Gerencie categorias para suas receitas e ganhos",
        <Tag className="w-5 h-5 text-green-600" />,
        "bg-green-100",
        1 // ID do tipo "Receita"
      )}

      {/* Seção: Categorias de Despesas */}
      {renderCategorySection(
        expense,
        "Categorias de Despesas",
        "Gerencie categorias para suas despesas e gastos",
        <Tag className="w-5 h-5 text-red-600" />,
        "bg-red-100",
        2 // ID do tipo "Despesa"
      )}

      {/* Seção: Categorias de Patrimônio e Ativos */}
      {renderCategorySection(
        asset,
        "Categorias de Patrimônio e Ativos",
        "Gerencie categorias para seus aportes, investimentos e ativos",
        <Tag className="w-5 h-5 text-blue-600" />,
        "bg-blue-100",
        3 // ID do tipo "Aporte"
      )}

      {/* Modal de Categoria */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Criar Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: Salário, Moradia, Alimentação..."
                required
              />
            </div>

            {/* Seletor de Ícone */}
            <div className="space-y-2">
              <Label>Ícone da Categoria</Label>
              <button
                type="button"
                onClick={() => setIconPickerModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: categoryFormData.color + "20" }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(
                      categoryFormData.icon
                    );
                    return (
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: categoryFormData.color }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-600">
                  Clique para escolher o ícone
                </span>
              </button>
            </div>

            {/* Seletor de Cor */}
            <ColorPicker
              selectedColor={categoryFormData.color}
              onColorSelect={(color) =>
                setCategoryFormData({ ...categoryFormData, color })
              }
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || icons.length === 0}>
                {editingCategory ? "Salvar" : "Criar"}
              </Button>
              {icons.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Carregando ícones...
                </p>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Ícone */}
      <IconPickerModal
        open={iconPickerModalOpen}
        onOpenChange={setIconPickerModalOpen}
        selectedIcon={categoryFormData.icon}
        onIconSelect={(iconName) =>
          setCategoryFormData({ ...categoryFormData, icon: iconName })
        }
        color={categoryFormData.color}
      />

      {/* Floating Action Menu */}
      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Categorias"
        actions={[
          {
            icon: <TrendingUp className="w-5 h-5" />,
            label: "Nova Categoria de Receita",
            onClick: () => handleOpenCategoryModal(null, 1),
          },
          {
            icon: <TrendingDown className="w-5 h-5" />,
            label: "Nova Categoria de Despesa",
            onClick: () => handleOpenCategoryModal(null, 2),
          },
          {
            icon: <Wallet className="w-5 h-5" />,
            label: "Nova Categoria de Patrimônio",
            onClick: () => handleOpenCategoryModal(null, 3),
          },
        ]}
      />
    </div>
  );
}