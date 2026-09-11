import type { AppNotification } from "@/types";
import { db, latency, persist, uid } from "@/lib/db";

export interface PushNotificationInput {
  kind: AppNotification["kind"];
  title: string;
  body: string;
  severity: AppNotification["severity"];
  href?: string;
  actorName?: string;
}

export function pushNotification(input: PushNotificationInput): AppNotification {
  const notification: AppNotification = {
    id: uid("ntf"),
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  db().notifications.unshift(notification);
  persist();
  return notification;
}

export async function listNotifications(filter: "all" | "unread" | AppNotification["kind"] = "all"): Promise<AppNotification[]> {
  await latency(180);
  const all = db().notifications;
  if (filter === "all") return all;
  if (filter === "unread") return all.filter((n) => !n.read);
  return all.filter((n) => n.kind === filter);
}

export async function unreadCount(): Promise<number> {
  await latency(120);
  return db().notifications.filter((n) => !n.read).length;
}

export async function markNotificationRead(id: string): Promise<void> {
  await latency(140);
  const notification = db().notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
  persist();
}

export async function markAllNotificationsRead(): Promise<number> {
  await latency(220);
  let count = 0;
  db().notifications.forEach((n) => {
    if (!n.read) {
      n.read = true;
      count += 1;
    }
  });
  persist();
  return count;
}

export async function clearNotification(id: string): Promise<void> {
  await latency(160);
  const index = db().notifications.findIndex((n) => n.id === id);
  if (index >= 0) db().notifications.splice(index, 1);
  persist();
}
