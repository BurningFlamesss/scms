import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageShell } from "#/templates/modern/components/layout/PageShell";

/**
 * The onboarding cluster (signup, activate, public login). Uses the same frame
 * as the public and /user layouts so the sidebar, ticker and footer appear
 * consistently everywhere outside the admin shell.
 */
export const Route = createFileRoute("/_onboard")({
	component: OnboardLayoutRoute,
});

function OnboardLayoutRoute() {
	return (
		<PageShell>
			<Outlet />
		</PageShell>
	);
}
