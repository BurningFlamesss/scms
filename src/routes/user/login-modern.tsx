import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AuthPage } from "#/components/public/AuthBlocks";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import {
	useSchoolConfig,
	useWebsitePageContent,
} from "#/packages/school/hook.tsx";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/user/login-modern")({
	loader: async ({ location }) => {
		if (String(location.search.cms ?? "") === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "login" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const config = useSchoolConfig();
	const published = useWebsitePageContent("login");
	const preview = String(cms ?? "") === "1";
	const loginPage = preview ? previewPage : published;

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "login",
				sectionType,
			},
			"*",
		);
	};

	return (
		<AuthPage
			blocks={loginPage?.blocks ?? null}
			orgName={config.organization.name}
			preview={preview}
			onSelectSection={onSelectSection}
		/>
	);
}