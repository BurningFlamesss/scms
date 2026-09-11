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
      { label: "Overview", to: "/overview", icon: LayoutDashboard, permission: "overview.view" },
      {
        label: "Attendance",
        to: "/attendance",
        icon: UserCheck,
        permission: "attendance.view",
        badgeKey: "unmarkedClasses",
        children: [
          { label: "Daily register", to: "/attendance?view=daily" },
          { label: "Staff attendance", to: "/attendance?view=staff" },
          { label: "Statistics", to: "/attendance?view=stats" },
        ],
      },
      {
        label: "Admissions",
        to: "/admissions",
        icon: GraduationCap,
        permission: "admissions.view",
        badgeKey: "pendingAdmissions",
        children: [
          { label: "Pending", to: "/admissions?status=pending" },
          { label: "Accepted", to: "/admissions?status=accepted" },
          { label: "Waitlisted", to: "/admissions?status=waitlisted" },
          { label: "Rejected", to: "/admissions?status=rejected" },
        ],
      },
      { label: "Payments", to: "/payments", icon: CreditCard, permission: "payments.view" },
      { label: "Transportation", to: "/transportation", icon: Bus, permission: "transport.view" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Students", to: "/students", icon: Users, permission: "students.view" },
      { label: "Staff", to: "/staff", icon: Users, permission: "staff.view" },
      {
        label: "Users & Roles",
        to: "/users",
        icon: ShieldCheck,
        permission: "users.view",
        badgeKey: "pendingInvites",
        children: [
          { label: "User directory", to: "/users?tab=directory" },
          { label: "Roles & permissions", to: "/users?tab=roles" },
          { label: "Invitations", to: "/users?tab=invitations" },
          { label: "Sessions", to: "/users?tab=sessions" },
        ],
      },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Classes & Sections", to: "/classes", icon: GalleryVerticalEnd, permission: "classes.view" },
      { label: "Courses & Subjects", to: "/courses", icon: Library, permission: "courses.view" },
    ],
  },
  {
    label: "Communications",
    items: [
      {
        label: "Notices",
        to: "/notices",
        icon: Megaphone,
        permission: "notices.view",
        badgeKey: "draftNotices",
        children: [
          { label: "Published", to: "/notices?status=published" },
          { label: "Scheduled", to: "/notices?status=scheduled" },
          { label: "Drafts", to: "/notices?status=draft" },
          { label: "Archived", to: "/notices?status=archived" },
        ],
      },
      { label: "Events", to: "/events", icon: CalendarDays, permission: "events.view" },
      { label: "Gallery", to: "/gallery", icon: Images, permission: "gallery.view" },
    ],
  },
  {
    label: "Website",
    items: [
      {
        label: "Website Content",
        to: "/website",
        icon: Globe,
        permission: "website.view",
        children: [
          { label: "Homepage", to: "/website?page=homepage" },
          { label: "About", to: "/website?page=about" },
          { label: "Contact", to: "/website?page=contact" },
          { label: "Other content", to: "/website?page=other" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Activity", to: "/activity", icon: Activity, permission: "activity.view" },
      {
        label: "Settings",
        to: "/settings",
        icon: Settings,
        permission: "settings.view",
        children: [
          { label: "School", to: "/settings?tab=school" },
          { label: "Organization", to: "/settings?tab=organization" },
          { label: "Users & security", to: "/settings?tab=security" },
          { label: "Website", to: "/settings?tab=website" },
          { label: "Notifications", to: "/settings?tab=notifications" },
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