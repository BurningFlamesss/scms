import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import type { GalleryImage } from "#/types";
import { Button } from "#/components/ui/button";
import { formatDateTime } from "#/lib/format";

interface LightboxProps {
  images: GalleryImage[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  albumTitle: string;
}

/**
 * Focused image viewer. Deliberately hand-rolled rather than a Dialog so the
 * image can fill the viewport while keeping keyboard paging cheap.
 */
export function Lightbox({ images, index, onIndexChange, onClose, albumTitle }: LightboxProps) {
  const open = index !== null && index >= 0 && index < images.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndexChange(((index as number) + 1) % images.length);
      if (event.key === "ArrowLeft") onIndexChange(((index as number) - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onClose, onIndexChange]);

  if (!open) return null;
  const image = images[index as number];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-surface-0"
      role="dialog"
      aria-modal="true"
      aria-label={`${albumTitle} image viewer`}
      data-testid="gallery-lightbox"
    >
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground" data-testid="gallery-lightbox-caption">
            {image.caption || "Untitled"}
          </p>
          <p className="num truncate text-xs text-muted-foreground">
            {albumTitle} · {(index as number) + 1} of {images.length} · {formatDateTime(image.uploadedAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {image.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/14 px-2 py-0.5 text-xs text-accent">
              <Star className="h-3 w-3" /> Cover
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close viewer"
            data-testid="gallery-lightbox-close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2"
          aria-label="Previous image"
          data-testid="gallery-lightbox-prev"
          onClick={() => onIndexChange(((index as number) - 1 + images.length) % images.length)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <img
          src={image.url}
          alt={image.caption}
          className="max-h-full max-w-full rounded-xl border border-hairline object-contain"
          data-testid="gallery-lightbox-image"
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2"
          aria-label="Next image"
          data-testid="gallery-lightbox-next"
          onClick={() => onIndexChange(((index as number) + 1) % images.length)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
