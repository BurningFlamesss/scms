import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/packages/auth/auth-client.ts";
import { activateInvite } from "#/packages/auth/server/activate-invite.ts";
import {
	getInvite,
	InviteExpiredError,
	InviteUsedError,
} from "#/packages/auth/server/get-invite.ts";

export const Route = createFileRoute("/_onboard/activate/$token")({
	loader: async ({ params }) => {
		const invite = await getInvite({
			data: params.token,
		});

		if (!invite) {
			throw notFound();
		}

		if (invite.usedAt) {
			throw new InviteUsedError();
		}

		if (invite.expiresAt < new Date()) {
			throw new InviteExpiredError();
		}

		return invite;
	},
	notFoundComponent: () => {
		return <>This invite link doesn't exists.</>;
	},
	errorComponent: ({ error }) => {
		if (error instanceof InviteUsedError) {
			return <div>This invitation has already been used.</div>;
		}

		if (error instanceof InviteExpiredError) {
			return <div>This invitation has expired.</div>;
		}

		return <div>Something went wrong.</div>;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const invite = Route.useLoaderData();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			// TODO: show error in the UI
			console.log("Password doesnot match");
			return;
		}

		try {
			const response = await activateInvite({
				data: {
					token: invite.token,
					password,
				},
			});

			if (!response.success) {
				console.log("Failed to set password");
				return;
			}

			const signInRes = await authClient.signIn.email({
				email: invite.user.email,
				password,
			});

			if (signInRes.error) {
				console.error(signInRes.error);
				return;
			}

			console.log("Successfully! Activated the account");

			navigate({ to: "/" });
		} catch (error) {
			console.error("CLIENT error:", error);
		}
	};

	return (
		<div>
			<h1>Activate Account:</h1>

			<div>
				<p>{invite.user.name}</p>
				<p>{invite.user.email}</p>
			</div>

			<form onSubmit={handleSubmit}>
				<input type="password" name="password" placeholder="Password" />

				<input
					type="password"
					name="confirmPassword"
					placeholder="Confirm Password"
				/>

				<button type="submit">Activate Account</button>
			</form>
		</div>
	);
}
