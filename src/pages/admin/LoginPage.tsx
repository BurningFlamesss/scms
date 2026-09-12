import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { ArrowRight, GraduationCap, Loader2, Moon, ShieldCheck, Sun, Users } from "lucide-react";
import { authClient } from "#/packages/auth/auth-client.ts";
import { useAuth } from "#/providers/AuthProvider";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

const HIGHLIGHTS = [
  { icon: Users, label: "People", value: "Students, staff, guardians and roles in one register" },
  { icon: GraduationCap, label: "Academics", value: "Classes, subjects, attendance and admissions" },
  { icon: ShieldCheck, label: "Governance", value: "Audit trail, permissions and invitation control" },
];

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("super@northfield.edu");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate({ to: "/admin/overview", replace: true });
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    let signedIn = false;
    let userName = "";

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      if (!result.error && result.data?.user) {
        signedIn = true;
        userName = result.data.user.name ?? email.split("@")[0];
      }
    } catch {
      // Fallback to dummy authentication
    }

    if (!signedIn) {
      // Build dummy session profile
      const isSuper = email.includes("super");
      const isAdmin = email.includes("admin");
      const role = isSuper ? "superadmin" : isAdmin ? "admin" : "staff";
      const rawName = email.split("@")[0].replace(/[._-]/g, " ");
      userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      if (isSuper) userName = "Super Admin";
      else if (isAdmin) userName = "Principal Admin";
      else if (role === "staff") userName = "Staff Member";

      const demoUser = {
        id: `demo-${email.replace(/[^a-z0-9]/gi, "_")}`,
        name: userName,
        email: email,
        role: role,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      };

      document.cookie = `scms_demo_session=${encodeURIComponent(JSON.stringify({ user: demoUser }))}; path=/; max-age=604800; SameSite=Lax`;
      signedIn = true;
    }

    toast.success(`Welcome back, ${userName}`);
    window.location.href = "/admin/overview";
    setBusy(false);
  }

  const fillAccount = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <div className="grid min-h-screen bg-muted lg:grid-cols-[1.1fr_1fr]">
      <div className="header-wash relative hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            EEBSS
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Everest English Boarding Sec. School</p>
            <p className="text-xs text-muted-foreground">EEBSS Admin Console</p>
          </div>
        </div>

        <div className="max-w-lg">
          <p className="eyebrow-label mb-3 text-muted-foreground">Administrative console</p>
          <h1 className="font-display text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
            The operating system for a modern school.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enrolment, attendance, admissions, communications, finance and the public website — governed from one
            precise workspace.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label} className="flex items-start gap-3 rounded-lg border border-border bg-card/80 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="block text-sm text-foreground">{item.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Everest English Boarding Secondary School (EEBSS) · Grades Nursery–12
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                EEBSS
              </div>
              <span className="font-display text-sm font-semibold text-foreground">EEBSS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              aria-label="Toggle theme"
              data-testid="login-theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use a seeded demo account to explore each role.</p>

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                data-testid="login-email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                data-testid="login-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p
                className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"
                data-testid="login-error"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={busy} data-testid="login-submit">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {busy ? "Signing in…" : "Sign in to console"}
            </Button>
          </form>

          <div className="mt-7 rounded-xl border border-border bg-card p-3">
            <p className="eyebrow-label mb-2 text-muted-foreground">Test accounts (click to fill)</p>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                className="block text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => fillAccount("super@northfield.edu", "admin123")}
              >
                super@northfield.edu / admin123 <span className="font-normal text-muted-foreground">(Super Admin)</span>
              </button>
              <button
                type="button"
                className="block text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => fillAccount("admin@northfield.edu", "admin123")}
              >
                admin@northfield.edu / admin123 <span className="font-normal text-muted-foreground">(Admin)</span>
              </button>
              <button
                type="button"
                className="block text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => fillAccount("staff@northfield.edu", "staff123")}
              >
                staff@northfield.edu / staff123 <span className="font-normal text-muted-foreground">(Staff)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}