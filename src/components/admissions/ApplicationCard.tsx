import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { GripVertical, Star } from "lucide-react";
import type { Application } from "#/types";
import { SOURCE_LABEL, scoreTone } from "#/components/admissions/pipeline-constants";
import { relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";

interface ApplicationCardProps {
  application: Application;
  canManage: boolean;
}

export function ApplicationCard({ application, canManage }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    disabled: !canManage,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      data-testid={`admissions-card-${application.id}`}
      className={cn(
        "group rounded-lg border bg-surface-1 p-2.5 transition-colors duration-150",
        isDragging ? "z-20 border-primary/50 shadow-pop" : "border-hairline hover:border-primary/35",
      )}
    >
      <div className="flex items-start gap-2">
        <img
          src={application.avatarUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full border border-hairline object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={`/admissions/${application.id}`}
            className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring"
            data-testid={`admissions-card-link-${application.id}`}
          >
            {application.applicantName}
          </Link>
          <p className="num truncate font-mono text-[11px] text-muted-foreground">{application.applicationNo}</p>
        </div>
        {canManage && (
          <button
            type="button"
            aria-label={`Drag ${application.applicantName}`}
            data-testid={`admissions-card-drag-${application.id}`}
            className="shrink-0 cursor-grab rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing focus-ring"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-hairline px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {application.gradeApplied}
        </span>
        <span className="rounded-full border border-hairline px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {SOURCE_LABEL[application.source] ?? application.source}
        </span>
        {application.entranceScore !== undefined && (
          <span
            className={cn("num inline-flex items-center gap-1 text-[11px] font-semibold", scoreTone(application.entranceScore))}
            data-testid={`admissions-card-score-${application.id}`}
          >
            <Star className="h-3 w-3" /> {application.entranceScore}
          </span>
        )}
      </div>

      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
        {application.guardian.name} · {relativeTime(application.submittedAt)}
      </p>
    </li>
  );
}
