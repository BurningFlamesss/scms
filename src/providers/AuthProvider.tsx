import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { Actor, AppUser } from "@/types";
import { can as hasPermission, type Permission } from "@/lib/permissions";
import { authClient } from "#/packages/auth/auth-client.ts";

interface AuthContextValue {
  user: AppUser | null;
  actor: Actor;
  loading: boolean;
  signOut: () => void;
  can: (permission: Permission) => boolean;
}

const FALLBACK_ACTOR: Actor = { id: "anonymous", name: "System", role: "staff" };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState({ select: (state) => state });
  const session = (routerState as any).context?.session;

  const user: AppUser = session?.user ? {
    id: session.user.id,
    name: session.user.name || "Demo Admin",
    email: session.user.email,
    role: (session.user as any).role || "super_admin",
    avatarUrl: session.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: (session.user as any).title || "School Administrator",
  } : {
    id: "usr_demo",
    name: "Demo Admin",
    email: "admin@eebss.edu",
    role: "super_admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "School Administrator",
  };

  const signOut = useCallback(() => {
    document.cookie = "scms_demo_session=; path=/; max-age=0;";
    try {
      authClient.signOut();
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      actor: user ? { id: user.id, name: user.name, role: user.role } : FALLBACK_ACTOR,
      loading: false,
      signOut,
      can: (permission: Permission) => hasPermission(user?.role, permission),
    }),
    [user, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
