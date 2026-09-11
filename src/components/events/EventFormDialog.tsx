import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEvent, updateEvent, type EventInput } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { ImageUploader } from "#/components/common/ImageUploader";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "#/components/events/event-constants";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Switch } from "#/components/ui/switch";
import { Separator } from "#/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { ScrollArea } from "#/components/ui/scroll-area";
import { todayKey } from "#/lib/format";
import type { EventCategory, EventStatus, SchoolEvent } from "#/types";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: SchoolEvent | null;
  defaultDate?: string;
  onSaved?: (event: SchoolEvent) => void;
}

function emptyForm(defaultDate: string): EventInput {
  return {
    title: "",
    description: "",
    category: "program",
    status: "scheduled",
    startDate: defaultDate,
    endDate: defaultDate,
    allDay: true,
    startTime: "09:00",
    endTime: "12:00",
    location: "",
    registrationRequired: false,
    capacity: undefined,
    coverImage: undefined,
  };
}

export function EventFormDialog({ open, onOpenChange, event, defaultDate, onSaved }: EventFormDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<EventInput>(emptyForm(defaultDate ?? todayKey()));

  useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        category: event.category,
        status: event.status,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        startTime: event.startTime ?? "09:00",
        endTime: event.endTime ?? "12:00",
        location: event.location,
        registrationRequired: event.registrationRequired,
        capacity: event.capacity,
        coverImage: event.coverImage,
      });
    } else {
      setForm(emptyForm(defaultDate ?? todayKey()));
    }
  }, [open, event, defaultDate]);

  const patch = (next: Partial<EventInput>) => setForm((current) => ({ ...current, ...next }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: EventInput = {
        ...form,
        endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
        startTime: form.allDay ? undefined : form.startTime,
        endTime: form.allDay ? undefined : form.endTime,
      };
      if (event) return updateEvent(event.id, payload, actor);
      return createEvent(payload, actor);
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: ["events"] });
      void qc.invalidateQueries({ queryKey: ["event", saved.id] });
      void qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success(event ? `“${saved.title}” updated` : `“${saved.title}” added to the calendar`);
      onOpenChange(false);
      onSaved?.(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const invalid = !form.title.trim() || !form.location.trim() || !form.startDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] bg-popover p-0 sm:max-w-2xl" data-testid="event-form-dialog">
        <DialogHeader className="border-b border-hairline px-5 py-4">
          <DialogTitle className="font-display">{event ? "Edit event" : "Schedule an event"}</DialogTitle>
          <DialogDescription>
            Events appear on the school calendar and can be featured on the public website.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[62vh]">
          <div className="grid gap-3.5 px-5 py-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs" htmlFor="event-title">
                Event title *
              </Label>
              <Input
                id="event-title"
                value={form.title}
                placeholder="e.g. Inter-house athletics meet"
                data-testid="event-title-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value: string) => patch({ category: value as EventCategory })}
              >
                <SelectTrigger data-testid="event-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-xs">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(value: string) => patch({ status: value as EventStatus })}>
                <SelectTrigger data-testid="event-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {EVENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-xs">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="event-start-date">
                Starts *
              </Label>
              <Input
                id="event-start-date"
                type="date"
                value={form.startDate}
                data-testid="event-start-date"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patch({
                    startDate: e.target.value,
                    endDate: form.endDate < e.target.value ? e.target.value : form.endDate,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="event-end-date">
                Ends
              </Label>
              <Input
                id="event-end-date"
                type="date"
                value={form.endDate}
                data-testid="event-end-date"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ endDate: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5 sm:col-span-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">All-day event</p>
                <p className="text-[11px] text-muted-foreground">Turn off to set a start and end time</p>
              </div>
              <Switch
                checked={form.allDay}
                onCheckedChange={(checked: boolean) => patch({ allDay: checked })}
                aria-label="All-day event"
                data-testid="event-all-day-switch"
              />
            </div>

            {!form.allDay && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs" htmlFor="event-start-time">
                    Start time
                  </Label>
                  <Input
                    id="event-start-time"
                    type="time"
                    value={form.startTime ?? ""}
                    data-testid="event-start-time"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" htmlFor="event-end-time">
                    End time
                  </Label>
                  <Input
                    id="event-end-time"
                    type="time"
                    value={form.endTime ?? ""}
                    data-testid="event-end-time"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ endTime: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs" htmlFor="event-location">
                Venue *
              </Label>
              <Input
                id="event-location"
                value={form.location}
                placeholder="e.g. Main sports ground"
                data-testid="event-location-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ location: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs" htmlFor="event-description">
                Description
              </Label>
              <Textarea
                id="event-description"
                rows={3}
                value={form.description}
                placeholder="What is happening, who should attend and what to bring."
                data-testid="event-description-input"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })}
              />
            </div>

            <Separator className="sm:col-span-2" />

            <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">Registration required</p>
                <p className="text-[11px] text-muted-foreground">Track sign-ups against capacity</p>
              </div>
              <Switch
                checked={form.registrationRequired}
                onCheckedChange={(checked: boolean) => patch({ registrationRequired: checked })}
                aria-label="Registration required"
                data-testid="event-registration-switch"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="event-capacity">
                Capacity
              </Label>
              <Input
                id="event-capacity"
                type="number"
                min={0}
                value={form.capacity ?? ""}
                placeholder="Unlimited"
                data-testid="event-capacity-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patch({ capacity: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                value={form.coverImage}
                onChange={(url: string | undefined) => patch({ coverImage: url })}
                label="Cover image (optional)"
                testId="event-cover-uploader"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-hairline px-5 py-3.5">
          <Button variant="outline" data-testid="event-form-cancel" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid="event-form-save"
            disabled={invalid || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : event ? "Save changes" : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
