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
import {
  fetchData,
  createCategory,
  updateCategory,
  deleteCategory,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
  createAssetType,
  updateAssetType,
  deleteAssetType,
  createTransactionCategory,
  updateTransactionCategory,
  deleteTransactionCategory,
} from "../../src/utils/mockApi";
import { Plus, Edit2, Trash2, Tag, CreditCard, PiggyBank, ChevronDown, ChevronRight } from "lucide-react";

/**
 * Página de Categorias - Gerenciamento hierárquico de categorias e tipos
 * Estrutura: Categorias (Receitas, Despesas, Aportes) > Subcategorias/Tipos
 */
export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([1, 2, 3]); // Todas expandidas por padrão

  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(""); // "category", "type", "asset", "transaction-category"
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // Para adicionar tipos
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366f1",
    internal_name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, transactionCategoriesRes, assetTypesRes] = await Promise.all([
        fetchData("/api/categories"),
        fetchData("/api/transactionCategories"),
        fetchData("/api/assetTypes"),
      ]);

      setCategories(categoriesRes.data);
      setTransactionCategories(transactionCategoriesRes.data);
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

  const handleOpenModal = (mode, item = null, category = null) => {
    setModalMode(mode);
    setEditingItem(item);
    setSelectedCategory(category);
    if (item) {
      setFormData({
        name: item.name,
        color: item.color,
        internal_name: item.internal_name || "",
      });
    } else {
      setFormData({
        name: "",
        color: "#6366f1",
        internal_name: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "category") {
        if (editingItem) {
          await updateCategory(editingItem.id, formData);
        } else {
          await createCategory(formData);
        }
      } else if (modalMode === "type") {
        // Criar/editar tipo dentro de uma categoria de transação
        if (editingItem) {
          await updateTransactionType(selectedCategory.id, editingItem.id, formData);
        } else {
          await createTransactionType(selectedCategory.id, formData);
        }
      } else if (modalMode === "transaction-category") {
        if (editingItem) {
          await updateTransactionCategory(editingItem.id, formData);
        } else {
          await createTransactionCategory(formData);
        }
      } else if (modalMode === "asset") {
        if (editingItem) {
          await updateAssetType(editingItem.id, formData);
        } else {
          await createAssetType(formData);
        }
      }

      await loadData();
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const handleDelete = async (mode, id, categoryId = null) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      if (mode === "category") {
        await deleteCategory(id);
      } else if (mode === "type") {
        await deleteTransactionType(categoryId, id);
      } else if (mode === "transaction-category") {
        await deleteTransactionCategory(id);
      } else if (mode === "asset") {
        await deleteAssetType(id);
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar. Tente novamente.");
    }
  };

  const getModalTitle = () => {
    const action = editingItem ? "Editar" : "Criar";
    const itemTypeMap = {
      category: "Categoria de Despesa",
      type: "Subcategoria",
      "transaction-category": "Categoria de Transação",
      asset: "Tipo de Ativo",
    };
    return `${action} ${itemTypeMap[modalMode]}`;
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
        description="Gerencie todas as categorias e subcategorias do sistema"
      />

      {/* Seção: Categorias de Transação (hierárquicas) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Categorias de Transações</h2>
                <p className="text-sm text-gray-500">
                  Receitas, Despesas, Aportes e suas subcategorias ({transactionCategories.length})
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenModal("transaction-category")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="space-y-4">
            {transactionCategories.map((category) => (
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
                      <span className="ml-2 text-xs text-gray-500">
                        ({category.transactionTypes?.length || 0} subcategorias)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal("type", null, category)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar Subcategoria
                    </Button>
                    <button
                      onClick={() => handleOpenModal("transaction-category", category)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete("transaction-category", category.id)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Subcategorias/Tipos */}
                {expandedCategories.includes(category.id) && (
                  <div className="p-4 bg-white">
                    {category.transactionTypes && category.transactionTypes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.transactionTypes.map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                              <span className="text-sm font-medium text-gray-900">{type.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenModal("type", type, category)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete("type", type.id, category.id)}
                                className="p-1 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma subcategoria adicionada. Clique em "Adicionar Subcategoria" acima.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção: Categorias de Despesas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Categorias de Despesas</h2>
                <p className="text-sm text-gray-500">
                  Usadas em Despesas ({categories.length})
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenModal("category")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal("category", category)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete("category", category.id)}
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
              onClick={() => handleOpenModal("asset")}
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
                    onClick={() => handleOpenModal("asset", type)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete("asset", type.id)}
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

      {/* Modal de Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Alimentação, Receitas, Poupança..."
                required
              />
            </div>

            {(modalMode === "transaction-category" || modalMode === "type") && (
              <div className="space-y-2">
                <Label htmlFor="internal_name">Nome Interno</Label>
                <Input
                  id="internal_name"
                  value={formData.internal_name}
                  onChange={(e) =>
                    setFormData({ ...formData, internal_name: e.target.value })
                  }
                  placeholder="Ex: income, expense, food..."
                  required={modalMode === "transaction-category"}
                />
                <p className="text-xs text-gray-500">
                  Usado internamente no código (sem espaços, minúsculas)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
