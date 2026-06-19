import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboard/login")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" })
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_onboard/login"!</div>;
}
