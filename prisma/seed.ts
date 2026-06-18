import { serverEnv } from '#/env/server.js';
import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const organization = await prisma.organization.upsert({
    where: {
      slug: serverEnv.ORGANIZATION_SLUG
    },
    update: {},
    create: {
      name: serverEnv.ORGANIZATION_NAME,
      slug: serverEnv.ORGANIZATION_SLUG
    }
  })

  const branch = await prisma.branch.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: serverEnv.DEFAULT_BRANCH_SLUG
      }
    },
    update: {},
    create: {
      name: serverEnv.DEFAULT_BRANCH_NAME,
      slug: serverEnv.DEFAULT_BRANCH_SLUG,
      organizationId: organization.id
    }
  })

  const user = await prisma.user.upsert({
    where: {
      email: serverEnv.SUPER_ADMIN_EMAIL
    },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: serverEnv.SUPER_ADMIN_NAME,
      email: serverEnv.SUPER_ADMIN_EMAIL,
      emailVerified: true
    }
  })

  const staff = await prisma.staff.upsert({
    where: {
      userId: user.id
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      branchId: branch.id,
      designation: "Super Administrator",
    }
  })

  const role = await prisma.userRole.upsert({
    where: {
      userId_organizationId_role: {
        userId: user.id,
        organizationId: organization.id,
        role: "SUPERADMIN"
      }
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      branchId: branch.id,
      role: "SUPERADMIN"
    }
  })

  const invite = await prisma.invite.create({
    data: {
			token: crypto.randomUUID(),
			userId: user.id,
			type: "STAFF",
			expiresAt: new Date(
				Date.now() + 1000 * 60 * 60 * 24 * 7,
			),
		},
  })

  console.log(`
    SUPER ADMIN created:
    
    EMAIL: ${user.email}

    ACTIVATION LINK: ${serverEnv.APP_URL}/activate/${invite.token}
    `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
