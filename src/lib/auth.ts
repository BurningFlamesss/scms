import { auth } from "#/packages/auth/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { User, Session } from "@/generated/prisma/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  try {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    
    if (!session?.user) return null;
    
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role || "staff",
      image: session.user.image,
    };
  } catch {
    return null;
  }
}

export async function getCurrentSession(request: Request): Promise<{ user: AuthUser; session: Session } | null> {
  try {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    
    if (!session?.user) return null;
    
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
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}