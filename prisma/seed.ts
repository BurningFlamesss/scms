import { config } from 'dotenv';
config({ path: '.env.local' });

import { serverEnv } from '#/env/server.js';
import { PrismaClient } from '../src/generated/prisma/client.js'
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { hash } from 'bcryptjs';

import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

interface ContentPage {
  key: string;
  title: string;
  path: string;
  status: string;
  hasUnpublishedChanges: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  blocks: Array<{
    type: string;
    label: string;
    visible: boolean;
    order: number;
    fields: Record<string, unknown>;
  }>;
}

interface ContentFile {
  sidebar: any;
  pages: Record<string, ContentPage>;
  login: any;
}

function loadContentFile(): ContentFile {
  const contentPath = join(__dirname, '..', 'src', 'schools', 'everest', 'content.json');
  const content = readFileSync(contentPath, 'utf-8');
  return JSON.parse(content);
}

function loadConfigFile(): any {
  const configPath = join(__dirname, '..', 'src', 'schools', 'everest', 'config.json');
  const config = readFileSync(configPath, 'utf-8');
  return JSON.parse(config);
}

async function main() {
  console.log('🌱 Seeding database...')

  // Load default content from JSON files
  const contentFile = loadContentFile();
  const configFile = loadConfigFile();

  const organization = await prisma.organization.upsert({
    where: {
      slug: serverEnv.ORGANIZATION_SLUG
    },
    update: {},
    create: {
      name: configFile.organization.name || serverEnv.ORGANIZATION_NAME,
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

  await seedTestUsers(organization.id, branch.id);

  // Seed default website pages from content.json
  await seedWebsitePages(user.id, user.name, contentFile.pages);
}

async function seedTestUsers(organizationId: string, branchId: string) {
  const testUsers = [
    { email: "super@northfield.edu", password: "admin123", name: "Super Admin", role: "SUPERADMIN" },
    { email: "admin@northfield.edu", password: "admin123", name: "Admin User", role: "ADMIN" },
    { email: "staff@northfield.edu", password: "staff123", name: "Staff User", role: "STAFF" },
  ];

  for (const testUser of testUsers) {
    const hashedPassword = await hash(testUser.password, 12);
    
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: testUser.name,
        email: testUser.email,
        emailVerified: true,
      }
    });

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "email" }
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "email",
          accountId: testUser.email,
          password: hashedPassword,
        }
      });
    }

    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        organizationId,
        branchId,
        designation: testUser.role === "SUPERADMIN" ? "Super Administrator" : testUser.role === "ADMIN" ? "Administrator" : "Staff Member",
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_organizationId_role: {
          userId: user.id,
          organizationId,
          role: testUser.role,
        }
      },
      update: {},
      create: {
        userId: user.id,
        organizationId,
        branchId,
        role: testUser.role,
      }
    });

    console.log(`  ✓ Created test user: ${testUser.email} (${testUser.role})`);
  }
}

async function seedWebsitePages(authorId: string, authorName: string, pages: Record<string, ContentPage>) {
  console.log('🌱 Seeding website pages from content.json...');

  for (const [pageKey, pageData] of Object.entries(pages)) {
    const page = await prisma.websitePage.upsert({
      where: { key: pageData.key },
      update: {},
      create: {
        key: pageData.key,
        title: pageData.title,
        path: pageData.path,
        status: pageData.status as "draft" | "published",
        hasUnpublishedChanges: pageData.hasUnpublishedChanges,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        seoKeywords: pageData.seoKeywords,
        updatedBy: authorName,
        blocks: {
          create: pageData.blocks.map((block, index) => ({
            ...block,
            order: block.order ?? index,
          })),
        },
      },
    });

    if (pageData.status === "published") {
      await prisma.websitePage.update({
        where: { key: pageData.key },
        data: { publishedAt: new Date() },
      });
    }

    console.log(`  ✓ ${pageData.title} (${pageData.key})`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })