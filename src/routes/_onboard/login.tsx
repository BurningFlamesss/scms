import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "#/packages/auth/auth-client.ts";

export const Route = createFileRoute("/_onboard/login")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});
		} catch (error) {
			console.log("Error: ", error);
		}
	};
	return (
		<form onSubmit={handleSubmit}>
			<input type="email" name="email" placeholder="Email" />

			<input type="password" name="password" placeholder="Password" />

			<button type="submit">Login Account</button>
		</form>
	);
}
