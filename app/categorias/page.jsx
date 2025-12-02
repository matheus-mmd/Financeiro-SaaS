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
} from "../../src/utils/mockApi";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

/**
 * Página de Categorias - Gerenciamento de categorias
 * Categorias organizadas por tipo: Receitas, Despesas e Patrimônio/Ativos
 * Visualização simples e objetiva com ações diretas
 */
export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para modal de categoria
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    color: "#6366f1",
    internal_name: "",
    transactionTypes: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, transactionTypesRes] = await Promise.all([
        fetchData("/api/categories"),
        fetchData("/api/transactionTypes"),
      ]);

      setCategories(categoriesRes.data);
      setTransactionTypes(transactionTypesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Separar categorias por tipo
  const categorizeByType = () => {
    const incomeCategories = categories.filter(cat =>
      cat.transactionTypes && cat.transactionTypes.includes(1) && !cat.transactionTypes.includes(2) && !cat.transactionTypes.includes(3)
    );

    const expenseCategories = categories.filter(cat =>
      cat.transactionTypes && cat.transactionTypes.includes(2) && !cat.transactionTypes.includes(1) && !cat.transactionTypes.includes(3)
    );

    const assetCategories = categories.filter(cat =>
      cat.transactionTypes && cat.transactionTypes.includes(3) && !cat.transactionTypes.includes(1) && !cat.transactionTypes.includes(2)
    );

    return {
      income: incomeCategories,
      expense: expenseCategories,
      asset: assetCategories,
    };
  };

  const { income, expense, asset } = categorizeByType();

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

  const getTransactionTypeById = (id) => {
    return transactionTypes.find(t => t.id === id);
  };

  // Função para renderizar uma seção de categorias
  const renderCategorySection = (sectionCategories, title, description, icon, iconColor, defaultType = null) => {
    if (sectionCategories.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${iconColor} rounded-lg`}>
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">
                  {description} ({sectionCategories.length})
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                handleOpenCategoryModal();
                if (defaultType) {
                  setCategoryFormData(prev => ({
                    ...prev,
                    transactionTypes: [defaultType]
                  }));
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="space-y-3">
            {sectionCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenCategoryModal(category)}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Editar categoria"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    title="Deletar categoria"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
    </div>
  );
}