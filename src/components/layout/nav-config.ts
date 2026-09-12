import {
  Activity,
  Bus,
  CalendarDays,
  CreditCard,
  GalleryVerticalEnd,
  GraduationCap,
  Images,
  LayoutDashboard,
  Library,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export interface NavChild {
  label: string;
  to: string;
}

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission: Permission;
  children?: NavChild[];
  badgeKey?: "pendingAdmissions" | "draftNotices" | "unmarkedClasses" | "pendingInvites";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Overview", to: "/admin/overview", icon: LayoutDashboard, permission: "overview.view" },
      {
        label: "Attendance",
        to: "/admin/attendance",
        icon: UserCheck,
        permission: "attendance.view",
        badgeKey: "unmarkedClasses",
        children: [
          { label: "Daily register", to: "/admin/attendance?view=daily" },
          { label: "Staff attendance", to: "/admin/attendance?view=staff" },
          { label: "Statistics", to: "/admin/attendance?view=stats" },
        ],
      },
      {
        label: "Admissions",
        to: "/admin/admissions",
        icon: GraduationCap,
        permission: "admissions.view",
        badgeKey: "pendingAdmissions",
        children: [
          { label: "Pending", to: "/admin/admissions?status=pending" },
          { label: "Accepted", to: "/admin/admissions?status=accepted" },
          { label: "Waitlisted", to: "/admin/admissions?status=waitlisted" },
          { label: "Rejected", to: "/admin/admissions?status=rejected" },
        ],
      },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, permission: "payments.view" },
      { label: "Transportation", to: "/admin/transportation", icon: Bus, permission: "transport.view" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Students", to: "/admin/students", icon: Users, permission: "students.view" },
      { label: "Staff", to: "/admin/staff", icon: Users, permission: "staff.view" },
      {
        label: "Users & Roles",
        to: "/admin/users",
        icon: ShieldCheck,
        permission: "users.view",
        badgeKey: "pendingInvites",
        children: [
          { label: "User directory", to: "/admin/users?tab=directory" },
          { label: "Roles & permissions", to: "/admin/users?tab=roles" },
          { label: "Invitations", to: "/admin/users?tab=invitations" },
          { label: "Sessions", to: "/admin/users?tab=sessions" },
        ],
      },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Classes & Sections", to: "/admin/classes", icon: GalleryVerticalEnd, permission: "classes.view" },
      { label: "Courses & Subjects", to: "/admin/courses", icon: Library, permission: "courses.view" },
    ],
  },
  {
    label: "Communications",
    items: [
      {
        label: "Notices",
        to: "/admin/notices",
        icon: Megaphone,
        permission: "notices.view",
        badgeKey: "draftNotices",
        children: [
          { label: "Published", to: "/admin/notices?status=published" },
          { label: "Scheduled", to: "/admin/notices?status=scheduled" },
          { label: "Drafts", to: "/admin/notices?status=draft" },
          { label: "Archived", to: "/admin/notices?status=archived" },
        ],
      },
      { label: "Events", to: "/admin/events", icon: CalendarDays, permission: "events.view" },
      { label: "Gallery", to: "/admin/gallery", icon: Images, permission: "gallery.view" },
    ],
  },
  {
    label: "Website",
    items: [
      {
        label: "Website Content",
        to: "/admin/website",
        icon: Globe,
        permission: "website.view",
        children: [
          { label: "Homepage", to: "/admin/website?page=homepage" },
          { label: "About", to: "/admin/website?page=about" },
          { label: "Contact", to: "/admin/website?page=contact" },
          { label: "Other content", to: "/admin/website?page=other" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Activity", to: "/admin/activity", icon: Activity, permission: "activity.view" },
      {
        label: "Settings",
        to: "/admin/settings",
        icon: Settings,
        permission: "settings.view",
        children: [
          { label: "School", to: "/admin/settings?tab=school" },
          { label: "Organization", to: "/admin/settings?tab=organization" },
          { label: "Users & security", to: "/admin/settings?tab=security" },
          { label: "Website", to: "/admin/settings?tab=website" },
          { label: "Notifications", to: "/admin/settings?tab=notifications" },
        ],
      },
    ],
  },
];

export const ROUTE_TITLES: Record<string, string> = {
  overview: "Overview",
  students: "Students",
  staff: "Staff",
  users: "Users & Roles",
  classes: "Classes & Sections",
  courses: "Courses & Subjects",
  attendance: "Attendance",
  notices: "Notices",
  events: "Events",
  gallery: "Gallery",
  admissions: "Admissions",
  transportation: "Transportation",
  payments: "Payments",
  website: "Website Content",
  activity: "Activity",
  settings: "Settings",
};