import { useEffect, useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { Sheet, SheetContent } from "#/components/ui/sheet";
import { TooltipProvider } from "#/components/ui/tooltip";

const COLLAPSE_KEY = "scms.sidebar.collapsed";

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex min-h-screen bg-gray-50">
        <div
          className={`hidden shrink-0 transition-[width] duration-240 ease-standard lg:block ${
            collapsed ? "w-[72px]" : "w-[272px]"
          }`}
        >
          <div className={`fixed bottom-0 top-0 z-30 ${collapsed ? "w-[72px]" : "w-[272px]"} transition-[width] duration-240 ease-standard`}>
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[288px] border-gray-200 bg-white p-0">
            <Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
            onToggleSidebar={() => setCollapsed((v) => !v)}
          />
          <main className="min-w-0 flex-1" data-testid="app-main">
            <div key={location.pathname} className="animate-rise-in py-6">
              <Outlet />
            </div>
          </main>
        </div>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </div>
    </TooltipProvider>
  );
}