import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../db";

export class InviteExpiredError extends Error {}
export class InviteUsedError extends Error {}

export const getInvite = createServerFn()
	.validator((token: string) => token)
	.handler(async ({ data: token }) => {
		return prisma.invite.findUnique({
			where: { token },
			include: {
				user: true,
			},
		});
	});
