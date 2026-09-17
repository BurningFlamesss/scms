import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Suspense } from "react";
import NotFoundPage from "#/components/NotFoundPage.tsx";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import {
	getFacultyMembersServer,
	getNoticesServer,
	getScholarshipsServer,
	getSchoolConfigServer,
	getSchoolContentServer,
	getWebsitePageServer,
} from "#/packages/content/server/content.ts";
import { AuthProvider } from "#/providers/AuthProvider";
import { Sidebar } from "#/templates/modern/components/layout/Sidebar";
import themeCss from "#/templates/modern/components/tokens/theme.css?url";
import type { MyRouterContext } from "#/types/router-context.ts";
import appCss from "../app.css?url";
import indexCss from "../index.css?url";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import globalCss from "../styles.css?url";

import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";

const PUBLIC_CACHE_HEADERS = () => ({
	"Cache-Control":
		"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

function ErrorComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<div className="text-center max-w-md">
				<h1 className="font-display text-4xl font-bold text-foreground mb-4">
					Something went wrong
				</h1>
				<p className="text-muted-foreground mb-6">
					We encountered an unexpected error. Please try refreshing the page or
					contact support if the problem persists.
				</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
				>
					Refresh Page
				</button>
			</div>
		</div>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	async beforeLoad() {
		const session = await getSessionFn();

		return { session };
	},
	async loader() {
		// Wrap DB requests with a timeout to prevent infinite hanging when DB is asleep/down
		const withTimeout = <T,>(promise: Promise<T>, ms = 4000): Promise<T> =>
			Promise.race([
				promise,
				new Promise<T>((_, reject) =>
					setTimeout(() => reject(new Error("Loader query timeout")), ms)
				),
			]);

		const [
			configResult,
			facultyContentResult,
			loginContentResult,
			sidebarContentResult,
			facultyMembersResult,
			noticesResult,
			scholarshipsResult,
		] = await Promise.allSettled([
			withTimeout(getSchoolConfigServer({ data: { identifier: "everest" } })),
			withTimeout(getWebsitePageServer({ data: { key: "faculty" } })),
			withTimeout(getWebsitePageServer({ data: { key: "login" } })),
			withTimeout(getSchoolContentServer({ data: { identifier: "everest" } })),
			withTimeout(getFacultyMembersServer()),
			withTimeout(getNoticesServer()),
			withTimeout(getScholarshipsServer()),
		]);

		const config = configResult.status === "fulfilled" && configResult.value ? configResult.value : getSchoolConfig("everest");
		const facultyContent = facultyContentResult.status === "fulfilled" ? facultyContentResult.value : null;
		const loginContent = loginContentResult.status === "fulfilled" ? loginContentResult.value : null;
		const sidebarContent = sidebarContentResult.status === "fulfilled" && sidebarContentResult.value ? sidebarContentResult.value : getSchoolContent("everest");
		const facultyMembers = facultyMembersResult.status === "fulfilled" ? facultyMembersResult.value : null;
		const notices = noticesResult.status === "fulfilled" ? noticesResult.value : null;
		const scholarships = scholarshipsResult.status === "fulfilled" ? scholarshipsResult.value : null;

		const content: Record<string, unknown> = {
			sidebar: sidebarContent?.sidebar,
		};
		if (facultyContent) {
			content.faculty = facultyContent;
		}
		if (loginContent) {
			content.login = loginContent;
		}
		if (facultyMembers && facultyMembers.length > 0) {
			content.facultyMembers = facultyMembers;
		}
		if (notices && notices.length > 0) {
			content.notices = notices;
		}
		if (scholarships && scholarships.length > 0) {
			content.scholarships = scholarships;
		}

		return {
			config,
			content,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Everest English Boarding Secondary School",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalCss,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: indexCss,
			},
			{
				rel: "stylesheet",
				href: themeCss,
			},
		],
	}),
	headers: PUBLIC_CACHE_HEADERS,
	notFoundComponent: NotFoundPage,
	errorComponent: ErrorComponent,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<Sidebar />
					<Suspense
						fallback={
							<div className="flex h-screen items-center justify-center">
								Loading...
							</div>
						}
					>
						{children}
					</Suspense>
				</AuthProvider>
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
