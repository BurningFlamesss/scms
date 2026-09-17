import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../../db";

const TokenSchema = z.string().min(1);

export const getInvite = createServerFn()
	.validator(TokenSchema)
	.handler(async ({ data: token }) => {
		const cleanToken = decodeURIComponent(token.trim()).replace(/\/+$/, "");
		return prisma.invite.findFirst({
			where: { token: cleanToken },
			include: {
				user: true,
			},
		});
	});
