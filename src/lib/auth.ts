import { auth } from "#/packages/auth/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Session } from "@/generated/prisma/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

/** Resolve a session from better-auth, falling back to the demo console cookie. */
async function resolveSession(): Promise<{ user: AuthUser; session: Session } | null> {
  const headers = getRequestHeaders();

  try {
    const session = await auth.api.getSession({ headers });
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role || "staff",
          image: session.user.image,
        },
        session: session.session,
      };
    }
  } catch {
    // fall through to the demo-session fallback below
  }

  const cookieHeader = headers.get("cookie") || "";
  const match = cookieHeader.match(/scms_demo_session=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = JSON.parse(decodeURIComponent(match[1]));
    if (!decoded?.user) return null;
    const demoUser = decoded.user as Record<string, unknown>;
    return {
      user: {
        id: String(demoUser.id ?? "usr_demo"),
        name: String(demoUser.name ?? "Demo Admin"),
        email: String(demoUser.email ?? ""),
        role: String(demoUser.role ?? "admin"),
        image: typeof demoUser.image === "string" ? demoUser.image : undefined,
      },
      session: {
        id: "demo-session-id",
        userId: String(demoUser.id ?? "usr_demo"),
        expiresAt: new Date(Date.now() + 86400000),
      } as unknown as Session,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(_request: Request): Promise<AuthUser | null> {
  const resolved = await resolveSession();
  return resolved?.user ?? null;
}

export async function getCurrentSession(_request: Request): Promise<{ user: AuthUser; session: Session } | null> {
  return resolveSession();
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}