import type { QueryClient } from "@tanstack/react-query";
import type { auth } from "#/packages/auth/auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type AppContext = {
	session: Session;
};

export interface MyRouterContext {
	queryClient: QueryClient;
	session: Session | null;
}
