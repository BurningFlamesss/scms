import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Maximize2, Pencil, Star, Trash2 } from "lucide-react";
import type { GalleryImage } from "#/types";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

interface SortableImageTileProps {
  image: GalleryImage;
  index: number;
  canManage: boolean;
  isCover: boolean;
  /** Grid row span so the grid reads as a masonry wall while keeping row order. */
  spanClass: string;
  onOpen: () => void;
  onEditCaption: () => void;
  onSetCover: () => void;
  onDelete: () => void;
}

/** Masonry tile with hover-revealed actions and a drag handle. */
export function SortableImageTile({
  image,
  index,
  canManage,
  isCover,
  spanClass,
  onOpen,
  onEditCaption,
  onSetCover,
  onDelete,
}: SortableImageTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
    disabled: !canManage,
  });

  return (
    <figure
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid={`gallery-image-tile-${image.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-surface-1",
        spanClass,
        isCover ? "border-accent/50" : "border-hairline",
        isDragging && "z-10 opacity-90 shadow-pop",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${image.caption || "image"}`}
        data-testid={`gallery-image-open-${image.id}`}
        className="min-h-0 w-full flex-1 overflow-hidden focus-ring"
      >
        <img
          src={image.url}
          alt={image.caption}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <span className="num rounded border border-hairline bg-surface-1 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        {isCover && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
            <Star className="h-2.5 w-2.5" /> Cover
          </span>
        )}
      </div>

      <div className="row-actions absolute right-2 top-9 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          aria-label="Open image"
          data-testid={`gallery-image-expand-${image.id}`}
          onClick={onOpen}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        {canManage && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7"
              aria-label="Edit caption"
              data-testid={`gallery-image-caption-${image.id}`}
              onClick={onEditCaption}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7"
              aria-label="Set as cover"
              disabled={isCover}
              data-testid={`gallery-image-cover-${image.id}`}
              onClick={onSetCover}
            >
              <Star className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 text-destructive"
              aria-label="Delete image"
              data-testid={`gallery-image-delete-${image.id}`}
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              aria-label="Drag to reorder"
              data-testid={`gallery-image-drag-${image.id}`}
              className="grid h-7 w-7 cursor-grab place-items-center rounded-md border border-hairline bg-secondary text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing focus-ring"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      <figcaption className="shrink-0 border-t border-hairline px-2.5 py-1.5">
        <p className="truncate text-[11px] text-foreground" data-testid={`gallery-image-caption-text-${image.id}`}>
          {image.caption || "Untitled"}
        </p>
      </figcaption>
    </figure>
  );
}
