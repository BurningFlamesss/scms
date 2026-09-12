import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelsTopLeft,
  Plus,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "#/providers/AuthProvider";
import { ROUTE_TITLES } from "./nav-config";
import { NotificationCenter } from "./NotificationCenter";
import { QuickCreate } from "./QuickCreate";
import { unreadCount } from "#/services/notifications";
import { listBranches } from "#/services/website";
import { ROLE_LABEL } from "#/lib/permissions";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

interface TopbarProps {
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
}

export function Topbar({ onOpenMobileNav, onOpenPalette, onToggleSidebar }: TopbarProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [branchId, setBranchId] = useState("branch_main");

  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: unreadCount,
    refetchInterval: 20_000,
  });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: listBranches });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const segments = location.pathname.split("/").filter(Boolean);
  const currentSegment = segments[0] === "admin" ? (segments[1] ?? "overview") : (segments[0] ?? "overview");
  const rootTitle = ROUTE_TITLES[currentSegment] ?? "Overview";
  const activeBranch = branches.find((b) => b.id === branchId);

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:px-4 lg:px-6"
      data-testid="app-topbar"
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        data-testid="mobile-nav-trigger"
        onClick={onOpenMobileNav}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        aria-label="Toggle sidebar"
        data-testid="topbar-sidebar-toggle"
        onClick={onToggleSidebar}
      >
        <PanelsTopLeft className="h-4 w-4" />
      </Button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
        <Link to="/admin/overview" className="text-muted-foreground transition-colors hover:text-foreground">
          EEBSS
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate font-medium text-foreground" data-testid="breadcrumb-current">
          {rootTitle}
        </span>
        {segments[2] && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="max-w-[220px] truncate text-muted-foreground">Detail</span>
          </>
        )}
      </nav>

      <div className="mx-auto hidden w-full max-w-md sm:block">
        <button
          type="button"
          onClick={onOpenPalette}
          data-testid="global-search-trigger"
          className="flex w-full items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-ring"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search students, staff, notices…</span>
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Search"
          data-testid="global-search-trigger-mobile"
          onClick={onOpenPalette}
        >
          <Search className="h-4 w-4" />
        </Button>

        <QuickCreate />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-xs font-medium xl:inline-flex"
              data-testid="branch-switcher"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              {activeBranch?.name ?? "All campuses"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-popover">
            <DropdownMenuLabel className="text-xs text-foreground">School context</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                data-testid={`branch-option-${branch.id}`}
                onClick={() => setBranchId(branch.id)}
                className="flex items-start gap-2"
              >
                <Check className={`mt-0.5 h-3.5 w-3.5 ${branch.id === branchId ? "opacity-100" : "opacity-0"} text-primary`} />
                <span>
                  <span className="block text-sm text-foreground">{branch.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {branch.code} · {branch.studentCount} students
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          data-testid="notifications-trigger"
          className="relative"
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              className="num absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
              data-testid="notifications-unread-count"
            >
              {unread}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          data-testid="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex items-center gap-2 rounded-md p-0.5 pr-2 transition-colors hover:bg-muted focus-ring"
              data-testid="profile-menu-trigger"
            >
              <img
                src={user?.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full border border-border"
              />
              <span className="hidden text-left lg:block">
                <span className="block text-xs font-medium leading-tight text-foreground">{user?.name}</span>
                <span className="block text-[11px] leading-tight text-muted-foreground">
                  {user ? ROLE_LABEL[user.role] : ""}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-popover">
            <DropdownMenuLabel>
              <span className="block text-sm text-foreground">{user?.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="profile-menu-account" onClick={() => navigate({ to: "/admin/settings", search: { tab: "school" } })}>
              <User className="mr-2 h-4 w-4" /> Account & profile
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="profile-menu-settings" onClick={() => navigate({ to: "/admin/settings" })}>
              <Settings className="mr-2 h-4 w-4" /> School settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="profile-menu-signout"
              className="text-primary focus:text-primary"
              onClick={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NotificationCenter open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </header>
  );
}

export const QUICK_CREATE_ICON = Plus;