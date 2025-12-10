"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  fetchData,
  formatCurrency,
  formatDate,
  createAsset,
  updateAsset,
  deleteAsset,
  getCurrentMonthRange,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import FilterButton from "../../src/components/FilterButton";
import FABMenu from "../../src/components/FABMenu";
import { TRANSACTION_TYPE_IDS, DEFAULT_CATEGORY_COLOR } from "../../src/constants";
import { DollarSign, Percent, Plus, Download, Trash2, Wallet, Copy } from "lucide-react";

/**
 * Página Patrimônio e Ativos - Gerenciamento de patrimônio e ativos
 * Permite visualizar, filtrar, adicionar e gerenciar patrimônio e ativos
 */
export default function PatrimonioAtivos() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assetsRes, categoriesRes] = await Promise.all([
          fetchData("/api/assets"),
          fetchData("/api/categories"),
        ]);

        // Adicionar data aos ativos se não tiver
        const assetsWithDate = assetsRes.data.map((asset) => ({
          ...asset,
          date: asset.date || new Date().toISOString().split("T")[0],
        }));

        setAssets(assetsWithDate);
        setFilteredAssets(assetsWithDate);
        // Filtrar apenas categorias que permitem Aporte
        const assetCategories = categoriesRes.data.filter(
          (cat) => cat.transaction_type_id === TRANSACTION_TYPE_IDS.INVESTMENT
        );
        setCategories(assetCategories);
      } catch (error) {
        console.error("Erro ao carregar patrimônio e ativos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        // Deletar usando mock API
        await deleteAsset(assetToDelete.id);

        // Recarregar dados da mock API
        const response = await fetchData("/api/assets");
        const assetsWithDate = response.data.map((asset) => ({
          ...asset,
          date: asset.date || new Date().toISOString().split("T")[0],
        }));
        setAssets(assetsWithDate);
        setFilteredAssets(assetsWithDate);

        setDeleteDialogOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar ativo:", error);
        alert("Erro ao deletar ativo. Verifique o console para mais detalhes.");
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
        assetTypesid: category?.id,
        categoriesId: category?.id,
        name: formData.name,
        value: parseFloat(formData.value),
        yield: formData.yield ? parseFloat(formData.yield) / 100 : 0,
        currency: "BRL",
        date: dateString,
        description: formData.description || null,
        purchase_date: purchaseDateString,
        purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : null,
      };

      if (editingAsset) {
        // Atualizar ativo existente
        await updateAsset(editingAsset.id, assetData);
      } else {
        // Criar novo ativo
        await createAsset(assetData, user.id);
      }

      // Recarregar dados da mock API
      const response = await fetchData("/api/assets");
      const assetsWithDate = response.data.map((asset) => ({
        ...asset,
        date: asset.date || new Date().toISOString().split("T")[0],
      }));
      setAssets(assetsWithDate);
      setFilteredAssets(assetsWithDate);

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
      console.error("Erro ao salvar ativo:", error);
      alert("Erro ao salvar ativo. Verifique o console para mais detalhes.");
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

  if (loading) {
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
          <span className="font-medium text-gray-900">{row.name}</span>
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
            <span className="text-sm font-medium text-gray-900">
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
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar ativo"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAsset(row);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
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
                className="text-sm font-medium text-gray-700"
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
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todos os Ativos ({sortedAssets.length})
            </h2>
            {columnSelectorElement}
          </div>

          {sortedAssets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhum ativo encontrado.{" "}
                <button
                  onClick={handleAddAsset}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Adicionar novo ativo
                </button>
              </p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Editar Ativo" : "Novo Ativo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Ativo</Label>
              <Input
                id="name"
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
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.yield}
                onChange={(e) => handleInputChange("yield", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: Para 0,7% ao mês, digite 0.7
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Textarea
                id="description"
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
                value={formData.purchase_date}
                onChange={(date) => handleInputChange("purchase_date", date)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_value">Valor de Compra (R$) <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Input
                id="purchase_value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.purchase_value}
                onChange={(e) => handleInputChange("purchase_value", e.target.value)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit}>
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

      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Patrimônio"
        actions={[
          {
            icon: <Download className="w-5 h-5" />,
            label: "Exportar",
            onClick: handleExport,
          },
          {
            icon: <Plus className="w-5 h-5" />,
            label: "Novo Ativo",
            onClick: handleAddAsset,
          },
        ]}
      />
    </div>
  );
}