import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  GalleryVerticalEnd,
  GraduationCap,
  Globe,
  Library,
  Megaphone,
  Moon,
  Search,
  Sun,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { globalSearch } from "@/services/search";
import { NAV_GROUPS } from "./nav-config";
import { useAuth } from "@/providers/AuthProvider";
import type { SearchResult } from "@/types";

const TYPE_ICON: Record<SearchResult["type"], typeof Users> = {
  student: Users,
  staff: UserCheck,
  notice: Megaphone,
  event: CalendarDays,
  class: GalleryVerticalEnd,
  course: Library,
  page: Globe,
  application: GraduationCap,
};

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  student: "Students",
  staff: "Staff",
  notice: "Notices",
  event: "Events",
  class: "Classes",
  course: "Subjects",
  page: "Website pages",
  application: "Applications",
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { theme, setTheme } = useTheme();
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", term],
    queryFn: () => globalSearch(term),
    enabled: open && term.trim().length > 0,
  });

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const navItems = NAV_GROUPS.flatMap((group) => group.items)
    .filter((item) => can(item.permission))
    .filter((item) => !term || item.label.toLowerCase().includes(term.toLowerCase()));

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    acc[result.type] = acc[result.type] ? [...acc[result.type], result] : [result];
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-hairline bg-popover p-0 shadow-pop">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command shouldFilter={false} className="bg-popover" data-testid="command-palette">
          <CommandInput
            autoFocus
            value={term}
            onValueChange={setTerm}
            placeholder="Search students, staff, notices, events, classes, pages…"
            data-testid="command-palette-input"
          />
          <CommandList className="max-h-[420px]">
            {term && !isFetching && results.length === 0 && navItems.length === 0 && (
              <CommandEmpty>
                <div className="px-4 py-6 text-center">
                  <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">No matches for “{term}”</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try an admission number, staff name or notice title.
                  </p>
                </div>
              </CommandEmpty>
            )}

            {Object.entries(grouped).map(([type, items]) => {
              const Icon = TYPE_ICON[type as SearchResult["type"]];
              return (
                <CommandGroup key={type} heading={TYPE_LABEL[type as SearchResult["type"]]}>
                  {items.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type}-${result.id}`}
                      onSelect={() => go(result.href)}
                      data-testid="command-palette-result"
                      className="gap-3"
                    >
                      {result.avatarUrl ? (
                        <img src={result.avatarUrl} alt="" className="h-6 w-6 rounded-full border border-hairline" />
                      ) : (
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">{result.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}

            {results.length > 0 && <CommandSeparator />}

            <CommandGroup heading="Navigate">
              {navItems.slice(0, term ? 5 : 16).map((item) => (
                <CommandItem
                  key={item.to}
                  value={`nav-${item.label}`}
                  onSelect={() => go(item.to)}
                  data-testid="command-palette-nav-item"
                  className="gap-3"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Actions">
              {can("students.manage") && (
                <CommandItem value="action-new-student" onSelect={() => go("/students?new=1")} className="gap-3">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enroll a new student</span>
                </CommandItem>
              )}
              {can("notices.manage") && (
                <CommandItem value="action-new-notice" onSelect={() => go("/notices/new")} className="gap-3">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Write a notice</span>
                </CommandItem>
              )}
              {can("attendance.mark") && (
                <CommandItem value="action-attendance" onSelect={() => go("/attendance")} className="gap-3">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Mark today's attendance</span>
                </CommandItem>
              )}
              <CommandItem
                value="action-theme"
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  onOpenChange(false);
                }}
                className="gap-3"
                data-testid="command-palette-theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Switch to {theme === "dark" ? "light" : "dark"} theme</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
