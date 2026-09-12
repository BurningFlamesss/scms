import type { LucideIcon } from "lucide-react";
import { ArrowLeft, CircleDashed, Hammer } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { Button } from "#/components/ui/button";

export interface PlaceholderStat {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stats?: PlaceholderStat[];
  capabilities: string[];
  backTo?: { label: string; to: string };
  testId: string;
}

/**
 * Interim surface for modules whose data layer is already seeded but whose
 * workspace UI is scheduled for the next build pass. It intentionally shows
 * real numbers from the mock repository so the module never feels empty.
 */
export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats = [],
  capabilities,
  backTo,
  testId,
}: ModulePlaceholderProps) {
  return (
    <div data-testid={testId}>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        testId={`${testId}-header`}
        meta={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent" data-testid={`${testId}-status-chip`}>
            <Hammer className="h-3 w-3" /> Workspace UI scheduled next
          </span>
        }
        actions={
          backTo ? (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={backTo.to} data-testid={`${testId}-back`}>
                <ArrowLeft className="h-3.5 w-3.5" /> {backTo.label}
              </Link>
            </Button>
          ) : null
        }
      />

      {stats.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4" data-testid={`${testId}-stats`}>
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-lg border border-hairline bg-surface-1 px-3 py-2.5"
              data-testid={`${testId}-stat-${stat.key}`}
            >
              <p className="truncate text-[11px] font-medium text-muted-foreground">{stat.label}</p>
              <p className="num mt-1 font-display text-lg font-semibold leading-none text-foreground">{stat.value}</p>
              {stat.hint && <p className="mt-1 truncate text-[11px] text-muted-foreground">{stat.hint}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          eyebrow="Planned"
          title="What this workspace will do"
          description="Data is already seeded — only the screens are pending"
          testId={`${testId}-capabilities`}
        >
          <ul className="space-y-2.5">
            {capabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2.5 text-sm text-foreground">
                <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="leading-relaxed text-muted-foreground">{capability}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel eyebrow="Context" title="Why you're seeing this" testId={`${testId}-note`}>
          <div className="flex flex-col items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-surface-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This build focused on the five priority modules: Overview, Website Content, Notices, Events and Students.
              This module keeps its route, permissions and seeded records so the rest of the product stays coherent.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/overview" data-testid={`${testId}-to-overview`}>
                Back to Overview
              </Link>
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
