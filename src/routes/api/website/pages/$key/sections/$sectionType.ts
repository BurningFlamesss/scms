import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { saveSectionFields } from "@/lib/website-content";
import type { BlockType, WebsitePageKey } from "@/types";

export const Route = createFileRoute(
	"/api/website/pages/$key/sections/$sectionType",
)({
	server: {
		handlers: {
			PATCH: async ({ params, request }) => {
				try {
					const user = await getCurrentUser(request);
					if (!user)
						return Response.json({ error: "Unauthorized" }, { status: 401 });

					const { key, sectionType } = params;
					const body = await request.json();
					const { fields, actor } = body;

					if (!fields) {
						return Response.json({ error: "Invalid request" }, { status: 400 });
					}

					const actorData = actor || {
						id: user.id,
						name: user.name,
						role: user.role,
					};

					const page = await saveSectionFields(
						key as WebsitePageKey,
						sectionType as BlockType,
						fields,
						actorData,
					);

					return Response.json({ page });
				} catch (error) {
					console.error("Failed to update section:", error);
					return Response.json(
						{ error: "Failed to update section" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
