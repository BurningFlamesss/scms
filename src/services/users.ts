import type {
  AccountStatus,
  Actor,
  Paginated,
  Role,
  RoleDefinition,
  SessionRecord,
  UserAccount,
} from "@/types";
import { db, latency, matches, nowIso, paginate, persist, sortRows, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { pushNotification } from "@/services/notifications";
import { avatarFor } from "@/lib/format";
import { ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/permissions";

export interface UserQuery {
  search?: string;
  role?: string;
  accountStatus?: string;
  invitationStatus?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export async function listUsers(query: UserQuery = {}): Promise<Paginated<UserAccount>> {
  await latency();
  const {
    search = "",
    role = "all",
    accountStatus = "all",
    invitationStatus = "all",
    sort = "name",
    dir = "asc",
    page = 1,
    pageSize = 10,
  } = query;

  const filtered = db().users.filter((u) => {
    if (!matches(search, u.name, u.email, u.profileLabel)) return false;
    if (role !== "all" && u.role !== role) return false;
    if (accountStatus !== "all" && u.accountStatus !== accountStatus) return false;
    if (invitationStatus !== "all" && u.invitationStatus !== invitationStatus) return false;
    return true;
  });

  return paginate(sortRows(filtered, sort, dir), page, pageSize);
}

export async function listRoleDefinitions(): Promise<RoleDefinition[]> {
  await latency(180);
  return db().roles.map((r) => ({
    ...r,
    label: ROLE_LABEL[r.key],
    permissions: ROLE_PERMISSIONS[r.key],
    userCount: db().users.filter((u) => u.role === r.key).length,
  }));
}

export async function listSessions(): Promise<SessionRecord[]> {
  await latency(180);
  return db().sessions;
}

export async function revokeSession(id: string, actor: Actor): Promise<void> {
  await latency(260);
  const index = db().sessions.findIndex((s) => s.id === id);
  if (index === -1) return;
  const [removed] = db().sessions.splice(index, 1);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "session",
    resourceId: removed.id,
    resourceLabel: `${removed.userName} · ${removed.device}`,
    summary: `Revoked a session for ${removed.userName} (${removed.device})`,
  });
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
  profileType: UserAccount["profileType"];
  profileId?: string;
  profileLabel?: string;
  branchId: string;
  sendInvitation: boolean;
}

export async function createUser(input: CreateUserInput, actor: Actor): Promise<UserAccount> {
  await latency(480);
  if (db().users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error("A user with that email already exists.");
  }
  const user: UserAccount = {
    id: uid("usr"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    avatarUrl: avatarFor(input.name),
    role: input.role,
    profileType: input.profileType,
    profileId: input.profileId,
    profileLabel: input.profileLabel,
    accountStatus: input.sendInvitation ? "invited" : "active",
    invitationStatus: input.sendInvitation ? "pending" : "none",
    invitedAt: input.sendInvitation ? nowIso() : undefined,
    invitationExpiresAt: input.sendInvitation
      ? new Date(Date.now() + 7 * 86400000).toISOString()
      : undefined,
    emailVerified: false,
    branchId: input.branchId,
    createdAt: nowIso(),
  };
  db().users.unshift(user);
  persist();
  recordAudit({
    actor,
    action: input.sendInvitation ? "invited" : "created",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: input.sendInvitation
      ? `Invited ${user.name} as ${ROLE_LABEL[user.role]}`
      : `Created a ${ROLE_LABEL[user.role]} account for ${user.name}`,
  });
  pushNotification({
    kind: "user",
    title: input.sendInvitation ? "Invitation sent" : "User created",
    body: `${user.name} · ${ROLE_LABEL[user.role]}`,
    severity: "info",
    href: "/users",
    actorName: actor.name,
  });
  return user;
}

export async function resendInvitation(id: string, actor: Actor): Promise<UserAccount> {
  await latency(340);
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.invitationStatus = "pending";
  user.accountStatus = "invited";
  user.invitedAt = nowIso();
  user.invitationExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
  persist();
  recordAudit({
    actor,
    action: "invited",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `Re-sent the account invitation to ${user.name}`,
  });
  return user;
}

export async function revokeInvitation(id: string, actor: Actor): Promise<UserAccount> {
  await latency(300);
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.invitationStatus = "revoked";
  user.accountStatus = "deactivated";
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `Revoked ${user.name}’s pending invitation`,
  });
  return user;
}

/** Simulates the invitee completing activation from their email link. */
export async function simulateActivation(id: string, actor: Actor): Promise<UserAccount> {
  await latency(420);
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.invitationStatus = "activated";
  user.accountStatus = "active";
  user.emailVerified = true;
  user.lastActiveAt = nowIso();
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `${user.name} activated their account`,
  });
  pushNotification({
    kind: "invitation",
    title: "Invitation accepted",
    body: `${user.name} activated their ${ROLE_LABEL[user.role]} account.`,
    severity: "success",
    href: "/users",
  });
  return user;
}

export async function setAccountStatus(
  id: string,
  status: AccountStatus,
  actor: Actor,
): Promise<UserAccount> {
  await latency(300);
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  user.accountStatus = status;
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `Set ${user.name}’s account to ${status}`,
  });
  return user;
}

export async function changeUserRole(id: string, role: Role, actor: Actor): Promise<UserAccount> {
  await latency(300);
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  const previous = user.role;
  user.role = role;
  const profile = db().staff.find((s) => s.id === user.profileId);
  if (profile) profile.role = role;
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "user",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `Changed ${user.name}’s role from ${ROLE_LABEL[previous]} to ${ROLE_LABEL[role]}`,
  });
  return user;
}

export async function deleteUser(id: string, actor: Actor): Promise<void> {
  await latency(300);
  const index = db().users.findIndex((u) => u.id === id);
  if (index === -1) return;
  const [removed] = db().users.splice(index, 1);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "user",
    resourceId: removed.id,
    resourceLabel: removed.name,
    summary: `Deleted the user account for ${removed.name}`,
  });
}

export function userSummary() {
  const users = db().users;
  return {
    total: users.length,
    active: users.filter((u) => u.accountStatus === "active").length,
    pendingInvites: users.filter((u) => u.invitationStatus === "pending").length,
    expiredInvites: users.filter((u) => u.invitationStatus === "expired").length,
    unverified: users.filter((u) => !u.emailVerified).length,
  };
}
