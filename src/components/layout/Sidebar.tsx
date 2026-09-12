import { useMemo, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NAV_GROUPS, type NavItem } from "./nav-config";
import { useAuth } from "#/providers/AuthProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { ScrollArea } from "#/components/ui/scroll-area";
import { getOverview } from "#/services/overview";
import { cn } from "#/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  mobile?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, mobile = false, onToggle, onNavigate }: SidebarProps) {
  const { user, can } = useAuth();
  const location = useLocation();
  const [openItem, setOpenItem] = useState<string | null>(null);

  const { data: overview } = useQuery({
    queryKey: ["overview", "nav-badges"],
    queryFn: getOverview,
    staleTime: 60_000,
  });

  const badges = useMemo(() => {
    const actions = overview?.pendingActions ?? [];
    const byId = (id: string) => actions.find((a) => a.id === id)?.count ?? 0;
    return {
      pendingAdmissions: byId("pa_admissions"),
      draftNotices: byId("pa_notices"),
      unmarkedClasses: byId("pa_attendance"),
      pendingInvites: byId("pa_invites"),
    };
  }, [overview]);

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(item.permission)),
  })).filter((group) => group.items.length > 0);

  const isActive = (item: NavItem) => location.pathname.startsWith(item.to);

  return (
    <aside
      className="flex h-full flex-col border-r border-border bg-card"
      data-testid="app-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className={cn("flex h-14 items-center gap-2.5 border-b border-border px-4", collapsed && "justify-center px-0")}>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
          EEBSS
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-xs font-semibold leading-tight text-foreground" title="Everest English Boarding Secondary School">Everest English Boarding Sec. School</p>
            <p className="truncate text-[11px] text-muted-foreground">EEBSS Admin Console</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className={cn("space-y-5 px-3 py-4", collapsed && "px-2")}>
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && <p className="eyebrow-label mb-2 px-2.5 text-muted-foreground">{group.label}</p>}
              {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-border" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                  const expanded = openItem === item.label;

                  const link = (
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 focus-ring",
                        active
                          ? "bg-muted font-medium text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px] before:rounded-full before:bg-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && badgeCount > 0 && (
                        <span className="num rounded-full bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                          {badgeCount}
                        </span>
                      )}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.label}>
                      <div className="flex items-center">
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">{link}</div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-popover text-popover-foreground">
                              {item.label}
                              {badgeCount > 0 ? ` · ${badgeCount}` : ""}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="flex-1">{link}</div>
                        )}
                        {!collapsed && item.children && (
                          <button
                            type="button"
                            aria-label={`Toggle ${item.label} sub-navigation`}
                            data-testid={`nav-expand-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                            onClick={() => setOpenItem(expanded ? null : item.label)}
                            className="ml-0.5 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                          >
                            <ChevronDown
                              className={cn("h-3.5 w-3.5 transition-transform duration-180", expanded && "rotate-180")}
                            />
                          </button>
                        )}
                      </div>

                      {!collapsed && item.children && expanded && (
                        <ul className="ml-[18px] mt-0.5 space-y-0.5 border-l border-border pl-3">
                          {item.children.map((child) => (
                            <li key={child.to}>
                              <Link
                                to={child.to}
                                onClick={onNavigate}
                                className={({ isActive: childActive }) =>
                                  cn(
                                    "block rounded px-2 py-1.5 text-[13px] transition-colors duration-150 focus-ring",
                                    childActive && location.search === child.to.split("?")[1]
                                      ? "text-foreground"
                                      : "text-muted-foreground hover:text-foreground",
                                  )
                                }
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            data-testid="sidebar-collapse-toggle"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse sidebar</span>}
            {!collapsed && <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘B</span>}
          </button>
        )}
        {!collapsed && user && (
          <div className="mt-2 flex items-center gap-2.5 rounded-md bg-muted px-2.5 py-2">
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full border border-border" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.title}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}