"use client";

import React, { useState, useMemo, memo } from "react";
import { Card, CardContent } from "../ui/card";
import SegmentedControl from "../ui/segmented-control";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils";
import { getIconComponent } from "../IconPicker";

/**
 * CategoryBreakdownCard - Card com gráfico de donut mostrando receitas, despesas ou investimentos por categoria
 * Design baseado em dashboards financeiros modernos com toggle entre receitas/despesas/investimentos
 * Memoizado para evitar re-renders desnecessários
 *
 * @param {Array} incomeData - Dados de receitas por categoria [{name, value, color}]
 * @param {Array} expenseData - Dados de despesas por categoria [{name, value, color}]
 * @param {Array} investmentData - Dados de investimentos por categoria [{name, value, color}]
 * @param {string} title - Título opcional do card
 */
const CategoryBreakdownCard = memo(function CategoryBreakdownCard({
  incomeData = [],
  expenseData = [],
  investmentData = [],
  title = null,
}) {
  const [activeTab, setActiveTab] = useState("expenses");
  const [activeIndex, setActiveIndex] = useState(null);

  const data = useMemo(() =>
    activeTab === "income"
      ? incomeData
      : activeTab === "investments"
      ? investmentData
      : expenseData,
    [activeTab, incomeData, investmentData, expenseData]
  );

  const total = useMemo(() =>
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  // Paleta de cores visualmente distintas para diferenciação clara no gráfico
  // Cores escolhidas para máximo contraste entre categorias adjacentes
  const CHART_COLORS = [
    "#3b82f6", // Azul
    "#ef4444", // Vermelho
    "#10b981", // Verde
    "#f59e0b", // Âmbar
    "#8b5cf6", // Roxo
    "#ec4899", // Rosa
    "#06b6d4", // Ciano
    "#f97316", // Laranja
    "#14b8a6", // Teal
    "#6366f1", // Índigo
  ];

  // Sempre usa a paleta do gráfico para garantir distinção visual entre categorias
  const getColor = (index) => CHART_COLORS[index % CHART_COLORS.length];

  // TOP 5 categorias
  const topCategories = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

  const chartData = topCategories.map((item, index) => ({
    ...item,
    chartColor: getColor(index),
  }));

  const iconColor =
    activeTab === "income"
      ? "text-success-600"
      : activeTab === "investments"
      ? "text-info-600"
      : "text-accent-600";
  const iconBgColor =
    activeTab === "income"
      ? "bg-success-100"
      : activeTab === "investments"
      ? "bg-info-100"
      : "bg-accent-100";
  const borderColor =
    activeTab === "income"
      ? "border-success-500"
      : activeTab === "investments"
      ? "border-info-500"
      : "border-accent-500";

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4">
        {/* Header com título e toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                activeTab === "income"
                  ? "bg-success-500"
                  : activeTab === "investments"
                  ? "bg-info-500"
                  : "bg-accent-500"
              }`}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {title ||
                  (activeTab === "income"
                    ? "Receitas por Categoria"
                    : activeTab === "investments"
                    ? "Investimentos por Categoria"
                    : "Gastos por Categoria")}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">TOP 5 CATEGORIAS</p>
            </div>
          </div>

          <SegmentedControl
            options={[
              { label: "Despesas", value: "expenses" },
              { label: "Receitas", value: "income" },
              { label: "Investimentos", value: "investments" },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Layout: Gráfico à esquerda, Lista à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Gráfico de Donut */}
          <div className="flex items-center justify-center">
            {chartData.length > 0 ? (
              <div className="relative w-full max-w-[280px] mx-auto">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.chartColor}
                          strokeWidth={2}
                          stroke="#fff"
                          opacity={
                            activeIndex !== null && activeIndex !== index
                              ? 0.4
                              : 1
                          }
                          className="transition-opacity duration-200"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Label central "TOTAL" */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 tracking-wide">
                      TOTAL
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[280px] flex items-center justify-center">
                <p className="text-sm text-gray-400">Sem dados disponíveis</p>
              </div>
            )}
          </div>

          {/* Lista de Categorias */}
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              const isActive = activeIndex === index;
              const IconComponent = getIconComponent(item.icon || "Tag");
              const hasEmoji = item.emoji && item.emoji.trim();

              return (
                <div
                  key={item.name}
                  className={`flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive ? "scale-105" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                      <span className="text-xs font-bold text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div
                      className="p-1.5 rounded flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: item.chartColor + "20" }}
                    >
                      {hasEmoji ? (
                        <span className="text-base leading-none">{item.emoji}</span>
                      ) : (
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: item.chartColor }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <div
                      className={`text-base font-bold ${
                        isActive ? "text-gray-900" : "text-gray-800"
                      }`}
                    >
                      {formatCurrency(item.value)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}

            {chartData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">
                  Nenhuma categoria encontrada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Total Footer */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Total
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default CategoryBreakdownCard;