import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "../kit";
import { toast } from "sonner";

/**
 * Download affordance styled as an official document request:
 * label, monospaced file metadata, optional authenticity stamp.
 */
export const DownloadButton = ({
  label,
  meta,
  stamp,
  onDownload,
  testId,
  variant = "outline",
  size = "default",
  className = "",
  icon = "download",
}: {
  label: string;
  meta?: string;
  stamp?: string;
  onDownload: () => string;
  testId: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default";
  className?: string;
  icon?: "download" | "file";
}) => {
  const [busy, setBusy] = useState(false);
  const Icon = icon === "file" ? FileText : Download;

  const handleClick = () => {
    setBusy(true);
    try {
      const fileName = onDownload();
      toast.success("Document prepared", {
        description: fileName,
      });
    } catch {
      toast.error("Could not prepare the document", {
        description: "Please try again in a moment.",
      });
    } finally {
      window.setTimeout(() => setBusy(false), 350);
    }
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant={variant}
          onClick={handleClick}
          disabled={busy}
          data-testid={testId}
          className={[
            "gap-2 rounded-field font-medium transition-colors duration-fast",
            size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-sm",
            variant === "outline"
              ? "border-border bg-background hover:bg-secondary"
              : "",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {busy ? "Preparing…" : label}
        </Button>

        {stamp ? (
          <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            {stamp}
          </span>
        ) : null}
      </div>
      {meta ? <p className="t-meta mt-2">{meta}</p> : null}
    </div>
  );
};
