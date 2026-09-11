import type { Role } from "@/types";

/** Every capability the dashboard gates on. */
export type Permission =
  | "overview.view"
  | "students.view"
  | "students.manage"
  | "staff.view"
  | "staff.manage"
  | "users.view"
  | "users.manage"
  | "classes.view"
  | "classes.manage"
  | "courses.view"
  | "courses.manage"
  | "attendance.view"
  | "attendance.mark"
  | "notices.view"
  | "notices.manage"
  | "notices.publish"
  | "events.view"
  | "events.manage"
  | "gallery.view"
  | "gallery.manage"
  | "admissions.view"
  | "admissions.manage"
  | "transport.view"
  | "transport.manage"
  | "payments.view"
  | "payments.manage"
  | "website.view"
  | "website.manage"
  | "activity.view"
  | "settings.view"
  | "settings.manage";

const STAFF_PERMISSIONS: Permission[] = [
  "overview.view",
  "students.view",
  "staff.view",
  "classes.view",
  "courses.view",
  "attendance.view",
  "attendance.mark",
  "notices.view",
  "notices.manage",
  "events.view",
  "gallery.view",
  "gallery.manage",
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...STAFF_PERMISSIONS,
  "students.manage",
  "staff.manage",
  "users.view",
  "classes.manage",
  "courses.manage",
  "notices.publish",
  "events.manage",
  "admissions.view",
  "admissions.manage",
  "transport.view",
  "transport.manage",
  "payments.view",
  "payments.manage",
  "website.view",
  "website.manage",
  "activity.view",
  "settings.view",
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  "users.manage",
  "settings.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  student: ["overview.view", "notices.view", "events.view", "gallery.view"],
  guardian: ["overview.view", "notices.view", "events.view", "gallery.view", "payments.view"],
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  student: "Student",
  guardian: "Guardian",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  super_admin: "Unrestricted access including roles, permissions and organization settings.",
  admin: "Runs day-to-day school operations: people, admissions, finance and website.",
  staff: "Teaching and support staff. Marks attendance and drafts communications.",
  student: "Portal access to notices, events and personal academic records.",
  guardian: "Portal access to their children's records, fees and school communications.",
};

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAny(role: Role | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
