"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
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
import {
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../src/lib/supabase/api/assets";
import { useAssets } from "../../src/lib/supabase/hooks/useAssets";
import { useCategories } from "../../src/lib/supabase/hooks/useCategories";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import { TRANSACTION_TYPE_IDS, DEFAULT_CATEGORY_COLOR } from "../../src/constants";
import { DollarSign, Percent, Plus, Trash2, Wallet, Copy } from "lucide-react";

/**
 * Página Patrimônio e Ativos - Gerenciamento de patrimônio e ativos
 * Permite visualizar, filtrar, adicionar e gerenciar patrimônio e ativos
 */
export default function PatrimonioAtivos() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    assets: rawAssets,
    loading: assetsLoading,
    error: assetsError,
    refresh: refreshAssets,
    remove: removeAsset,
  } = useAssets();
  const {
    categories: allCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const isLoading = authLoading || assetsLoading || categoriesLoading;
  const isUnmounted = useRef(false);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [columnSelectorElement, setColumnSelectorElement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Poupança",
    value: "",
    yield: "",
    date: new Date(),
    description: "",
    purchase_date: null,
    purchase_value: "",
  });

  useEffect(() => () => {
    isUnmounted.current = true;
  }, []);

  const handleAuthFailure = useCallback(async () => {
    await signOut();
    router.replace('/');
  }, [router, signOut]);

  const isAuthError = useCallback((error) => {
    return error?.code === 'AUTH_REQUIRED' || error?.message?.includes('Usuário não autenticado');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAssets([]);
      setFilteredAssets([]);
      setCategories([]);
      router.replace('/');
    }
  }, [authLoading, user, router]);

  const investmentCategories = useMemo(
    () =>
      (allCategories || []).filter(
        (category) => category.transaction_type_id === TRANSACTION_TYPE_IDS.INVESTMENT
      ),
    [allCategories]
  );

  const normalizedAssets = useMemo(
    () =>
      (rawAssets || []).map((asset) => ({
        ...asset,
        date: asset.valuation_date || asset.date || new Date().toISOString().split("T")[0],
        yield: asset.yield_rate ?? asset.yield ?? 0,
        type: asset.category_name || asset.type || "",
        type_color: asset.category_color || asset.type_color || DEFAULT_CATEGORY_COLOR,
        type_icon: asset.category_icon || asset.icon_name || "Tag",
      })),
    [rawAssets]
  );

  useEffect(() => {
    if (!authLoading && user && !isUnmounted.current) {
      setAssets(normalizedAssets);
      setCategories(investmentCategories);
    }
  }, [authLoading, user, normalizedAssets, investmentCategories]);

  useEffect(() => {
    const authError = assetsError || categoriesError;
    if (authError?.code === 'AUTH_REQUIRED') {
      handleAuthFailure();
    }
  }, [assetsError, categoriesError, handleAuthFailure]);

  useEffect(() => {
    let filtered = assets;

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((a) => isDateInRange(a.date, filterMonth));
    }

    setFilteredAssets(filtered);
  }, [filterType, filterMonth, assets]);

  const totalAssets = filteredAssets.reduce(
    (sum, asset) => sum + asset.value,
    0
  );

  const handleAddAsset = () => {
    setEditingAsset(null);
    setFormData({
      name: "",
      type: "Poupança",
      value: "",
      yield: "",
      date: new Date(),
      description: "",
      purchase_date: null,
      purchase_value: "",
    });
    setModalOpen(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      yield: asset.yield ? (asset.yield * 100).toString() : "",
      date: parseDateString(asset.date) || new Date(),
      description: asset.description || "",
      purchase_date: asset.purchase_date ? parseDateString(asset.purchase_date) : null,
      purchase_value: asset.purchase_value ? asset.purchase_value.toString() : "",
    });
    setModalOpen(true);
  };

  // Duplicar ativo
  const handleDuplicateAsset = (asset) => {
    setEditingAsset(null);
    setFormData({
      name: asset.name + " (Cópia)",
      type: asset.type,
      value: asset.value.toString(),
      yield: asset.yield ? (asset.yield * 100).toString() : "",
      date: new Date(),
      description: asset.description || "",
      purchase_date: asset.purchase_date ? parseDateString(asset.purchase_date) : null,
      purchase_value: asset.purchase_value ? asset.purchase_value.toString() : "",
    });
    setModalOpen(true);
  };

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        const { error: deleteError } = await removeAsset(assetToDelete.id);
        if (deleteError) throw deleteError;

        await refreshAssets();

        setDeleteDialogOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        if (isAuthError(error)) {
          await handleAuthFailure();
        } else {
          console.error("Erro ao deletar ativo:", error);
          alert("Erro ao deletar ativo. Verifique o console para mais detalhes.");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Converter Date object para string YYYY-MM-DD
      const dateString = formData.date.toISOString().split("T")[0];
      const purchaseDateString = formData.purchase_date ? formData.purchase_date.toISOString().split("T")[0] : null;

      // Buscar o ID do tipo de ativo pelo nome
      const category = categories.find(c => c.name === formData.type);

      const assetData = {
        categoryId: category?.id,
        name: formData.name,
        value: parseFloat(formData.value),
        yieldRate: formData.yield ? parseFloat(formData.yield) / 100 : 0,
        currency: "BRL",
        valuationDate: dateString,
        description: formData.description || null,
        purchaseDate: purchaseDateString,
        purchaseValue: formData.purchase_value ? parseFloat(formData.purchase_value) : null,
      };

      let result;
      if (editingAsset) {
        result = await updateAsset(editingAsset.id, assetData);
      } else {
        result = await createAsset(assetData);
      }

      if (result.error) throw result.error;

      await refreshAssets();

      setModalOpen(false);
      setFormData({
        name: "",
        type: "Poupança",
        value: "",
        yield: "",
        date: new Date(),
        description: "",
        purchase_date: null,
        purchase_value: "",
      });
    } catch (error) {
      if (isAuthError(error)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar ativo:", error);
        alert("Erro ao salvar ativo. Verifique o console para mais detalhes.");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExport = () => {
    const columns = [
      { key: "date", label: "Data", format: (row) => formatDate(row.date) },
      { key: "name", label: "Nome" },
      { key: "type", label: "Tipo" },
      {
        key: "value",
        label: "Valor",
        format: (row) => formatCurrency(row.value),
      },
      {
        key: "yield",
        label: "Rendimento (% a.m.)",
        format: (row) => `${(row.yield * 100).toFixed(2)}%`,
      },
    ];

    exportToCSV(filteredAssets, columns, "patrimonio-ativos");
  };

  // Calcular estatísticas baseadas no patrimônio e ativos filtrados
  const averageYield =
    filteredAssets.length > 0
      ? filteredAssets.reduce((sum, a) => sum + (a.yield || 0), 0) /
        filteredAssets.length
      : 0;

  // Agrupar patrimônio por tipo
  const assetsByType = filteredAssets.reduce((acc, asset) => {
    const existing = acc.find((item) => item.name === asset.type);
    if (existing) {
      existing.value += asset.value;
    } else {
      // Buscar cor do tipo de ativo do mock
      const category = categories.find((c) => c.name === asset.type);
      acc.push({
        name: asset.type,
        value: asset.value,
        color: category?.color || "#64748b",
      });
    }
    return acc;
  }, []);

  // Ordenar patrimônio por valor (maior primeiro)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      // Ordenar por valor (descendente - maior primeiro)
      return b.value - a.value;
    });
  }, [filteredAssets]);

  if (!authLoading && !user) {
    return null;
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  // Configuração de colunas da tabela
  const assetColumns = [
    {
      key: "name",
      label: "Nome",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (row) => {
        const IconComponent = getIconComponent(row.type_icon || "Tag");
        return (
          <div className="flex items-center gap-2">
            <div
              className="p-1 rounded flex-shrink-0"
              style={{ backgroundColor: row.type_color + '20' }}
            >
              <IconComponent
                className="w-4 h-4"
                style={{ color: row.type_color }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {row.type}
            </span>
          </div>
        );
      },
    },
    {
      key: "value",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(row.value)}
        </span>
      ),
    },
    {
      key: "yield",
      label: "Rendimento",
      sortable: true,
      render: (row) => (
        <span>
          {(row.yield * 100).toFixed(2)}% a.m.
        </span>
      ),
    },
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateAsset(row);
            }}
            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
            title="Duplicar ativo"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAsset(row);
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
            title="Excluir ativo"
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
        title="Patrimônio e Ativos"
        description="Gerencie seus ativos e acompanhe rendimentos"
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <FilterButton
          activeFiltersCount={
            (filterType !== "all" ? 1 : 0) + (filterMonth ? 1 : 0)
          }
          onClearFilters={() => {
            setFilterType("all");
            setFilterMonth(null);
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Filtro por tipo */}
            <div className="space-y-2">
              <Label
                htmlFor="filter-type"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo de Ativo
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {categories.map((cat) => {
                    const IconComponent = getIconComponent(cat.icon || "Tag");
                    return (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: cat.color + '20' }}
                          >
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: cat.color }}
                            />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por período */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <StatsCard
          icon={DollarSign}
          label="Total em Patrimônio"
          value={formatCurrency(totalAssets)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={Percent}
          label="Rendimento Médio"
          value={`${(averageYield * 100).toFixed(2)}% a.m.`}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* Tabela de patrimônio e ativos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ativos</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {columnSelectorElement}
              <Button
                onClick={handleAddAsset}
                size="sm"
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Button>
            </div>
          </div>

          {sortedAssets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Wallet className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Comece a registrar seu patrimônio
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Adicione seus ativos e investimentos para acompanhar seu patrimônio.
              </p>
              <Button
                onClick={handleAddAsset}
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Ativo
              </Button>
            </div>
          ) : (
            <Table
              columns={assetColumns}
              data={sortedAssets}
              pageSize={10}
              onRowClick={handleEditAsset}
              tableId="assets-table"
              renderColumnSelector={setColumnSelectorElement}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar ativo */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingAsset ? "Editar Ativo" : "Novo Ativo"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Ativo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Poupança Banco X, CDB, Tesouro Direto"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const IconComponent = getIconComponent(cat.icon || "Tag");
                    return (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: cat.color + '20' }}
                          >
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: cat.color }}
                            />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield">
                Rendimento Mensal (%){" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="yield"
                name="yield"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.yield}
                onChange={(e) => handleInputChange("yield", e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ex: Para 0,7% ao mês, digite 0.7
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="description">Descrição <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Adicione informações sobre este ativo..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data de Compra <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <DatePicker
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={(date) => handleInputChange("purchase_date", date)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_value">Valor de Compra (R$) <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Input
                id="purchase_value"
                name="purchase_value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.purchase_value}
                onChange={(e) => handleInputChange("purchase_value", e.target.value)}
              />
            </div>
            </form>
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
              type="submit"
              form="asset-form"
              className="flex-1 sm:flex-none"
            >
              {editingAsset ? "Salvar" : "Adicionar Ativo"}
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
              Tem certeza que deseja excluir o ativo "
              {assetToDelete?.name}"? Esta ação não pode ser desfeita.
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

    </div>
  );
}