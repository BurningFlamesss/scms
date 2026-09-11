import type {
  Actor,
  Album,
  AudienceTarget,
  EventCategory,
  EventStatus,
  GalleryImage,
  Notice,
  NoticePriority,
  NoticeStatus,
  Paginated,
  SchoolEvent,
} from "@/types";
import { db, latency, matches, nowIso, paginate, persist, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { pushNotification } from "@/services/notifications";
import { photoFor, todayKey } from "@/lib/format";

// -------------------------------------------------------------------- notices

export interface NoticeQuery {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}

export async function listNotices(query: NoticeQuery = {}): Promise<Paginated<Notice>> {
  await latency(240);
  const { search = "", status = "all", priority = "all", page = 1, pageSize = 8 } = query;
  const filtered = db()
    .notices.filter((n) => {
      if (!matches(search, n.title, n.summary, n.authorName)) return false;
      if (status !== "all" && n.status !== status) return false;
      if (priority !== "all" && n.priority !== priority) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.publishAt < b.publishAt ? 1 : -1;
    });
  return paginate(filtered, page, pageSize);
}

export async function getNotice(id: string): Promise<Notice | null> {
  await latency(200);
  return db().notices.find((n) => n.id === id) ?? null;
}

export function noticeCounts() {
  const notices = db().notices;
  return {
    all: notices.length,
    published: notices.filter((n) => n.status === "published").length,
    scheduled: notices.filter((n) => n.status === "scheduled").length,
    draft: notices.filter((n) => n.status === "draft").length,
    archived: notices.filter((n) => n.status === "archived").length,
  };
}

export interface NoticeInput {
  title: string;
  summary: string;
  content: string;
  featuredImage?: string;
  audience: AudienceTarget[];
  priority: NoticePriority;
  status: NoticeStatus;
  publishAt: string;
  expiresAt?: string;
  pinned: boolean;
}

export async function createNotice(input: NoticeInput, actor: Actor): Promise<Notice> {
  await latency(460);
  const notice: Notice = {
    id: uid("not"),
    ...input,
    attachments: [],
    authorId: actor.id,
    authorName: actor.name,
    views: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db().notices.unshift(notice);
  persist();
  recordAudit({
    actor,
    action: input.status === "published" ? "published" : "created",
    resourceType: "notice",
    resourceId: notice.id,
    resourceLabel: notice.title,
    summary:
      input.status === "published"
        ? `Published notice “${notice.title}”`
        : `Created a ${input.status} notice “${notice.title}”`,
  });
  if (input.status === "published") {
    pushNotification({
      kind: "notice",
      title: "Notice published",
      body: `“${notice.title}” is now visible to ${notice.audience.map((a) => a.label).join(", ")}.`,
      severity: "success",
      href: `/notices/${notice.id}`,
      actorName: actor.name,
    });
  }
  return notice;
}

export async function updateNotice(id: string, patch: Partial<Notice>, actor: Actor): Promise<Notice> {
  await latency(400);
  const notice = db().notices.find((n) => n.id === id);
  if (!notice) throw new Error("Notice not found");
  Object.assign(notice, patch, { updatedAt: nowIso() });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "notice",
    resourceId: notice.id,
    resourceLabel: notice.title,
    summary: `Updated notice “${notice.title}”`,
  });
  return notice;
}

export async function setNoticeStatus(id: string, status: NoticeStatus, actor: Actor): Promise<Notice> {
  await latency(340);
  const notice = db().notices.find((n) => n.id === id);
  if (!notice) throw new Error("Notice not found");
  notice.status = status;
  notice.updatedAt = nowIso();
  if (status === "published") notice.publishAt = nowIso();
  persist();
  recordAudit({
    actor,
    action: status === "published" ? "published" : status === "archived" ? "archived" : "status_changed",
    resourceType: "notice",
    resourceId: notice.id,
    resourceLabel: notice.title,
    summary: `${status === "published" ? "Published" : status === "archived" ? "Archived" : `Moved to ${status}`} notice “${notice.title}”`,
  });
  if (status === "published") {
    pushNotification({
      kind: "notice",
      title: "Notice published",
      body: `“${notice.title}” is now live.`,
      severity: "success",
      href: `/notices/${notice.id}`,
      actorName: actor.name,
    });
  }
  return notice;
}

export async function deleteNotice(id: string, actor: Actor): Promise<void> {
  await latency(300);
  const index = db().notices.findIndex((n) => n.id === id);
  if (index === -1) return;
  const [removed] = db().notices.splice(index, 1);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "notice",
    resourceId: removed.id,
    resourceLabel: removed.title,
    summary: `Deleted notice “${removed.title}”`,
  });
}

export function audienceOptions(): AudienceTarget[] {
  const grades = Array.from(new Set(db().classes.map((c) => c.grade)));
  return [
    { kind: "everyone", label: "Everyone" },
    { kind: "students", label: "Students" },
    { kind: "guardians", label: "Guardians" },
    { kind: "staff", label: "Staff" },
    ...grades.map((g) => ({ kind: "grade" as const, value: g, label: g })),
    ...db().classes.slice(0, 12).map((c) => ({ kind: "class" as const, value: c.id, label: c.name })),
  ];
}

export function audienceReach(audience: AudienceTarget[]): number {
  const students = db().students.filter((s) => s.status === "active");
  const staffCount = db().staff.filter((s) => s.employmentStatus === "active").length;
  let reach = 0;
  audience.forEach((target) => {
    if (target.kind === "everyone") reach += students.length * 2 + staffCount;
    if (target.kind === "students") reach += students.length;
    if (target.kind === "guardians") reach += students.length;
    if (target.kind === "staff") reach += staffCount;
    if (target.kind === "grade") reach += students.filter((s) => s.grade === target.value).length;
    if (target.kind === "class") reach += students.filter((s) => s.classId === target.value).length;
  });
  return reach;
}

// --------------------------------------------------------------------- events

export interface EventQuery {
  search?: string;
  category?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function listEvents(query: EventQuery = {}): Promise<SchoolEvent[]> {
  await latency(240);
  const { search = "", category = "all", status = "all", from, to } = query;
  return db()
    .events.filter((e) => {
      if (!matches(search, e.title, e.location, e.organizerName)) return false;
      if (category !== "all" && e.category !== category) return false;
      if (status !== "all" && e.status !== status) return false;
      if (from && e.endDate < from) return false;
      if (to && e.startDate > to) return false;
      return true;
    })
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
}

export async function getEvent(id: string): Promise<SchoolEvent | null> {
  await latency(200);
  return db().events.find((e) => e.id === id) ?? null;
}

export async function upcomingEvents(limit = 5): Promise<SchoolEvent[]> {
  await latency(180);
  const today = todayKey();
  return db()
    .events.filter((e) => e.startDate >= today && e.status !== "cancelled" && e.status !== "draft")
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
    .slice(0, limit);
}

export interface EventInput {
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  location: string;
  registrationRequired: boolean;
  capacity?: number;
  coverImage?: string;
}

export async function createEvent(input: EventInput, actor: Actor): Promise<SchoolEvent> {
  await latency(440);
  const event: SchoolEvent = {
    id: uid("evt"),
    ...input,
    coverImage: input.coverImage || photoFor(`event-new-${Date.now()}`, 1400, 700),
    organizerId: actor.id,
    organizerName: actor.name,
    participants: [{ label: "All grades", count: 0 }],
    registrationCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db().events.unshift(event);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "event",
    resourceId: event.id,
    resourceLabel: event.title,
    summary: `Created event “${event.title}” on ${event.startDate}`,
  });
  pushNotification({
    kind: "event",
    title: "Event created",
    body: `${event.title} · ${event.location}`,
    severity: "info",
    href: `/events/${event.id}`,
    actorName: actor.name,
  });
  return event;
}

export async function updateEvent(id: string, patch: Partial<SchoolEvent>, actor: Actor): Promise<SchoolEvent> {
  await latency(380);
  const event = db().events.find((e) => e.id === id);
  if (!event) throw new Error("Event not found");
  Object.assign(event, patch, { updatedAt: nowIso() });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "event",
    resourceId: event.id,
    resourceLabel: event.title,
    summary: `Updated event “${event.title}”`,
  });
  return event;
}

export async function setEventStatus(id: string, status: EventStatus, actor: Actor): Promise<SchoolEvent> {
  await latency(320);
  const event = db().events.find((e) => e.id === id);
  if (!event) throw new Error("Event not found");
  event.status = status;
  event.updatedAt = nowIso();
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "event",
    resourceId: event.id,
    resourceLabel: event.title,
    summary: `Set “${event.title}” to ${status}`,
  });
  return event;
}

export async function deleteEvent(id: string, actor: Actor): Promise<void> {
  await latency(300);
  const index = db().events.findIndex((e) => e.id === id);
  if (index === -1) return;
  const [removed] = db().events.splice(index, 1);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "event",
    resourceId: removed.id,
    resourceLabel: removed.title,
    summary: `Deleted event “${removed.title}”`,
  });
}

// -------------------------------------------------------------------- gallery

export async function listAlbums(search = ""): Promise<Album[]> {
  await latency(240);
  return db().albums.filter((a) => matches(search, a.title, a.description));
}

export async function getAlbum(id: string): Promise<Album | null> {
  await latency(200);
  return db().albums.find((a) => a.id === id) ?? null;
}

export interface AlbumInput {
  title: string;
  description: string;
  visibility: Album["visibility"];
  eventId?: string;
}

export async function createAlbum(input: AlbumInput, actor: Actor): Promise<Album> {
  await latency(400);
  const album: Album = {
    id: uid("alb"),
    ...input,
    images: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db().albums.unshift(album);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "album",
    resourceId: album.id,
    resourceLabel: album.title,
    summary: `Created gallery album “${album.title}”`,
  });
  return album;
}

export async function updateAlbum(id: string, patch: Partial<Album>, actor: Actor): Promise<Album> {
  await latency(320);
  const album = db().albums.find((a) => a.id === id);
  if (!album) throw new Error("Album not found");
  Object.assign(album, patch, { updatedAt: nowIso() });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "album",
    resourceId: album.id,
    resourceLabel: album.title,
    summary: `Updated album “${album.title}”`,
  });
  return album;
}

export async function deleteAlbum(id: string, actor: Actor): Promise<void> {
  await latency(300);
  const index = db().albums.findIndex((a) => a.id === id);
  if (index === -1) return;
  const [removed] = db().albums.splice(index, 1);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "album",
    resourceId: removed.id,
    resourceLabel: removed.title,
    summary: `Deleted album “${removed.title}”`,
  });
}

export async function addAlbumImages(
  albumId: string,
  items: { url: string; caption: string }[],
  actor: Actor,
): Promise<Album> {
  await latency(520);
  const album = db().albums.find((a) => a.id === albumId);
  if (!album) throw new Error("Album not found");
  items.forEach((item, i) => {
    const image: GalleryImage = {
      id: uid("img"),
      url: item.url,
      caption: item.caption,
      order: album.images.length + i,
      featured: album.images.length === 0 && i === 0,
      uploadedAt: nowIso(),
    };
    album.images.push(image);
    if (!album.coverImageId) album.coverImageId = image.id;
  });
  album.updatedAt = nowIso();
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "album",
    resourceId: album.id,
    resourceLabel: album.title,
    summary: `Uploaded ${items.length} image${items.length === 1 ? "" : "s"} to “${album.title}”`,
  });
  return album;
}

export async function updateAlbumImage(
  albumId: string,
  imageId: string,
  patch: Partial<GalleryImage>,
): Promise<Album> {
  await latency(240);
  const album = db().albums.find((a) => a.id === albumId);
  if (!album) throw new Error("Album not found");
  const image = album.images.find((i) => i.id === imageId);
  if (!image) throw new Error("Image not found");
  Object.assign(image, patch);
  album.updatedAt = nowIso();
  persist();
  return album;
}

export async function deleteAlbumImage(albumId: string, imageId: string): Promise<Album> {
  await latency(260);
  const album = db().albums.find((a) => a.id === albumId);
  if (!album) throw new Error("Album not found");
  album.images = album.images.filter((i) => i.id !== imageId).map((img, i) => ({ ...img, order: i }));
  if (album.coverImageId === imageId) album.coverImageId = album.images[0]?.id;
  album.updatedAt = nowIso();
  persist();
  return album;
}

export async function reorderAlbumImages(albumId: string, orderedIds: string[]): Promise<Album> {
  await latency(200);
  const album = db().albums.find((a) => a.id === albumId);
  if (!album) throw new Error("Album not found");
  album.images = orderedIds
    .map((id, index) => {
      const image = album.images.find((i) => i.id === id);
      return image ? { ...image, order: index } : null;
    })
    .filter(Boolean) as GalleryImage[];
  album.updatedAt = nowIso();
  persist();
  return album;
}

export async function setAlbumCover(albumId: string, imageId: string): Promise<Album> {
  await latency(200);
  const album = db().albums.find((a) => a.id === albumId);
  if (!album) throw new Error("Album not found");
  album.coverImageId = imageId;
  album.images = album.images.map((i) => ({ ...i, featured: i.id === imageId }));
  album.updatedAt = nowIso();
  persist();
  return album;
}
