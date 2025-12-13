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
  formatCurrency,
  formatDate,
  parseDateString,
  isDateInRange,
} from "../../src/utils";
import {
  getTargets,
  createTarget,
  updateTarget,
  deleteTarget,
} from "../../src/lib/supabase/api/targets";
import { getCategories } from "../../src/lib/supabase/api/categories";
import { exportToCSV } from "../../src/utils/exportData";
import { getIconComponent } from "../../src/components/IconPicker";
import { GOAL_STATUS } from "../../src/constants";
import { Target, Plus, Trash2, CheckCircle, Download, TrendingUp, Copy } from "lucide-react";

/**
 * Página Metas - Gerenciamento de metas financeiras
 * Permite visualizar, filtrar, adicionar e acompanhar progresso de metas
 */
export default function Metas() {
  const { user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [categories, setCategories] = useState([]);
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
    category: "",
    goal: "",
    progress: "",
    monthlyAmount: "",
    date: new Date(),
    deadline: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [targetsRes, categoriesRes] = await Promise.all([
          getTargets(),
          getCategories(),
        ]);

        if (targetsRes.error) throw targetsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        // Map Supabase fields to component fields
        const mappedTargets = (targetsRes.data || []).map((target) => ({
          ...target,
          goal: target.goal_amount,
          progress: target.current_amount,
          monthlyAmount: target.monthly_target,
          category: target.category_name || "",
          date: target.start_date || new Date().toISOString().split("T")[0],
        }));

        setTargets(mappedTargets);
        setFilteredTargets(mappedTargets);
        setCategories(categoriesRes.data || []);
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
      category: "",
      goal: "",
      progress: "",
      monthlyAmount: "",
      date: new Date(),
      deadline: null,
    });
    setModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    setFormData({
      title: target.title,
      category: target.category || "",
      goal: target.goal.toString(),
      progress: target.progress.toString(),
      monthlyAmount: target.monthlyAmount?.toString() || "",
      date: parseDateString(target.date) || new Date(),
      deadline: target.deadline ? parseDateString(target.deadline) : null,
    });
    setModalOpen(true);
  };

  // Duplicar meta
  const handleDuplicateTarget = (target) => {
    setEditingTarget(null);
    setFormData({
      title: target.title + " (Cópia)",
      category: target.category || "",
      goal: target.goal.toString(),
      progress: "0",
      monthlyAmount: target.monthlyAmount?.toString() || "",
      date: new Date(),
      deadline: target.deadline ? parseDateString(target.deadline) : null,
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
        const result = await deleteTarget(targetToDelete.id);
        if (result.error) throw result.error;

        // Reload data
        const response = await getTargets();
        if (response.error) throw response.error;

        const mappedTargets = (response.data || []).map((target) => ({
          ...target,
          goal: target.goal_amount,
          progress: target.current_amount,
          monthlyAmount: target.monthly_target,
          category: target.category_name || "",
          date: target.start_date || new Date().toISOString().split("T")[0],
        }));

        setTargets(mappedTargets);
        setFilteredTargets(mappedTargets);

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
      const deadlineString = formData.deadline ? formData.deadline.toISOString().split("T")[0] : null;

      // Buscar o ID da categoria pelo nome
      const category = categories.find((c) => c.name === formData.category);

      const targetData = {
        title: formData.title,
        categoryId: category?.id || null,
        goalAmount: parseFloat(formData.goal),
        currentAmount: parseFloat(formData.progress || 0),
        monthlyTarget: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : null,
        status:
          parseFloat(formData.progress || 0) >= parseFloat(formData.goal)
            ? GOAL_STATUS.COMPLETED
            : GOAL_STATUS.IN_PROGRESS,
        startDate: dateString,
        deadline: deadlineString,
      };

      let result;
      if (editingTarget) {
        result = await updateTarget(editingTarget.id, targetData);
      } else {
        result = await createTarget(targetData);
      }

      if (result.error) throw result.error;

      // Reload data
      const response = await getTargets();
      if (response.error) throw response.error;

      const mappedTargets = (response.data || []).map((target) => ({
        ...target,
        goal: target.goal_amount,
        progress: target.current_amount,
        monthlyAmount: target.monthly_target,
        category: target.category_name || "",
        date: target.start_date || new Date().toISOString().split("T")[0],
      }));

      setTargets(mappedTargets);
      setFilteredTargets(mappedTargets);

      setModalOpen(false);
      setFormData({
        title: "",
        category: "",
        goal: "",
        progress: "",
        monthlyAmount: "",
        date: new Date(),
        deadline: null,
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
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900">{row.title}</span>
        </div>
      ),
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
          activeFiltersCount={(filterStatus !== "all" ? 1 : 0) + (filterMonth ? 1 : 0)}
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">Nenhuma meta encontrada</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTarget}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Meta
              </Button>
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
              <Label htmlFor="category">Categoria <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <DatePicker
                id="deadline"
                value={formData.deadline}
                onChange={(date) => handleInputChange("deadline", date)}
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