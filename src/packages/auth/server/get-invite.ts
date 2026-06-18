import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../db";

export const getInvite = createServerFn()
	.inputValidator((token: string) => token)
	.handler(async ({ data: token }) => {
		return prisma.invite.findUnique({
			where: { token },
			include: {
				user: true,
			},
		});
	});
