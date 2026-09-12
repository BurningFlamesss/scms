import { createMiddleware, createServerFn } from "@tanstack/react-start";
import type { AppContext } from "#/types/router-context";

export const getSessionMiddleware = createMiddleware({
	type: "request",
}).server(async ({ next }) => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const headers = getRequestHeaders();
	let session: any = null;

	try {
		const { auth } = await import("#/packages/auth/auth");
		session = await auth.api.getSession({ headers });
	} catch {
		session = null;
	}

	if (!session) {
		const cookieHeader = headers.get("cookie") || "";
		const match = cookieHeader.match(/scms_demo_session=([^;]+)/);
		if (match) {
			try {
				const decoded = JSON.parse(decodeURIComponent(match[1]));
				if (decoded && decoded.user) {
					session = {
						user: decoded.user,
						session: {
							id: "demo-session-id",
							userId: decoded.user.id,
							expiresAt: new Date(Date.now() + 86400000).toISOString(),
						},
					};
				}
			} catch {
				session = null;
			}
		}
	}

	return await next({ context: { session: session } satisfies AppContext });
});

export const getSessionFn = createServerFn()
	.middleware([getSessionMiddleware])
	.handler(({ context }) => context.session);
