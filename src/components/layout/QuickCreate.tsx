import { useNavigate } from "@tanstack/react-router";
import { CalendarPlus, ImagePlus, Megaphone, Plus, UploadCloud, UserPlus, Users } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useAuth } from "#/providers/AuthProvider";
import type { Permission } from "#/lib/permissions";

const ACTIONS: { label: string; to: string; icon: typeof Plus; permission: Permission; testId: string }[] = [
  { label: "Enroll student", to: "/students?new=1", icon: UserPlus, permission: "students.manage", testId: "quick-create-student" },
  { label: "Add staff member", to: "/staff?new=1", icon: Users, permission: "staff.manage", testId: "quick-create-staff" },
  { label: "Write a notice", to: "/notices/new", icon: Megaphone, permission: "notices.manage", testId: "quick-create-notice" },
  { label: "Schedule an event", to: "/events?new=1", icon: CalendarPlus, permission: "events.manage", testId: "quick-create-event" },
  { label: "Create gallery album", to: "/gallery?new=1", icon: ImagePlus, permission: "gallery.manage", testId: "quick-create-album" },
  { label: "Import students (CSV)", to: "/students?import=1", icon: UploadCloud, permission: "students.manage", testId: "quick-create-import" },
];

export function QuickCreate() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const available = ACTIONS.filter((action) => can(action.permission));
  if (!available.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5" data-testid="quick-create-trigger">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        <DropdownMenuLabel className="text-xs">Quick create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((action, index) => (
          <DropdownMenuItem key={action.to} data-testid={action.testId} onClick={() => navigate(action.to)}>
            <action.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            {action.label}
            {index < 3 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
