import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  PlayCircle,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { deleteEvent, getEvent, setEventStatus } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { KeyValue, Panel } from "#/components/common/Panel";
import { StatusBadge } from "#/components/common/StatusBadge";
import { EmptyState } from "#/components/common/EmptyState";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { CategoryChip } from "#/components/events/event-constants";
import { EventFormDialog } from "#/components/events/EventFormDialog";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";
import { formatDate, formatNumber, relativeTime } from "#/lib/format";
import type { EventStatus } from "#/types";

export default function EventDetailPage() {
  const { id = "" } = useParams();
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["events"] });
    void qc.invalidateQueries({ queryKey: ["event", id] });
    void qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: EventStatus) => setEventStatus(id, status, actor),
    onSuccess: (updated) => {
      toast.success(`“${updated.title}” marked ${updated.status}`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id, actor),
    onSuccess: () => {
      toast.success("Event removed from the calendar");
      invalidate();
      navigate("/admin/events");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <DetailSkeleton />;

  if (!event) {
    return (
      <div className="panel" data-testid="event-not-found">
        <EmptyState
          icon={CalendarDays}
          title="That event no longer exists"
          description="It may have been deleted. Return to the calendar to see everything that is scheduled."
          primaryLabel="Back to events"
          onPrimary={() => navigate("/admin/events")}
          testId="event-not-found-empty"
        />
      </div>
    );
  }

  const fill = event.capacity ? Math.min(100, Math.round((event.registrationCount / event.capacity) * 100)) : 0;
  const totalParticipants = event.participants.reduce((sum, group) => sum + group.count, 0);

  return (
    <div data-testid="event-detail-page">
      <PageHeader
        eyebrow="Event"
        title={event.title}
        description={event.description}
        meta={
          <>
            <CategoryChip category={event.category} testId="event-detail-category" />
            <StatusBadge value={event.status} testId="event-detail-status" />
            <span className="num inline-flex items-center gap-1.5" data-testid="event-detail-when">
              <CalendarDays className="h-3 w-3" />
              {event.startDate === event.endDate
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate, { withYear: false })} – ${formatDate(event.endDate)}`}
            </span>
            <span className="num inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`}
            </span>
            <span className="inline-flex items-center gap-1.5" data-testid="event-detail-location">
              <MapPin className="h-3 w-3" /> {event.location}
            </span>
          </>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/admin/events" data-testid="event-detail-back">
                <ArrowLeft className="h-3.5 w-3.5" /> All events
              </Link>
            </Button>
            {can("events.manage") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                data-testid="event-detail-edit"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
            {can("events.manage") && event.status !== "ongoing" && event.status !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={statusMutation.isPending}
                data-testid="event-detail-start"
                onClick={() => statusMutation.mutate("ongoing")}
              >
                <PlayCircle className="h-3.5 w-3.5" /> Mark ongoing
              </Button>
            )}
            {can("events.manage") && event.status !== "completed" && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={statusMutation.isPending}
                data-testid="event-detail-complete"
                onClick={() => statusMutation.mutate("completed")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
              </Button>
            )}
            {can("events.manage") && event.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive"
                disabled={statusMutation.isPending}
                data-testid="event-detail-cancel"
                onClick={() => statusMutation.mutate("cancelled")}
              >
                <XCircle className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
            {can("events.manage") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                aria-label="Delete event"
                data-testid="event-detail-delete"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {event.coverImage && (
            <img
              src={event.coverImage}
              alt=""
              className="aspect-[21/9] w-full rounded-xl border border-hairline object-cover"
              data-testid="event-detail-cover"
            />
          )}

          <Panel title="About this event" testId="event-detail-about">
            <p className="text-sm leading-relaxed text-muted-foreground" data-testid="event-detail-description">
              {event.description || "No description was added for this event."}
            </p>
          </Panel>

          <Panel title="Participants" description={`${formatNumber(totalParticipants)} people expected`} testId="event-detail-participants">
            {event.participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No participant groups have been assigned yet.</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {event.participants.map((group) => (
                  <li
                    key={group.label}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    data-testid={`event-participant-${group.label}`}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{group.label}</span>
                    </span>
                    <span className="num text-sm font-medium text-foreground">{formatNumber(group.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Details" testId="event-detail-meta">
            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Organiser" value={event.organizerName} />
              <KeyValue label="Category" value={<CategoryChip category={event.category} />} />
              <KeyValue label="Starts" value={formatDate(event.startDate)} />
              <KeyValue label="Ends" value={formatDate(event.endDate)} />
              <KeyValue label="Timing" value={event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`} />
              <KeyValue label="Venue" value={event.location} />
              <KeyValue label="Created" value={relativeTime(event.createdAt)} />
              <KeyValue label="Updated" value={relativeTime(event.updatedAt)} />
            </dl>
          </Panel>

          <Panel title="Registration" testId="event-detail-registration">
            {event.registrationRequired ? (
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="num font-display text-2xl font-semibold text-foreground" data-testid="event-registration-count">
                    {formatNumber(event.registrationCount)}
                  </p>
                  {event.capacity && (
                    <p className="num text-xs text-muted-foreground">of {formatNumber(event.capacity)} places</p>
                  )}
                </div>
                {event.capacity ? (
                  <>
                    <Progress value={fill} className="h-1.5" />
                    <p className="num text-[11px] text-muted-foreground">{fill}% of capacity filled</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No capacity limit set for this event.</p>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Registration is not required — the whole school community can attend.
              </p>
            )}
          </Panel>
        </div>
      </div>

      <EventFormDialog open={editOpen} onOpenChange={setEditOpen} event={event} />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this event?"
        description={`“${event.title}” will be removed from the calendar permanently.`}
        confirmLabel="Delete event"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        testId="event-detail-delete-dialog"
      />
    </div>
  );
}
