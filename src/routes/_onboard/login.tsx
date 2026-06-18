import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboard/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_onboard/login"!</div>;
}
