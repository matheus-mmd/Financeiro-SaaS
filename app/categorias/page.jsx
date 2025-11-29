"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "../../src/components/ui/badge";
import { Checkbox } from "../../src/components/ui/checkbox";
import {
  fetchData,
  createCategory,
  updateCategory,
  deleteCategory,
  addTransactionTypeToCategory,
  removeTransactionTypeFromCategory,
  createAssetType,
  updateAssetType,
  deleteAssetType,
} from "../../src/utils/mockApi";
import { Plus, Edit2, Trash2, Tag, PiggyBank, ChevronDown, ChevronRight } from "lucide-react";

/**
 * Página de Categorias - Gerenciamento de categorias e tipos de transação
 * Nova estrutura: Categorias (Salário, Moradia, etc.) podem ter múltiplos tipos (Receita, Despesa, Aporte)
 */
export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Estados para modal de categoria
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: "#6366f1",
    internal_name: "",
    transactionTypes: [],
  });

  // Estados para modal de asset type
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetFormData, setAssetFormData] = useState({
    name: "",
    color: "#10b981",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, transactionTypesRes, assetTypesRes] = await Promise.all([
        fetchData("/api/categories"),
        fetchData("/api/transactionTypes"),
        fetchData("/api/assetTypes"),
      ]);

      setCategories(categoriesRes.data);
      setTransactionTypes(transactionTypesRes.data);
      setAssetTypes(assetTypesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // ===== FUNÇÕES PARA CATEGORIAS =====

  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setCategoryFormData({
        name: category.name,
        color: category.color,
        internal_name: category.internal_name || "",
        transactionTypes: category.transactionTypes || [],
      });
    } else {
      setCategoryFormData({
        name: "",
        color: "#6366f1",
        internal_name: "",
        transactionTypes: [],
      });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData);
      } else {
        await createCategory(categoryFormData);
      }

      await loadData();
      setCategoryModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar categoria. Tente novamente.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      await deleteCategory(id);
      await loadData();
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      alert("Erro ao deletar categoria. Tente novamente.");
    }
  };

  const handleToggleTransactionType = (typeId) => {
    setCategoryFormData(prev => ({
      ...prev,
      transactionTypes: prev.transactionTypes.includes(typeId)
        ? prev.transactionTypes.filter(id => id !== typeId)
        : [...prev.transactionTypes, typeId]
    }));
  };

  const handleQuickToggleTransactionType = async (category, typeId) => {
    try {
      const isEnabled = category.transactionTypes.includes(typeId);

      if (isEnabled) {
        await removeTransactionTypeFromCategory(category.id, typeId);
      } else {
        await addTransactionTypeToCategory(category.id, typeId);
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar tipo de transação:", error);
      alert("Erro ao atualizar. Tente novamente.");
    }
  };

  // ===== FUNÇÕES PARA ASSET TYPES =====

  const handleOpenAssetModal = (asset = null) => {
    setEditingAsset(asset);
    if (asset) {
      setAssetFormData({
        name: asset.name,
        color: asset.color,
      });
    } else {
      setAssetFormData({
        name: "",
        color: "#10b981",
      });
    }
    setAssetModalOpen(true);
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAsset) {
        await updateAssetType(editingAsset.id, assetFormData);
      } else {
        await createAssetType(assetFormData);
      }

      await loadData();
      setAssetModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tipo de ativo:", error);
      alert("Erro ao salvar tipo de ativo. Tente novamente.");
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este tipo de ativo?")) return;

    try {
      await deleteAssetType(id);
      await loadData();
    } catch (error) {
      console.error("Erro ao deletar tipo de ativo:", error);
      alert("Erro ao deletar tipo de ativo. Tente novamente.");
    }
  };

  const getTransactionTypeById = (id) => {
    return transactionTypes.find(t => t.id === id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categorias e Tipos"
        description="Gerencie categorias de transações e configure quais tipos (Receita, Despesa, Aporte) são permitidos"
      />

      {/* Seção: Categorias de Transação */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Categorias de Transações</h2>
                <p className="text-sm text-gray-500">
                  Configure quais tipos de transação são permitidos para cada categoria ({categories.length})
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenCategoryModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Categoria Principal */}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{category.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {category.transactionTypes && category.transactionTypes.length > 0 ? (
                          category.transactionTypes.map(typeId => {
                            const type = getTransactionTypeById(typeId);
                            return type ? (
                              <Badge
                                key={typeId}
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: `${type.color}20`,
                                  color: type.color,
                                  borderColor: type.color,
                                }}
                              >
                                {type.name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-xs text-gray-500">Nenhum tipo configurado</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCategoryModal(category)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Tipos de Transação - Toggle rápido */}
                {expandedCategories.includes(category.id) && (
                  <div className="p-4 bg-white border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Tipos de transação permitidos:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {transactionTypes.map(type => {
                        const isEnabled = category.transactionTypes?.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            onClick={() => handleQuickToggleTransactionType(category, type.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                              isEnabled
                                ? 'border-current shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 opacity-50'
                            }`}
                            style={{
                              borderColor: isEnabled ? type.color : undefined,
                              backgroundColor: isEnabled ? `${type.color}10` : 'white',
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: isEnabled ? type.color : '#6b7280' }}
                            >
                              {type.name}
                            </span>
                            {isEnabled && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: type.color }}>
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção: Tipos de Ativos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PiggyBank className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tipos de Ativos</h2>
                <p className="text-sm text-gray-500">
                  Poupança, CDB, Ações, etc. ({assetTypes.length})
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenAssetModal()}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Tipo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="font-medium text-gray-900">{type.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssetModal(type)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(type.id)}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  setCategoryFormData({ ...categoryFormData, name: e.target.value })
                }
                placeholder="Ex: Salário, Moradia, Alimentação..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-internal-name">Nome Interno</Label>
              <Input
                id="category-internal-name"
                value={categoryFormData.internal_name}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, internal_name: e.target.value })
                }
                placeholder="Ex: salary, housing, food..."
              />
              <p className="text-xs text-gray-500">
                Usado internamente no código (sem espaços, minúsculas)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  id="category-color"
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, color: e.target.value })
                  }
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={categoryFormData.color}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, color: e.target.value })
                  }
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipos de Transação Permitidos</Label>
              <div className="space-y-2">
                {transactionTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={categoryFormData.transactionTypes.includes(type.id)}
                      onCheckedChange={() => handleToggleTransactionType(type.id)}
                    />
                    <label
                      htmlFor={`type-${type.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm font-medium">{type.name}</span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selecione quais tipos de transação podem usar esta categoria
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingCategory ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Asset Type */}
      <Dialog open={assetModalOpen} onOpenChange={setAssetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Editar Tipo de Ativo" : "Criar Novo Tipo de Ativo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Nome</Label>
              <Input
                id="asset-name"
                value={assetFormData.name}
                onChange={(e) =>
                  setAssetFormData({ ...assetFormData, name: e.target.value })
                }
                placeholder="Ex: Poupança, CDB, Ações..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-color">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  id="asset-color"
                  type="color"
                  value={assetFormData.color}
                  onChange={(e) =>
                    setAssetFormData({ ...assetFormData, color: e.target.value })
                  }
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={assetFormData.color}
                  onChange={(e) =>
                    setAssetFormData({ ...assetFormData, color: e.target.value })
                  }
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingAsset ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

