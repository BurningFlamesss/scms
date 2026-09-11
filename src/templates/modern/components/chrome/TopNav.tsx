import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { school } from "#content/school";
import { DUR, EASE } from "#lib/motion";
import { Button } from "../kit";

const NAV_ITEMS = [
  { to: "/courses", label: "Courses", testId: "top-nav-link-courses" },
  { to: "/facilities", label: "Facilities", testId: "top-nav-link-facilities" },
  { to: "/faculty", label: "Administration", testId: "top-nav-link-faculty" },
  { to: "/notices", label: "Notices", testId: "top-nav-link-notices" },
  {
    to: "/scholarships",
    label: "Scholarships",
    testId: "top-nav-link-scholarships",
  },
];

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      data-testid="theme-toggle-button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? (
        <Sun className="h-[15px] w-[15px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[15px] w-[15px]" aria-hidden="true" />
      )}
    </Button>
  );
};

const NavItem = ({
  to,
  label,
  testId,
  indicatorId,
  indicatorClass,
}: {
  to: string;
  label: string;
  testId: string;
  indicatorId: string;
  indicatorClass: string;
}) => (
  <NavLink
    to={to}
    data-testid={testId}
    className={({ isActive }) =>
      [
        "relative shrink-0 rounded-chip px-3 py-2 text-sm transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")
    }
  >
    {({ isActive }) => (
      <>
        <span className="relative z-[1] whitespace-nowrap">{label}</span>
        {isActive ? (
          <motion.span
            layoutId={indicatorId}
            className={`absolute inset-x-2.5 h-[2px] rounded-full bg-accent ${indicatorClass}`}
            transition={{ duration: DUR.base, ease: EASE }}
          />
        ) : null}
      </>
    )}
  </NavLink>
);

export const TopNav = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <header
      data-testid="top-nav"
      className="no-print sticky top-0 z-nav border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto flex h-14 max-w-frame items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <NavLink
          to="/courses"
          data-testid="top-nav-brand"
          className="flex min-w-0 items-baseline gap-2.5 rounded-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            {school.wordmark}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
            {school.address}
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 md:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                indicatorId="top-nav-indicator-desktop"
                indicatorClass="-bottom-[7px]"
              />
            ))}
          </nav>
          <div className="ml-1 hidden h-5 w-px bg-border md:block" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>

      <nav
        aria-label="Primary, compact"
        className="border-t border-border/70 md:hidden"
      >
        <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto px-3 py-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              testId={`${item.testId}-compact`}
              indicatorId="top-nav-indicator-compact"
              indicatorClass="bottom-0.5"
            />
          ))}
        </div>
      </nav>
    </header>
  );
};
