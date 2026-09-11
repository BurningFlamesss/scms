import { useDroppable } from "@dnd-kit/core";
import { Inbox } from "lucide-react";
import type { Application, ApplicationStatus } from "#/types";
import { ApplicationCard } from "#/components/admissions/ApplicationCard";
import { PIPELINE } from "#/components/admissions/pipeline-constants";
import { cn } from "#/lib/utils";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  canManage: boolean;
  highlighted: boolean;
}

function KanbanColumn({ status, applications, canManage, highlighted }: KanbanColumnProps) {
  const stage = PIPELINE.find((item) => item.status === status)!;
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      data-testid={`admissions-column-${status}`}
      className={cn(
        "flex min-w-[248px] flex-1 flex-col rounded-xl border bg-surface-2/60 transition-colors duration-150",
        isOver ? "border-primary/60 bg-primary/6" : highlighted ? "border-primary/40" : "border-hairline",
      )}
    >
      <header className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
        <span className={cn("h-4 w-[3px] rounded-full", stage.rail)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{stage.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{stage.hint}</p>
        </div>
        <span
          className={cn("num rounded-full px-2 py-0.5 text-[11px] font-semibold text-foreground", stage.tint)}
          data-testid={`admissions-column-count-${status}`}
        >
          {applications.length}
        </span>
      </header>

      <ul className="flex max-h-[620px] flex-1 flex-col gap-2 overflow-y-auto p-2">
        {applications.map((application) => (
          <ApplicationCard key={application.id} application={application} canManage={canManage} />
        ))}
        {applications.length === 0 && (
          <li className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3 py-8 text-center">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">
              {canManage ? "Drop an application here" : "Nothing in this stage"}
            </p>
          </li>
        )}
      </ul>
    </section>
  );
}

interface KanbanBoardProps {
  applications: Application[];
  canManage: boolean;
  highlightStatus?: string;
}

export function KanbanBoard({ applications, canManage, highlightStatus }: KanbanBoardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2" data-testid="admissions-kanban">
      {PIPELINE.map((stage) => (
        <KanbanColumn
          key={stage.status}
          status={stage.status}
          applications={applications.filter((application) => application.status === stage.status)}
          canManage={canManage}
          highlighted={highlightStatus === stage.status}
        />
      ))}
    </div>
  );
}
