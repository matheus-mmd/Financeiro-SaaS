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
import ProgressBar from "../../src/components/ProgressBar";
import DatePicker from "../../src/components/DatePicker";
import { fetchMock, formatCurrency, formatDate } from "../../src/utils/mockApi";
import { exportToCSV } from "../../src/utils/exportData";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Minus,
  Download,
  Filter,
  TrendingUp,
} from "lucide-react";

/**
 * Página Metas - Gerenciamento de metas financeiras
 * Permite visualizar, filtrar, adicionar e acompanhar progresso de metas
 */
export default function Metas() {
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Inicializa com primeiro e último dia do mês atual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: firstDay, to: lastDay };
  };

  const [filterMonth, setFilterMonth] = useState(getCurrentMonthRange());
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    progress: "",
    monthlyAmount: "",
    date: new Date(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchMock("/api/targets");
        // Adicionar data às metas se não tiver
        const targetsWithDate = response.data.map((target) => ({
          ...target,
          date: target.date || new Date().toISOString().split("T")[0],
        }));
        setTargets(targetsWithDate);
        setFilteredTargets(targetsWithDate);
      } catch (error) {
        console.error("Erro ao carregar metas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = targets;

    // Filtrar por status
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Filtrar por intervalo de datas
    if (filterMonth?.from && filterMonth?.to) {
      filtered = filtered.filter((t) => {
        const [year, month, day] = t.date.split("-");
        const targetDate = new Date(year, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);

        const from = new Date(filterMonth.from);
        from.setHours(0, 0, 0, 0);

        const to = new Date(filterMonth.to);
        to.setHours(23, 59, 59, 999);

        return targetDate >= from && targetDate <= to;
      });
    }

    setFilteredTargets(filtered);
  }, [filterStatus, filterMonth, targets]);

  const handleAddTarget = () => {
    setEditingTarget(null);
    setFormData({
      title: "",
      goal: "",
      progress: "",
      monthlyAmount: "",
      date: new Date(),
    });
    setModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    // Converter string de data para Date object
    const [year, month, day] = target.date.split("-");
    const dateObj = new Date(year, month - 1, day);
    setFormData({
      title: target.title,
      goal: target.goal.toString(),
      progress: target.progress.toString(),
      monthlyAmount: target.monthlyAmount?.toString() || "",
      date: dateObj,
    });
    setModalOpen(true);
  };

  const handleDeleteTarget = (target) => {
    setTargetToDelete(target);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (targetToDelete) {
      setTargets(targets.filter((t) => t.id !== targetToDelete.id));
      setDeleteDialogOpen(false);
      setTargetToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setTargets(targets.filter((t) => !selectedTargets.includes(t.id)));
    setSelectedTargets([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converter Date object para string YYYY-MM-DD
    const dateString = formData.date.toISOString().split("T")[0];

    const newTarget = {
      id: editingTarget?.id || `t${Date.now()}`,
      title: formData.title,
      goal: parseFloat(formData.goal),
      progress: parseFloat(formData.progress || 0),
      monthlyAmount: formData.monthlyAmount
        ? parseFloat(formData.monthlyAmount)
        : 0,
      status:
        parseFloat(formData.progress || 0) >= parseFloat(formData.goal)
          ? "completed"
          : "in_progress",
      date: dateString,
    };

    if (editingTarget) {
      setTargets(
        targets.map((t) => (t.id === editingTarget.id ? newTarget : t))
      );
    } else {
      setTargets([newTarget, ...targets]);
    }

    setModalOpen(false);
    setFormData({
      title: "",
      goal: "",
      progress: "",
      monthlyAmount: "",
      date: new Date(),
    });
  };

  const calculateMonthsToGoal = (goal, progress, monthlyAmount) => {
    if (!monthlyAmount || monthlyAmount <= 0) return null;
    const remaining = goal - progress;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / monthlyAmount);
  };

  const getTargetDate = (months) => {
    if (months === null || months === 0) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExport = () => {
    const columns = [
      { key: "date", label: "Data", format: (row) => formatDate(row.date) },
      { key: "title", label: "Meta" },
      {
        key: "status",
        label: "Status",
        format: (row) =>
          row.status === "completed" ? "Concluída" : "Em Andamento",
      },
      {
        key: "goal",
        label: "Objetivo",
        format: (row) => formatCurrency(row.goal),
      },
      {
        key: "progress",
        label: "Atual",
        format: (row) => formatCurrency(row.progress),
      },
      {
        key: "percentage",
        label: "Progresso (%)",
        format: (row) => `${((row.progress / row.goal) * 100).toFixed(1)}%`,
      },
    ];

    exportToCSV(filteredTargets, columns, "metas");
  };

  // Calcular estatísticas baseadas nas metas filtradas
  const completedTargets = filteredTargets.filter(
    (t) => t.status === "completed"
  );
  const inProgressTargets = filteredTargets.filter(
    (t) => t.status === "in_progress"
  );
  const totalGoalAmount = filteredTargets.reduce((sum, t) => sum + t.goal, 0);
  const totalProgressAmount = filteredTargets.reduce(
    (sum, t) => sum + t.progress,
    0
  );

  // Ordenar metas por progresso percentual (maior primeiro)
  const sortedTargets = useMemo(() => {
    return [...filteredTargets].sort((a, b) => {
      const percentA = (a.progress / a.goal) * 100;
      const percentB = (b.progress / b.goal) * 100;
      return percentB - percentA;
    });
  }, [filteredTargets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Configuração de colunas da tabela
  const targetColumns = [
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "title",
      label: "Meta",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        if (row.status === "completed") {
          return (
            <Badge variant="default" className="bg-green-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Concluída
              </span>
            </Badge>
          );
        } else {
          return (
            <Badge variant="default" className="bg-yellow-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Em Andamento
              </span>
            </Badge>
          );
        }
      },
    },
    {
      key: "progress",
      label: "Progresso",
      render: (row) => (
        <div className="min-w-[200px]">
          <ProgressBar
            progress={row.progress}
            goal={row.goal}
            variant="brand"
          />
        </div>
      ),
    },
    {
      key: "goal",
      label: "Objetivo",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.goal)}
        </span>
      ),
    },
    {
      key: "current",
      label: "Atual",
      sortable: true,
      render: (row) => (
        <span className="text-blue-600 font-semibold">
          {formatCurrency(row.progress)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditTarget(row)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Editar meta"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteTarget(row)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            aria-label="Excluir meta"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Metas Financeiras"
        description="Defina e acompanhe suas metas"
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button onClick={handleAddTarget}>
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 min-w-0">
        <StatsCard
          icon={Target}
          label="Total de Metas"
          value={filteredTargets.length}
          iconColor="blue"
          valueColor="text-blue-600"
        />

        <StatsCard
          icon={CheckCircle}
          label="Concluídas"
          value={completedTargets.length}
          iconColor="green"
          valueColor="text-green-600"
        />

        <StatsCard
          icon={TrendingUp}
          label="Em Andamento"
          value={inProgressTargets.length}
          iconColor="yellow"
          valueColor="text-yellow-600"
        />

        <StatsCard
          icon={Target}
          label="Total Objetivos"
          value={formatCurrency(totalGoalAmount)}
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
              {/* Filtro por status */}
              <div className="space-y-2">
                <Label
                  htmlFor="filter-status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as metas</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
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
            {(filterStatus !== "all" || filterMonth) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus("all");
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

      {/* Tabela de metas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Metas ({filteredTargets.length})
            </h2>
          </div>

          {/* Barra de ações da tabela */}
          <TableActions
            onAdd={handleAddTarget}
            onExport={handleExport}
            onDelete={handleBulkDelete}
            selectedCount={selectedTargets.length}
            addLabel="Nova meta"
            exportLabel="Exportar metas"
            deleteLabel="Excluir metas selecionadas"
          />

          {sortedTargets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhuma meta encontrada.{" "}
                <button
                  onClick={handleAddTarget}
                  className="text-brand-600 hover:text-brand-700 font-medium underline"
                >
                  Criar nova meta
                </button>
              </p>
            </div>
          ) : (
            <Table
              columns={targetColumns}
              data={sortedTargets}
              pageSize={15}
              onRowClick={handleEditTarget}
              selectable={true}
              selectedRows={selectedTargets}
              onSelectionChange={setSelectedTargets}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de adicionar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTarget ? "Editar Meta" : "Nova Meta"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Meta</Label>
              <Input
                id="title"
                placeholder="Ex: Reserva de emergência"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Valor Objetivo (R$)</Label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.goal}
                onChange={(e) => handleInputChange("goal", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Valor Atual (R$)</Label>
              <Input
                id="progress"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.progress}
                onChange={(e) => handleInputChange("progress", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyAmount">
                Guardar por mês (R$){" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="monthlyAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.monthlyAmount}
                onChange={(e) =>
                  handleInputChange("monthlyAmount", e.target.value)
                }
              />
              {formData.monthlyAmount &&
                parseFloat(formData.monthlyAmount) > 0 &&
                formData.goal && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const months = calculateMonthsToGoal(
                        parseFloat(formData.goal),
                        parseFloat(formData.progress || 0),
                        parseFloat(formData.monthlyAmount)
                      );
                      const targetDate = getTargetDate(months);
                      return targetDate ? (
                        <>
                          Você alcançará o objetivo em{" "}
                          <span className="font-semibold text-brand-600">
                            {targetDate}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-green-600">
                          Meta já alcançada!
                        </span>
                      );
                    })()}
                  </p>
                )}
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
              variant="outline"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} type="button">
              {editingTarget ? "Salvar" : "Criar Meta"}
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
              Tem certeza que deseja excluir a meta "{targetToDelete?.title}"?
              Esta ação não pode ser desfeita.
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
              Tem certeza que deseja excluir {selectedTargets.length} meta(s)
              selecionada(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
