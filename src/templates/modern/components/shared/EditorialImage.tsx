import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "../kit";

type Ratio = "feature" | "wide" | "square" | "portrait";

const RATIO_CLASS: Record<Ratio, string> = {
  feature: "aspect-[16/10]",
  wide: "aspect-[16/9]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
};

/**
 * Image with genuine loading and error states, a warm tonal overlay,
 * and an optional monospaced caption under a hairline.
 */
export const EditorialImage = ({
  src,
  alt,
  ratio = "feature",
  caption,
  className = "",
  imageClassName = "",
  testId,
  onClick,
}: {
  src: string;
  alt: string;
  ratio?: Ratio;
  caption?: string;
  className?: string;
  imageClassName?: string;
  testId?: string;
  onClick?: () => void;
}) => {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const frame = (
    <div
      className={`relative overflow-hidden rounded-card border border-border bg-secondary ${RATIO_CLASS[ratio]} ${className}`}
    >
      {state === "loading" ? (
        <Skeleton
          className="absolute inset-0 rounded-none"
          data-testid="loading-skeleton"
        />
      ) : null}

      {state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
          <ImageOff className="h-5 w-5" aria-hidden="true" />
          <span className="t-caption">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          className={`h-full w-full object-cover transition-opacity duration-slow ${
            state === "ready" ? "opacity-100" : "opacity-0"
          } ${imageClassName}`}
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#FEF2F2]-1/10 mix-blend-multiply dark:bg-transparent"
      />
    </div>
  );

  return (
    <figure data-testid={testId} className="min-w-0">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`Open larger view: ${alt}`}
          className="group block w-full cursor-zoom-in rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {frame}
        </button>
      ) : (
        frame
      )}
      {caption ? (
        <figcaption className="mt-3 flex items-start gap-2.5 border-t border-rule-soft pt-2.5">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span className="t-meta leading-relaxed">{caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
};
