import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  CreditCard,
  GraduationCap,
  Info,
  Mail,
  Megaphone,
  Server,
  UserPlus,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import { Button } from "#/components/ui/button";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Skeleton } from "#/components/ui/skeleton";
import {
  clearNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "#/services/notifications";
import { dayLabel, relativeTime } from "#/lib/format";
import type { AppNotification } from "#/types";
import { cn } from "#/lib/utils";

const KIND_ICON: Record<AppNotification["kind"], typeof Bell> = {
  admission: GraduationCap,
  user: UserPlus,
  attendance: AlertTriangle,
  event: CalendarDays,
  notice: Megaphone,
  invitation: Mail,
  payment: CreditCard,
  system: Server,
};

const SEVERITY_STYLE: Record<AppNotification["severity"], string> = {
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  critical: "bg-destructive/12 text-destructive",
};

const FILTERS: { key: "all" | "unread" | AppNotification["kind"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "admission", label: "Admissions" },
  { key: "attendance", label: "Attendance" },
  { key: "payment", label: "Payments" },
  { key: "system", label: "System" },
];

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => listNotifications(filter),
    enabled: open,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
  const clear = useMutation({ mutationFn: clearNotification, onSuccess: invalidate });

  const groups = (notifications ?? []).reduce<Record<string, AppNotification[]>>((acc, item) => {
    const key = item.createdAt.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-hairline bg-white p-0 sm:max-w-md"
        data-testid="notification-center"
      >
        <SheetHeader className="border-b border-hairline px-5 py-4 text-left">
          <SheetTitle className="font-display text-base">Notifications</SheetTitle>
          <SheetDescription className="text-xs">
            Operational alerts across admissions, attendance, finance and the website.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-hairline px-4 py-2.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              data-testid={`notification-filter-${item.key}`}
              onClick={() => setFilter(item.key)}
              className={cn(
                "whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors focus-ring",
                filter === item.key
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-hairline text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto shrink-0 gap-1.5 text-xs"
            data-testid="notifications-mark-all-read"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 py-3">
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}

            {!isLoading && (notifications ?? []).length === 0 && (
              <div className="py-16 text-center" data-testid="notifications-empty">
                <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-secondary">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </span>
                <p className="text-sm font-medium text-foreground">Nothing here</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {filter === "unread" ? "You're all caught up." : "Notifications will appear as the school day unfolds."}
                </p>
              </div>
            )}

            {Object.entries(groups).map(([day, items]) => (
              <div key={day} className="mb-4">
                <p className="eyebrow-label mb-2">{dayLabel(day)}</p>
                <ul className="space-y-1.5">
                  {items.map((item) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "group relative rounded-lg border border-hairline bg-white p-3 transition-colors hover:bg-gray-100",
                          !item.read && "border-l-2 border-l-primary",
                        )}
                        data-testid="notification-item"
                      >
                        <div className="flex gap-3">
                          <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md", SEVERITY_STYLE[item.severity])}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{relativeTime(item.createdAt)}</span>
                              {item.actorName && <span>· {item.actorName}</span>}
                              {item.href && (
                                <button
                                  type="button"
                                  className="ml-auto text-primary hover:underline"
                                  data-testid="notification-open"
                                  onClick={() => {
                                    markRead.mutate(item.id);
                                    onOpenChange(false);
                                    navigate(item.href as string);
                                  }}
                                >
                                  Open
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="row-actions flex flex-col gap-1">
                            {!item.read && (
                              <button
                                type="button"
                                aria-label="Mark as read"
                                data-testid="notification-mark-read"
                                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                onClick={() => markRead.mutate(item.id)}
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label="Dismiss"
                              data-testid="notification-dismiss"
                              className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              onClick={() => clear.mutate(item.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
