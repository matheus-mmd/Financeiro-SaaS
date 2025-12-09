"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import StatsCard from "../../src/components/StatsCard";
import DateRangePicker from "../../src/components/DateRangePicker";
import FilterButton from "../../src/components/FilterButton";
import FABMenu from "../../src/components/FABMenu";
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
import PageSkeleton from "../../src/components/PageSkeleton";
import Table from "../../src/components/Table";
import ProgressBar from "../../src/components/ProgressBar";
import DatePicker from "../../src/components/DatePicker";
import {
  fetchData,
  formatCurrency,
  formatDate,
  createTarget,
  updateTarget,
  deleteTarget,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import { exportToCSV } from "../../src/utils/exportData";
import { GOAL_STATUS } from "../../src/constants";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle,
  Download,
  TrendingUp,
  Copy,
} from "lucide-react";

/**
 * Página Metas - Gerenciamento de metas financeiras
 * Permite visualizar, filtrar, adicionar e acompanhar progresso de metas
 */
export default function Metas() {
  const { user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [columnSelectorElement, setColumnSelectorElement] = useState(null);
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
        const response = await fetchData("/api/targets");
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
      filtered = filtered.filter((t) => isDateInRange(t.date, filterMonth));
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
    setFormData({
      title: target.title,
      goal: target.goal.toString(),
      progress: target.progress.toString(),
      monthlyAmount: target.monthlyAmount?.toString() || "",
      date: parseDateString(target.date) || new Date(),
    });
    setModalOpen(true);
  };

  // Duplicar meta
  const handleDuplicateTarget = (target) => {
    setEditingTarget(null);
    setFormData({
      title: target.title + " (Cópia)",
      goal: target.goal.toString(),
      progress: "0",
      monthlyAmount: target.monthlyAmount?.toString() || "",
      date: new Date(),
    });
    setModalOpen(true);
  };

  const handleDeleteTarget = (target) => {
    setTargetToDelete(target);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (targetToDelete) {
      try {
        // Deletar usando mock API
        await deleteTarget(targetToDelete.id);

        // Recarregar dados da mock API
        const response = await fetchData("/api/targets");
        const targetsWithDate = response.data.map((target) => ({
          ...target,
          date: target.date || new Date().toISOString().split("T")[0],
        }));
        setTargets(targetsWithDate);
        setFilteredTargets(targetsWithDate);

        setDeleteDialogOpen(false);
        setTargetToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar meta:", error);
        alert("Erro ao deletar meta. Verifique o console para mais detalhes.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Converter Date object para string YYYY-MM-DD
      const dateString = formData.date.toISOString().split("T")[0];

      const targetData = {
        title: formData.title,
        goal: parseFloat(formData.goal),
        progress: parseFloat(formData.progress || 0),
        status:
          parseFloat(formData.progress || 0) >= parseFloat(formData.goal)
            ? GOAL_STATUS.COMPLETED
            : GOAL_STATUS.IN_PROGRESS,
        date: dateString,
      };

      if (editingTarget) {
        // Atualizar meta existente
        await updateTarget(editingTarget.id, targetData);
      } else {
        // Criar nova meta
        await createTarget(targetData, user.id);
      }

      // Recarregar dados da mock API
      const response = await fetchData("/api/targets");
      const targetsWithDate = response.data.map((target) => ({
        ...target,
        date: target.date || new Date().toISOString().split("T")[0],
      }));
      setTargets(targetsWithDate);
      setFilteredTargets(targetsWithDate);

      setModalOpen(false);
      setFormData({
        title: "",
        goal: "",
        progress: "",
        monthlyAmount: "",
        date: new Date(),
      });
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert("Erro ao salvar meta. Verifique o console para mais detalhes.");
    }
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
    (t) => t.status === GOAL_STATUS.COMPLETED
  );
  const inProgressTargets = filteredTargets.filter(
    (t) => t.status === GOAL_STATUS.IN_PROGRESS
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
    return <PageSkeleton />;
  }

  // Configuração de colunas da tabela
  const targetColumns = [
    {
      key: "title",
      label: "Meta",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        if (row.status === GOAL_STATUS.COMPLETED) {
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
              handleDuplicateTarget(row);
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar meta"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTarget(row);
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Excluir meta"
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
        title="Metas Financeiras"
        description="Defina e acompanhe suas metas"
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <FilterButton
          activeFiltersCount={
            (filterStatus !== "all" ? 1 : 0) + (filterMonth ? 1 : 0)
          }
          onClearFilters={() => {
            setFilterStatus("all");
            setFilterMonth(null);
          }}
        >
          <div className="grid grid-cols-1 gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
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

      {/* Tabela de metas */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Metas ({sortedTargets.length})
            </h2>
            {columnSelectorElement}
          </div>

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
              pageSize={10}
              onRowClick={handleEditTarget}
              tableId="targets-table"
              renderColumnSelector={setColumnSelectorElement}
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

      {/* Floating Action Menu */}
      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Ações de Metas"
        actions={[
          {
            icon: <Download className="w-5 h-5" />,
            label: "Exportar",
            onClick: handleExport,
          },
          {
            icon: <Plus className="w-5 h-5" />,
            label: "Nova Meta",
            onClick: handleAddTarget,
          },
        ]}
      />
    </div>
  );
}
