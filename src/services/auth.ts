import type { AppUser, Role } from "@/types";
import { db, latency } from "@/lib/db";
import { recordAudit } from "@/services/audit";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  hint: string;
}

/**
 * Seeded demo accounts. Passwords are intentionally simple — this is a template
 * with a local mock identity provider, not a production auth system.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "super@northfield.edu", password: "admin123", role: "super_admin", hint: "Full access incl. roles & settings" },
  { email: "admin@northfield.edu", password: "admin123", role: "admin", hint: "School operations & website" },
  { email: "staff@northfield.edu", password: "staff123", role: "staff", hint: "Teaching view · attendance & notices" },
];

const SESSION_KEY = "scms.session.v3";

function toAppUser(email: string): AppUser | null {
  const account = db().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!account) return null;
  const profile = db().staff.find((s) => s.id === account.profileId);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    avatarUrl: account.avatarUrl,
    title: profile ? `${profile.designation} · ${profile.department}` : account.profileLabel,
  };
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  await latency(520);
  const demo = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!demo || demo.password !== password) {
    throw new Error("Those credentials don't match any account.");
  }
  const user = toAppUser(demo.email);
  if (!user) throw new Error("This account has no linked profile.");
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  recordAudit({
    actor: { id: user.id, name: user.name, role: user.role },
    action: "signed_in",
    resourceType: "session",
    resourceId: user.id,
    resourceLabel: user.name,
    summary: `${user.name} signed in to the admin console`,
  });
  return user;
}

export function signOut(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export function readSession(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}
