"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import MonthPicker from "../../src/components/MonthPicker";
import { Card, CardContent } from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
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
import Spinner from "../../src/components/Spinner";
import Table from "../../src/components/Table";
import TableActions from "../../src/components/TableActions";
import DatePicker from "../../src/components/DatePicker";
import { fetchMock, formatCurrency, formatDate } from "../../src/utils/mockApi";
import { exportToCSV } from "../../src/utils/exportData";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Plus,
  Filter,
  Download,
  Trash2,
  Wallet,
  PieChart,
} from "lucide-react";

/**
 * Página Investimentos - Gerenciamento de ativos e investimentos
 * Permite visualizar, filtrar, adicionar e gerenciar investimentos
 */
export default function Investimentos() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  // Inicializa com primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    name: "",
    type: "Poupança",
    value: "",
    yield: "",
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock("/api/assets");
        // Adicionar data aos ativos se não tiver
        const assetsWithDate = response.data.map((asset) => ({
          ...asset,
          date: asset.date || new Date().toISOString().split("T")[0],
        }));
        setAssets(assetsWithDate);
        setFilteredAssets(assetsWithDate);
      } catch (error) {
        console.error("Erro ao carregar investimentos:", error);
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
      filtered = filtered.filter((a) => {
        const [year, month, day] = a.date.split("-");
        const assetDate = new Date(year, month - 1, day);
        assetDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return assetDate >= from && assetDate <= to;
      });
    }

    setFilteredAssets(filtered);
  }, [filterType, filterMonth, assets]);

  const totalInvestments = filteredAssets.reduce(
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
    });
    setModalOpen(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    // Converter string de data para Date object
    const [year, month, day] = asset.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      yield: asset.yield ? (asset.yield * 100).toString() : "",
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      setAssets(assets.filter((a) => a.id !== assetToDelete.id));
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setAssets(assets.filter((a) => !selectedAssets.includes(a.id)));
    setSelectedAssets([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converter Date object para string YYYY-MM-DD
    const dateString = formData.date.toISOString().split("T")[0];

    const assetData = {
      id: editingAsset?.id || Date.now(),
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      yield: formData.yield ? parseFloat(formData.yield) / 100 : 0,
      date: dateString,
      currency: "BRL",
    };

    if (editingAsset) {
      setAssets(assets.map((a) => (a.id === editingAsset.id ? assetData : a)));
    } else {
      setAssets([assetData, ...assets]);
    }

    setModalOpen(false);
    setFormData({
      name: "",
      type: "Poupança",
      value: "",
      yield: "",
      date: new Date(),
    });
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

    exportToCSV(filteredAssets, columns, "investimentos");
  };

  // Calcular estatísticas baseadas nos investimentos filtrados
  const averageYield =
    filteredAssets.length > 0
      ? filteredAssets.reduce((sum, a) => sum + (a.yield || 0), 0) /
        filteredAssets.length
      : 0;

  // Agrupar investimentos por tipo
  const assetsByType = filteredAssets.reduce((acc, asset) => {
    const existing = acc.find((item) => item.name === asset.type);
    if (existing) {
      existing.value += asset.value;
    } else {
      // Cores para cada tipo de investimento
      const typeColors = {
        Poupança: "#22c55e",
        CDB: "#3b82f6",
        "Tesouro Direto": "#f59e0b",
        Ações: "#ef4444",
        Fundos: "#8b5cf6",
        Criptomoedas: "#ec4899",
        Outros: "#64748b",
      };
      acc.push({
        name: asset.type,
        value: asset.value,
        color: typeColors[asset.type] || "#64748b",
      });
    }
    return acc;
  }, []);

  // Ordenar investimentos por valor (maior primeiro)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      // Ordenar por valor (descendente - maior primeiro)
      return b.value - a.value;
    });
  }, [filteredAssets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Tipos de investimento únicos
  const investmentTypes = [
    "Poupança",
    "CDB",
    "Tesouro Direto",
    "Ações",
    "Fundos",
    "Criptomoedas",
    "Outros",
  ];

  // Configuração de colunas da tabela
  const assetColumns = [
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "name",
      label: "Nome",
      sortable: true,
    },
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (row) => {
        // Cores para cada tipo de investimento
        const typeColors = {
          Poupança: "#22c55e",
          CDB: "#3b82f6",
          "Tesouro Direto": "#f59e0b",
          Ações: "#ef4444",
          Fundos: "#8b5cf6",
          Criptomoedas: "#ec4899",
          Outros: "#64748b",
        };
        return (
          <Badge
            variant="default"
            style={{
              backgroundColor: typeColors[row.type] || "#64748b",
              color: "white",
            }}
          >
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: "value",
      label: "Valor",
      sortable: true,
      render: (row) => (
        <span className="text-green-600 font-semibold">
          {formatCurrency(row.value)}
        </span>
      ),
    },
    {
      key: "yield",
      label: "Rendimento",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">
          {(row.yield * 100).toFixed(2)}% a.m.
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <button
          onClick={() => handleDeleteAsset(row)}
          className="p-1 hover:bg-red-50 rounded transition-colors"
          aria-label="Excluir investimento"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Investimentos"
        description="Gerencie seus ativos e acompanhe rendimentos"
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="secondary" onClick={() => setTypeModalOpen(true)}>
              <PieChart className="w-4 h-4" />
              Tipos
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="w-4 h-4" />
              Novo Investimento
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        <StatsCard
          icon={DollarSign}
          label="Total Investido"
          value={formatCurrency(totalInvestments)}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={Wallet}
          label="Total de Ativos"
          value={filteredAssets.length}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={Percent}
          label="Rendimento Médio"
          value={`${(averageYield * 100).toFixed(2)}% a.m.`}
          iconColor="purple"
          valueColor="text-purple-600"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtrar por:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por tipo */}
              <div className="space-y-2">
                <Label
                  htmlFor="filter-type"
                  className="text-sm font-medium text-gray-700"
                >
                  Tipo de Investimento
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por mês/ano */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Mês e Ano
                </Label>
                <MonthPicker
                  value={filterMonth}
                  onChange={setFilterMonth}
                  placeholder="Selecione o período"
                />
              </div>
            </div>

            {/* Limpar filtros */}
            {(filterType !== "all" || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType("all");
                    setFilterMonth(getCurrentMonthRange());
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de investimentos por tipo */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Investimentos por Tipo
          </h2>
          <div className="space-y-3">
            {assetsByType
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const percentage = (
                  (item.value / totalInvestments) *
                  100
                ).toFixed(1);

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {percentage}%
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de investimentos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todos os Investimentos ({filteredAssets.length})
            </h2>
          </div>
          
          {/* Barra de ações da tabela */}
          <TableActions
            onAdd={handleAddAsset}
            onExport={handleExport}
            onDelete={handleBulkDelete}
            selectedCount={selectedAssets.length}
            addLabel="Novo investimento"
            exportLabel="Exportar investimentos"
            deleteLabel="Excluir investimentos selecionados"
          />

          {sortedAssets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhum investimento encontrado.{" "}
                <button
                  onClick={handleAddAsset}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Adicionar novo investimento
                </button>
              </p>
            </div>
          ) : (
            <Table
              columns={assetColumns}
              data={sortedAssets}
              pageSize={15}
              onRowClick={handleEditAsset}
              selectable={true}
              selectedRows={selectedAssets}
              onSelectionChange={setSelectedAssets}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar investimento */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Editar Investimento" : "Novo Investimento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Investimento</Label>
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
                  {investmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
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
              {editingAsset ? "Salvar" : "Adicionar Investimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de tipos de investimentos */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipos de Investimentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {investmentTypes.map((type) => {
              // Cores para cada tipo de investimento
              const typeColors = {
                Poupança: "#22c55e",
                CDB: "#3b82f6",
                "Tesouro Direto": "#f59e0b",
                Ações: "#ef4444",
                Fundos: "#8b5cf6",
                Criptomoedas: "#ec4899",
                Outros: "#64748b",
              };
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: typeColors[type] || "#64748b" }}
                  />
                  <span className="font-medium text-gray-900">{type}</span>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setTypeModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o investimento "
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

      {/* AlertDialog de confirmação de exclusão em lote */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedAssets.length}{" "}
              investimento(s) selecionado(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}