import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../../db";

const TokenSchema = z.uuid()

export const getInvite = createServerFn()
	.validator(TokenSchema)
	.handler(async ({ data: token }) => {
		return prisma.invite.findUnique({
			where: { token },
			include: {
				user: true,
			},
		});
	});
