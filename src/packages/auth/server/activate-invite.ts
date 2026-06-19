import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../../db";
import { auth } from "../auth";

const ActivationSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
});

export const activateInvite = createServerFn()
	.validator(ActivationSchema)
	.handler(async ({ data, context }) => {
		const { token, password } = data;

		const invite = await prisma.invite.findUnique({
			where: {
				token,
			},
			include: {
				user: true,
			},
		});

		if (!invite) {
			throw new Error("INVITE_NOT_FOUND");
		}

		if (invite.usedAt) {
			throw new Error("INVITE_ALREADY_USED");
		}

		if (invite.expiresAt < new Date()) {
			throw new Error("INVITE_EXPIRED");
		}

		const response = await auth.api.setPassword({
			body: {
				newPassword: password,
			},
			context,
		});

		if (!response.status) {
			return { success: false }
		}

		await prisma.$transaction([
			prisma.user.update({
				where: { id: invite.userId },
				data: {
					activatedAt: new Date(),
					emailVerified: true,
				},
			}),
			prisma.invite.update({
				where: { id: invite.id },
				data: {
					usedAt: new Date(),
				},
			}),
		]);

		return {
			success: true
		}
	});
