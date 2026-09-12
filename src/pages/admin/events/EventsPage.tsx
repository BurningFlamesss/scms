import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Eye,
  LayoutList,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { deleteEvent, listEvents, setEventStatus } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { FilterBar } from "#/components/common/FilterBar";
import { DataTable, type Column } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { CategoryChip, EVENT_CATEGORIES, EVENT_STATUSES } from "#/components/events/event-constants";
import { MonthCalendar } from "#/components/events/MonthCalendar";
import { EventFormDialog } from "#/components/events/EventFormDialog";
import { Button } from "#/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { formatDate, todayKey } from "#/lib/format";
import type { EventStatus, SchoolEvent } from "#/types";

function whenLabel(event: SchoolEvent): string {
  const range =
    event.startDate === event.endDate
      ? formatDate(event.startDate)
      : `${formatDate(event.startDate, { withYear: false })} – ${formatDate(event.endDate)}`;
  if (event.allDay) return `${range} · All day`;
  return `${range} · ${event.startTime ?? ""}–${event.endTime ?? ""}`;
}

export default function EventsPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SchoolEvent | null>(null);

  // Quick-create menu links here with ?new=1
  useEffect(() => {
    if (searchParams.new === "1") {
      setEditing(null);
      setFormOpen(true);
      navigate({
        search: (prev: Record<string, any>) => {
          const next = { ...prev };
          delete next.new;
          return next;
        },
        replace: true,
      });
    }
  }, [searchParams.new, navigate]);

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["events", { search, category, status }],
    queryFn: () => listEvents({ search, category, status }),
  });

  const dayEvents = useMemo(
    () => events.filter((event) => event.startDate <= selectedDate && event.endDate >= selectedDate),
    [events, selectedDate],
  );

  const upcoming = useMemo(() => {
    const today = todayKey();
    return events.filter((event) => event.endDate >= today && event.status !== "cancelled").length;
  }, [events]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["events"] });
    void qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: EventStatus }) => setEventStatus(vars.id, vars.status, actor),
    onSuccess: (event) => {
      toast.success(`“${event.title}” marked ${event.status}`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (event: SchoolEvent) => deleteEvent(event.id, actor),
    onSuccess: () => {
      toast.success("Event removed from the calendar");
      setPendingDelete(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openCreate = (date?: string) => {
    setEditing(null);
    if (date) setSelectedDate(date);
    setFormOpen(true);
  };

  const rowMenu = (event: SchoolEvent) => (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="row-actions h-7 w-7"
        aria-label="Open event"
        data-testid={`event-view-${event.id}`}
        onClick={() => navigate(`/admin/events/${event.id}`)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Event actions"
            data-testid={`event-menu-${event.id}`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover">
          <DropdownMenuItem
            className="gap-2 text-xs"
            data-testid={`event-action-open-${event.id}`}
            onClick={() => navigate(`/admin/events/${event.id}`)}
          >
            <Eye className="h-3.5 w-3.5" /> Open
          </DropdownMenuItem>
          {can("events.manage") && (
            <DropdownMenuItem
              className="gap-2 text-xs"
              data-testid={`event-action-edit-${event.id}`}
              onClick={() => {
                setEditing(event);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
          )}
          {can("events.manage") && event.status !== "completed" && (
            <DropdownMenuItem
              className="gap-2 text-xs"
              data-testid={`event-action-complete-${event.id}`}
              onClick={() => statusMutation.mutate({ id: event.id, status: "completed" })}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
            </DropdownMenuItem>
          )}
          {can("events.manage") && event.status !== "cancelled" && (
            <DropdownMenuItem
              className="gap-2 text-xs"
              data-testid={`event-action-cancel-${event.id}`}
              onClick={() => statusMutation.mutate({ id: event.id, status: "cancelled" })}
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel event
            </DropdownMenuItem>
          )}
          {can("events.manage") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive"
                data-testid={`event-action-delete-${event.id}`}
                onClick={() => setPendingDelete(event)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const columns: Column<SchoolEvent>[] = [
    {
      key: "title",
      header: "Event",
      render: (event) => (
        <div className="min-w-0">
          <Link
                      to={`/admin/events/${event.id}`}
            className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring"
            data-testid={`event-link-${event.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {event.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{event.organizerName}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (event) => <CategoryChip category={event.category} testId={`event-category-${event.id}`} />,
    },
    {
      key: "when",
      header: "When",
      render: (event) => (
        <span className="num text-xs text-foreground" data-testid={`event-when-${event.id}`}>
          {whenLabel(event)}
        </span>
      ),
    },
    {
      key: "location",
      header: "Venue",
      render: (event) => (
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{event.location}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (event) => <StatusBadge value={event.status} testId={`event-status-${event.id}`} />,
    },
    {
      key: "registrations",
      header: "Sign-ups",
      align: "right",
      render: (event) => (
        <span className="num text-xs text-muted-foreground">
          {event.registrationRequired ? `${event.registrationCount}${event.capacity ? ` / ${event.capacity}` : ""}` : "—"}
        </span>
      ),
    },
    { key: "actions", header: "", align: "right", render: rowMenu },
  ];

  return (
    <div data-testid="events-page">
      <PageHeader
        eyebrow="Communications"
        title="Events"
        description="Plan the school calendar — examinations, sports, cultural programmes, trips and meetings."
        meta={
          <>
            <span data-testid="events-count-total">{events.length} events</span>
            <span data-testid="events-count-upcoming">{upcoming} upcoming</span>
          </>
        }
        actions={
          <>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value: string) => value && setView(value as "list" | "calendar")}
              className="rounded-md border border-hairline bg-surface-1 p-0.5"
              data-testid="events-view-toggle"
            >
              <ToggleGroupItem value="list" className="h-7 gap-1.5 px-2.5 text-xs" data-testid="events-view-list">
                <LayoutList className="h-3.5 w-3.5" /> List
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" className="h-7 gap-1.5 px-2.5 text-xs" data-testid="events-view-calendar">
                <CalendarDays className="h-3.5 w-3.5" /> Calendar
              </ToggleGroupItem>
            </ToggleGroup>
            {can("events.manage") && (
              <Button size="sm" className="gap-1.5" data-testid="events-new" onClick={() => openCreate()}>
                <Plus className="h-3.5 w-3.5" /> New event
              </Button>
            )}
          </>
        }
      />

      <FilterBar
        testId="events-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search events by title, venue or organiser…"
        filters={[
          {
            key: "category",
            label: "Category",
            value: category,
            options: [{ value: "all", label: "All categories" }, ...EVENT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))],
            onChange: setCategory,
            width: "w-[160px]",
          },
          {
            key: "status",
            label: "Status",
            value: status,
            options: [{ value: "all", label: "All statuses" }, ...EVENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))],
            onChange: setStatus,
            width: "w-[150px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setCategory("all");
          setStatus("all");
        }}
      />

      {view === "list" ? (
        <DataTable<SchoolEvent>
          testId="events-table"
          columns={columns}
          rows={events}
          rowId={(event) => event.id}
          rowTestId={(event) => `event-row-${event.id}`}
          loading={isLoading}
          error={isError ? true : undefined}
          onRetry={() => void refetch()}
          onRowClick={(event) => navigate(`/admin/events/${event.id}`)}
          total={events.length}
          pageSize={events.length || 1}
          footNote={`${events.length} events on the calendar`}
          empty={
            <EmptyState
              icon={CalendarDays}
              title="No events match this view"
              description="Adjust the category or status filter, or schedule a new event for the school calendar."
              primaryLabel={can("events.manage") ? "New event" : undefined}
              onPrimary={() => openCreate()}
              testId="events-empty"
            />
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <Panel
            eyebrow="Agenda"
            title={formatDate(selectedDate)}
            description={`${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"} on this day`}
            testId="events-agenda"
            actions={
              can("events.manage") ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  data-testid="events-agenda-add"
                  onClick={() => openCreate(selectedDate)}
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Add
                </Button>
              ) : null
            }
          >
            {dayEvents.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarDays}
                title="Nothing scheduled"
                description="Pick another day in the calendar, or add an event to this date."
                primaryLabel={can("events.manage") ? "Add event" : undefined}
                onPrimary={() => openCreate(selectedDate)}
                testId="events-agenda-empty"
              />
            ) : (
              <ul className="space-y-2.5" data-testid="events-agenda-list">
                {dayEvents.map((event) => (
                  <li key={event.id} className="group">
                    <Link
            to={`/admin/events/${event.id}`}
                      data-testid={`events-agenda-item-${event.id}`}
                      className="block rounded-lg border border-hairline bg-surface-1 px-3 py-2.5 transition-colors duration-150 hover:border-primary/35 hover:bg-surface-2 focus-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-foreground">{event.title}</p>
                        <StatusBadge value={event.status} dot={false} className="shrink-0" />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="num inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`}
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <CategoryChip category={event.category} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editing}
        defaultDate={selectedDate}
        onSaved={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open: boolean) => !open && setPendingDelete(null)}
        title="Delete this event?"
        description={`“${pendingDelete?.title ?? ""}” will be removed from the calendar and the public website.`}
        confirmLabel="Delete event"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
        testId="event-delete-dialog"
      />
    </div>
  );
}
