import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Settings2, Trash2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";
import type { ContentBlock } from "#/types";

interface SortableBlockCardProps {
  block: ContentBlock;
  index: number;
  total: number;
  selected: boolean;
  canManage: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

export function SortableBlockCard({
  block,
  index,
  total,
  selected,
  canManage,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onMove,
}: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: !canManage,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid={`cms-block-card-${block.id}`}
      className={cn(
        "group rounded-lg border bg-surface-1 transition-colors duration-150",
        selected ? "border-primary/50 bg-primary/[0.04]" : "border-hairline hover:border-primary/30",
        isDragging && "z-10 shadow-pop",
      )}
    >
      <div className="flex items-start gap-1.5 p-2">
        <button
          type="button"
          aria-label={`Drag ${block.label}`}
          data-testid={`cms-block-drag-${block.id}`}
          className={cn(
            "mt-0.5 rounded p-1 text-muted-foreground transition-colors focus-ring",
            canManage ? "cursor-grab hover:bg-secondary hover:text-foreground active:cursor-grabbing" : "cursor-not-allowed opacity-40",
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onSelect}
          data-testid={`cms-block-select-${block.id}`}
          className="min-w-0 flex-1 rounded px-1 py-0.5 text-left focus-ring"
        >
          <span className="flex items-center gap-1.5">
            <span className="num text-[10px] font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 truncate text-sm font-medium text-foreground">{block.label}</span>
            {!block.visible && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Hidden
              </span>
            )}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className="truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {block.type.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] text-muted-foreground" aria-hidden>
              ·
            </span>
            <span className="truncate text-[10px] text-muted-foreground">{relativeTime(block.updatedAt)}</span>
          </span>
        </button>

        {canManage && (
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Move ${block.label} up`}
              disabled={index === 0}
              data-testid={`cms-block-up-${block.id}`}
              onClick={() => onMove("up")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Move ${block.label} down`}
              disabled={index === total - 1}
              data-testid={`cms-block-down-${block.id}`}
              onClick={() => onMove("down")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {canManage && (
        <div className="flex items-center gap-1 border-t border-hairline px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1.5 px-1.5 text-[11px]"
            data-testid={`cms-block-edit-${block.id}`}
            onClick={onSelect}
          >
            <Settings2 className="h-3 w-3" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1.5 px-1.5 text-[11px]"
            data-testid={`cms-block-visibility-${block.id}`}
            onClick={onToggleVisibility}
          >
            {block.visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {block.visible ? "Hide" : "Show"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1.5 px-1.5 text-[11px]"
            data-testid={`cms-block-duplicate-${block.id}`}
            onClick={onDuplicate}
          >
            <Copy className="h-3 w-3" /> Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 gap-1.5 px-1.5 text-[11px] text-destructive"
            data-testid={`cms-block-delete-${block.id}`}
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      )}
    </li>
  );
}
