import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../../db";

const createInviteSchema = z.object({
	name: z.string().min(1),
	email: z.string().min(1),
});

const ORGANIZATION_ID = "cmqkj1y6y00003cfphzpld8wd";
const BRANCH_ID = "cmqkj1y7c00013cfpgumk851n";

export const createInvite = createServerFn()
	.validator(createInviteSchema)
	.handler(async ({ data }) => {
		const { email, name } = data;

		try {
			const user = await prisma.user.upsert({
				where: {
					email,
				},
				update: {},
				create: {
					id: crypto.randomUUID(),
					name,
					email,
					emailVerified: true,
				},
			});

			const staff = await prisma.staff.upsert({
				where: {
					userId: user.id,
				},
				update: {},
				create: {
					userId: user.id,
					organizationId: ORGANIZATION_ID,
					branchId: BRANCH_ID,
					designation: "Tester",
				},
			});

			const role = await prisma.userRole.upsert({
				where: {
					userId_organizationId_role: {
						userId: user.id,
						organizationId: ORGANIZATION_ID,
						role: "STAFF",
					},
				},
				update: {},
				create: {
					userId: user.id,
					organizationId: ORGANIZATION_ID,
					branchId: BRANCH_ID,
					role: "STAFF",
				},
			});

			const invite = await prisma.invite.create({
				data: {
					token: crypto.randomUUID(),
					userId: user.id,
					type: "STAFF",
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				},
			});

			return {
				invite,
				success: true,
			};
		} catch (error) {
			return {
				invite: null,
				success: false,
			};
		}
	});
