import { createFileRoute } from "@tanstack/react-router";
import { getInvite } from "#/packages/auth/server/get-invite.ts";

export const Route = createFileRoute("/_onboard/activate/$token")({
	loader: async ({ params }) => {
		return await getInvite({
			data: params.token,
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_onboard/activate"!</div>;
}
