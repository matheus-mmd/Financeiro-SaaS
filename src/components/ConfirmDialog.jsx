"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Trash2, Info, AlertCircle } from 'lucide-react';

/**
 * ConfirmDialog - Modal de confirmação customizado
 * Substitui o confirm() nativo do navegador
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar ação",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // "danger" | "warning" | "info"
  onConfirm,
  onCancel,
}) {
  const variants = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-500" />,
      iconBg: "bg-red-100",
      confirmClass: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      iconBg: "bg-yellow-100",
      confirmClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      iconBg: "bg-blue-100",
      confirmClass: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  };

  const currentVariant = variants[variant] || variants.danger;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${currentVariant.iconBg}`}>
              {currentVariant.icon}
            </div>
          </div>

          {/* Title */}
          <DialogHeader className="text-center mb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {description && (
            <DialogDescription className="text-center text-gray-500 text-sm">
              {description}
            </DialogDescription>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 ${currentVariant.confirmClass}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}