import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TableActions({
  onAdd,
  onExport,
  onDelete,
  selectedCount = 0,
  addLabel = "Adicionar novo item",
  exportLabel = "Exportar dados",
  deleteLabel = "Excluir selecionados",
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <TooltipProvider>
        {/* Botão Adicionar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onAdd}
              size="icon"
              variant="default"
              aria-label={addLabel}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{addLabel}</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Exportar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onExport}
              size="icon"
              variant="outline"
              aria-label={exportLabel}
            >
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{exportLabel}</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Excluir Selecionados - só aparece quando há itens selecionados */}
        {selectedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onDelete}
                size="icon"
                variant="destructive"
                aria-label={deleteLabel}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{deleteLabel} ({selectedCount})</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}