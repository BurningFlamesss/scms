import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { ReactNode } from "react";
import TanstackQueryProvider, {
	getContext,
} from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";
import type { MyRouterContext } from "./types/router-context";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context: {
			...context,
			session: null,
		} satisfies MyRouterContext,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
