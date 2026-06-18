import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";
import { SchoolProvider } from "#/provider/school-provider.tsx";
import type { MyRouterContext } from "#/types/router-context.ts";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	async beforeLoad() {
		const session = getSessionFn();

		return { session };
	},
	async loader() {
		const config = getSchoolConfig("e");
		const content = getSchoolContent("e");

		return {
			config,
			content,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: loaderData?.config.seo.title,
			},
			{
				"aria-description": loaderData?.config.seo.description,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { config, content } = Route.useLoaderData();

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<SchoolProvider config={config} content={content}>
					{children}
				</SchoolProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
