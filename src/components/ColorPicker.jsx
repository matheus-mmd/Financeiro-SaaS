"use client";

import React, { useState } from "react";
import { Label } from "./ui/label";
import { Check } from "lucide-react";

/**
 * ColorPicker - Componente para seleção de cores com paleta predefinida
 * Segue o padrão visual da aplicação
 */

// Paleta de cores predefinidas
const COLOR_PALETTE = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Índigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Laranja", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lima", value: "#84cc16" },
  { name: "Âmbar", value: "#fbbf24" },
  { name: "Violeta", value: "#a855f7" },
  { name: "Fúcsia", value: "#d946ef" },
  { name: "Esmeralda", value: "#059669" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Cinza", value: "#6b7280" },
  { name: "Slate", value: "#64748b" },
];

export default function ColorPicker({ selectedColor = "#6366f1", onColorSelect }) {
  return (
    <div className="space-y-2">
      <Label>Cor da Categoria</Label>
      <div className="grid grid-cols-6 gap-2">
        {COLOR_PALETTE.map((color) => {
          const isSelected = color.value.toLowerCase() === selectedColor.toLowerCase();

          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onColorSelect(color.value)}
              className={`
                relative w-10 h-10 rounded-lg transition-all hover:scale-110
                ${isSelected ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'}
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}