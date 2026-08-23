import { createFileRoute, Link } from "@tanstack/react-router";
import { Divide } from "lucide-react";
import { useState } from "react";
import { createInvite } from "#/packages/auth/server/create-invite.ts";

export const Route = createFileRoute("/_onboard/create-accounts")({
	component: RouteComponent,
});

function RouteComponent() {
	const [inviteLink, setInviteLink] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;

		try {
			const { invite, success } = await createInvite({
				data: {
					name,
					email,
				},
			});

			if (success) {
				setInviteLink(invite.token);
			}
		} catch (error) {
			console.log("Error: ", error);
		}
	};
	return (
		<main>
			<form onSubmit={handleSubmit}>
				<input type="text" name="name" placeholder="Name" />
				<input type="email" name="email" placeholder="Email" />

				<button type="submit">Generate Activation Link</button>
			</form>
			{inviteLink ? (
				<div>
					Here's your Invite Link (Tester):{" "}
					<Link to="/activate/$token" params={{ token: inviteLink }}>
						CLICK HERE
					</Link>
				</div>
			) : (
				<div>Enter details to generate a activation link</div>
			)}
		</main>
	);
}
