import { createFileRoute, notFound } from "@tanstack/react-router";
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

	return (
    <div>
      <h1>Activate Account:</h1>

      <p>{invite.user.name}</p>
      <p>{invite.user.email}</p>
    </div>
  )
}