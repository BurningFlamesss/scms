import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon } from "lucide-react";
import { auditActors, auditResourceTypes, listAudit } from "#/services/audit";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { Timeline } from "#/components/common/Timeline";
import { ListSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { ROLE_LABEL } from "#/lib/permissions";

const ACTIONS = [
  "created",
  "updated",
  "deleted",
  "published",
  "archived",
  "invited",
  "status_changed",
  "imported",
  "exported",
  "signed_in",
  "marked_attendance",
  "recorded_payment",
];

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [actorId, setActorId] = useState("all");
  const [resourceType, setResourceType] = useState("all");

  const actors = useMemo(() => auditActors(), []);
  const resources = useMemo(() => auditResourceTypes(), []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["audit", { search, action, actorId, resourceType }],
    queryFn: () => listAudit({ search, action, actorId, resourceType, limit: 120 }),
  });

  return (
    <div data-testid="activity-page">
      <PageHeader
        eyebrow="System"
        title="Activity"
        description="A chronological record of every administrative action: who did what, to which record, and when."
        meta={<span data-testid="activity-count">{events.length} entries</span>}
      />

      <FilterBar
        testId="activity-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by summary, actor or record…"
        filters={[
          { key: "action", label: "Action", value: action, options: toOptions(ACTIONS, "All actions"), onChange: setAction, width: "w-[165px]" },
          {
            key: "actor",
            label: "Actor",
            value: actorId,
            options: [{ value: "all", label: "All actors" }, ...actors.map((a) => ({ value: a.id, label: a.name }))],
            onChange: setActorId,
            width: "w-[170px]",
          },
          { key: "resource", label: "Record type", value: resourceType, options: toOptions(resources, "All records"), onChange: setResourceType, width: "w-[165px]" },
        ]}
        onReset={() => {
          setSearch("");
          setAction("all");
          setActorId("all");
          setResourceType("all");
        }}
      />

      <Panel title="Audit timeline" description="Grouped by day, newest first" testId="activity-panel">
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={ActivityIcon}
            title="No activity matches these filters"
            description="Try a different actor or action, or clear the filters to see the full history."
            primaryLabel="Clear filters"
            onPrimary={() => {
              setSearch("");
              setAction("all");
              setActorId("all");
              setResourceType("all");
            }}
            testId="activity-empty"
          />
        ) : (
          <Timeline
            groupByDay
            testId="activity-timeline"
            items={events.map((event) => ({
              id: event.id,
              title: event.summary,
              description: `${ROLE_LABEL[event.actorRole]} · ${event.resourceLabel}`,
              actor: event.actorName,
              at: event.createdAt,
              chip: event.resourceType.replace(/_/g, " "),
              tone:
                event.action === "deleted"
                  ? "negative"
                  : event.action === "published" || event.action === "created"
                    ? "positive"
                    : event.action === "invited" || event.action === "status_changed"
                      ? "accent"
                      : "neutral",
            }))}
          />
        )}
      </Panel>
    </div>
  );
}
