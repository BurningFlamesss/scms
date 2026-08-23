import { createFileRoute } from "@tanstack/react-router";
import { useSchoolConfig } from "#/packages/school/hook.tsx";
import LandingPage from "#/templates/modern/LandingPage.tsx";
import Sidebar from "#/templates/modern/Sidebar.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const config = useSchoolConfig();

	return (
		<main className="h-[200vh]">
			{/* <Sidebar /> */}
			<LandingPage />
		</main>
	);
}
