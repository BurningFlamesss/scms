import { createFileRoute } from "@tanstack/react-router";
import {
	PageFrame,
	PageHeader,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";
import { DownloadsCentre } from "#/templates/modern/components/utilities/DownloadsCentre";
import { getResourcesServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/resources")({
	component: RouteComponent,
	loader: async () => {
		return {
			resources: await getResourcesServer(),
		};
	}
});

function RouteComponent() {
	const { resources } = Route.useLoaderData();

	return (
		<PageFrame>
			<PageHeader
				eyebrow="Resources"
				title="Downloads and Materials"
				lead="Access important files, forms, and documents for the academic session."
			/>
			<div className="mt-10 mb-16" data-testid="resources-downloads">
				<DownloadsCentre dbResources={resources} />
			</div>
		</PageFrame>
	);
}
