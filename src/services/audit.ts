import type { Actor, AuditAction, AuditEvent } from "@/types";
import { db, latency, persist, uid } from "@/lib/db";

export interface RecordAuditInput {
  actor: Actor;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  resourceLabel: string;
  summary: string;
}

/** Synchronous on purpose: every mutation writes its own audit trail. */
export function recordAudit(input: RecordAuditInput): AuditEvent {
  const event: AuditEvent = {
    id: uid("aud"),
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorRole: input.actor.role,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    resourceLabel: input.resourceLabel,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };
  db().auditEvents.unshift(event);
  persist();
  return event;
}

export interface AuditQuery {
  search?: string;
  action?: string;
  actorId?: string;
  resourceType?: string;
  limit?: number;
}

export async function listAudit(query: AuditQuery = {}): Promise<AuditEvent[]> {
  await latency(200);
  const { search = "", action = "all", actorId = "all", resourceType = "all", limit = 60 } = query;
  const term = search.trim().toLowerCase();
  return db()
    .auditEvents.filter((e) => {
      if (term && !`${e.summary} ${e.actorName} ${e.resourceLabel}`.toLowerCase().includes(term)) return false;
      if (action !== "all" && e.action !== action) return false;
      if (actorId !== "all" && e.actorId !== actorId) return false;
      if (resourceType !== "all" && e.resourceType !== resourceType) return false;
      return true;
    })
    .slice(0, limit);
}

export async function listRecentAudit(limit = 8): Promise<AuditEvent[]> {
  await latency(160);
  return db().auditEvents.slice(0, limit);
}

export function auditActors(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  db().auditEvents.forEach((e) => seen.set(e.actorId, e.actorName));
  return Array.from(seen, ([id, name]) => ({ id, name }));
}

export function auditResourceTypes(): string[] {
  return Array.from(new Set(db().auditEvents.map((e) => e.resourceType)));
}
