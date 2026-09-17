import { SECTION_DEFAULTS } from "@/lib/cms-sections";
import { prisma } from "@/lib/prisma";
import type { BlockType, WebsitePage, WebsitePageKey } from "@/types";

function toWebsitePage(page: { 
  blocks: Array<{ id: string; type: string; label: string; visible: boolean; order: number; fields: unknown; updatedAt: Date; createdAt: Date }> 
} & Omit<{ 
  id: string; key: string; title: string; path: string; status: string; hasUnpublishedChanges: boolean;
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  publishedAt: Date | null; updatedAt: Date; updatedBy: string; createdAt: Date;
}, "blocks">): WebsitePage {
  return {
    id: page.id,
    key: page.key as any,
    title: page.title,
    path: page.path,
    status: page.status as any,
    hasUnpublishedChanges: page.hasUnpublishedChanges,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    seoKeywords: page.seoKeywords ?? "",
    blocks: page.blocks.map((block) => ({
      id: block.id,
      type: block.type as any,
      label: block.label,
      visible: block.visible,
      order: block.order,
      fields: block.fields as Record<string, unknown>,
      updatedAt: block.updatedAt.toISOString(),
      createdAt: block.createdAt.toISOString(),
    })),
    publishedAt: page.publishedAt?.toISOString() ?? null,
    updatedAt: page.updatedAt.toISOString(),
    createdAt: page.createdAt.toISOString(),
    updatedBy: page.updatedBy,
  };
}

export async function listWebsitePages(): Promise<WebsitePage[]> {
  const pages = await prisma.websitePage.findMany({
    include: { blocks: { orderBy: { order: "asc" } } },
    orderBy: { key: "asc" },
  });
  return pages.map(toWebsitePage);
}

export async function getWebsitePage(key: WebsitePageKey): Promise<WebsitePage | null> {
  const page = await prisma.websitePage.findUnique({
    where: { key },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  return page ? toWebsitePage(page) : null;
}

export async function getPublishedPage(key: WebsitePageKey): Promise<WebsitePage | null> {
  const page = await prisma.websitePage.findUnique({
    where: { key, status: "published" },
    include: { blocks: { where: { visible: true }, orderBy: { order: "asc" } } },
  });
  return page ? toWebsitePage(page) : null;
}

export async function saveSectionFields(
  key: WebsitePageKey,
  sectionType: BlockType,
  fields: Record<string, unknown>,
  actor: Actor,
): Promise<WebsitePage> {
  const page = await findPage(key);
  const existing = page.blocks.find((b) => b.type === sectionType);

  if (existing) {
    await prisma.contentBlock.update({
      where: { id: existing.id },
      data: { fields: fields as any, updatedAt: new Date() },
    });
  } else {
    const defaults = BLOCK_LIBRARY_DEFAULTS[sectionType];
    if (!defaults) throw new Error("Unknown section type");
    const maxOrder =
      page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;

    await prisma.contentBlock.create({
      data: {
        type: sectionType,
        label: sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/_/g, " "),
        visible: true,
        order: maxOrder + 1,
        fields: { ...defaults, ...fields } as any,
        pageId: page.id,
      },
    });
  }

  await prisma.websitePage.update({
    where: { key },
    data: {
      updatedAt: new Date(),
      updatedBy: actor.name,
      hasUnpublishedChanges: true,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

async function findPage(key: WebsitePageKey): Promise<WebsitePage> {
  const page = await getWebsitePage(key);
  if (!page) throw new Error("Page not found");
  return page;
}

interface Actor {
  id: string;
  name: string;
  role: string;
}

export async function updateBlockFields(
  key: WebsitePageKey,
  blockId: string,
  fields: Record<string, unknown>,
  _actor: Actor,
): Promise<WebsitePage> {
  const page = await findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");

  await prisma.contentBlock.update({
    where: { id: blockId },
    data: { fields: fields as any, updatedAt: new Date() },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function toggleBlockVisibility(
  key: WebsitePageKey,
  blockId: string,
  _actor: Actor,
): Promise<WebsitePage> {
  const page = await findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");

  await prisma.contentBlock.update({
    where: { id: blockId },
    data: { visible: !block.visible, updatedAt: new Date() },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function moveBlock(
  key: WebsitePageKey,
  blockId: string,
  direction: "up" | "down",
  _actor: Actor,
): Promise<WebsitePage> {
  const page = await findPage(key);
  const sorted = [...page.blocks].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((b) => b.id === blockId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= sorted.length) return page;

  [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
  sorted.forEach((b, i) => {
    b.order = i;
  });

  await prisma.$transaction(
    sorted.map((b, i) =>
      prisma.contentBlock.update({
        where: { id: b.id },
        data: { order: i, updatedAt: new Date() },
      })
    )
  );

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function reorderBlocks(
  key: WebsitePageKey,
  orderedIds: string[],
  _actor: Actor,
): Promise<WebsitePage> {

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.contentBlock.update({
        where: { id },
        data: { order: index, updatedAt: new Date() },
      })
    )
  );

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

const BLOCK_LIBRARY_DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  hero: {
    eyebrow: "Admissions open",
    headline: "A new headline for your school",
    subheadline: "Describe what makes your school distinctive in one or two sentences.",
    primaryCtaLabel: "Apply now",
    primaryCtaHref: "/admissions",
    secondaryCtaLabel: "Book a tour",
    secondaryCtaHref: "/contact",
    image: "/images/placeholder-campus.svg",
  },
  headline: { eyebrow: "Notice", title: "Announcement title", body: "Short supporting sentence." },
  intro: {
    title: "Introduction title",
    body: "Two to three sentences introducing this part of the school.",
    image: "/images/placeholder-campus.svg",
  },
  stats: {
    items: [
      { label: "Students", value: "1,180" },
      { label: "Faculty", value: "96" },
      { label: "Ratio", value: "12:1" },
      { label: "Placement", value: "98%" },
    ],
  },
  rich_text: { title: "Section title", html: "<p>Write your content here.</p>" },
  cta: {
    title: "Ready to join us?",
    body: "Tell visitors what to do next.",
    buttonLabel: "Get in touch",
    buttonHref: "/contact",
  },
  featured_notices: { title: "Latest notices", count: 3, source: "published" },
  featured_events: { title: "Upcoming events", count: 4 },
  gallery_grid: { title: "Life at school", albumIds: [] },
  facilities: { items: [{ title: "Facility", description: "Short description.", image: "/images/placeholder-campus.svg" }] },
  achievements: { items: [{ year: "2026", title: "Achievement", description: "What was won and by whom." }] },
  principal_message: { name: "Principal name", role: "Principal", message: "A short message to families.", photo: "" },
  contact_details: { phone: "", email: "", address: "" },
  office_hours: { weekdays: "8:00 AM – 4:30 PM", saturday: "Closed", sunday: "Closed", note: "" },
  social_links: { facebook: "", instagram: "", x: "", youtube: "", linkedin: "" },
  map: { label: "Main Campus", latitude: "", longitude: "", directions: "" },
  announcements: { items: [{ title: "Announcement", body: "Details…", date: new Date().toISOString().slice(0, 10) }] },
  academics: { title: "Academics", body: "", programs: [{ title: "Stage", description: "What it covers." }] },
  admissions_info: { title: "Admissions", body: "", deadline: "", steps: [{ title: "Step", description: "What happens." }] },
  faculty: { title: "Our faculty", body: "", highlightStaffIds: [] },
  mission_vision: { mission: "", vision: "", values: ["Curiosity", "Integrity"] },
  history: { title: "Our history", body: "", image: "", milestones: [{ year: "2000", title: "Milestone" }] },
  auth_visual: {
    image: "/public/schools/everest/landing-footage/frame_0001.jpeg",
    eyebrow: "ScMS entrance",
    headline: "The digital entrance to the school.",
    subheadline: "One community / connected responsibly",
  },
  auth_intro: {
    kicker: "SCHOOL MANAGEMENT SYSTEM",
    title: "Welcome back.",
    intro: "Enter the credentials issued by your school to continue.",
  },
  auth_form: {
    backLabel: "Public website",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotLabel: "Forgot password?",
    submitLabel: "Sign in",
    disclosure: "Frontend demonstration — no credentials are transmitted or stored.",
  },
  auth_contact: { title: "Don't have access?", linkLabel: "Contact the school", linkHref: "/contact" },
  ...SECTION_DEFAULTS,
};

export async function addBlock(key: WebsitePageKey, type: BlockType, _actor: Actor): Promise<WebsitePage> {
  const page = await findPage(key);
  const defaults = BLOCK_LIBRARY_DEFAULTS[type];
  if (!defaults) throw new Error("Unknown block type");

  const maxOrder = page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;

  await prisma.contentBlock.create({
    data: {
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
      visible: true,
      order: maxOrder + 1,
      fields: defaults as any,
      pageId: page.id,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function duplicateBlock(key: WebsitePageKey, blockId: string, _actor: Actor): Promise<WebsitePage> {
  const page = await findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");

  const maxOrder = page.blocks.length > 0 ? Math.max(...page.blocks.map((b) => b.order)) : -1;

  await prisma.contentBlock.create({
    data: {
      type: block.type,
      label: `${block.label} (copy)`,
      visible: block.visible,
      order: maxOrder + 1,
      fields: block.fields as any,
      pageId: page.id,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function deleteBlock(key: WebsitePageKey, blockId: string, _actor: Actor): Promise<WebsitePage> {
  const page = await findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");

  await prisma.contentBlock.delete({ where: { id: blockId } });

  const remainingBlocks = page.blocks.filter((b) => b.id !== blockId);
  await prisma.$transaction(
    remainingBlocks.map((b, i) =>
      prisma.contentBlock.update({
        where: { id: b.id },
        data: { order: i, updatedAt: new Date() },
      })
    )
  );

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function updatePageSeo(
  key: WebsitePageKey,
  seo: { title: string; description: string; keywords: string },
  actor: Actor,
): Promise<WebsitePage> {
  await prisma.websitePage.update({
    where: { key },
    data: {
      seoTitle: seo.title,
      seoDescription: seo.description,
      seoKeywords: seo.keywords,
      updatedAt: new Date(),
      updatedBy: actor.name,
      hasUnpublishedChanges: true,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function publishPage(key: WebsitePageKey, actor: Actor): Promise<WebsitePage> {
  await prisma.websitePage.update({
    where: { key },
    data: {
      status: "published",
      hasUnpublishedChanges: false,
      publishedAt: new Date(),
      updatedAt: new Date(),
      updatedBy: actor.name,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function unpublishPage(key: WebsitePageKey, actor: Actor): Promise<WebsitePage> {
  await prisma.websitePage.update({
    where: { key },
    data: {
      status: "draft",
      hasUnpublishedChanges: true,
      updatedAt: new Date(),
      updatedBy: actor.name,
    },
  });

  const updatedPage = await getWebsitePage(key);
  if (!updatedPage) throw new Error("Page not found after update");
  return updatedPage;
}

export async function ensureDefaultPages(): Promise<void> {
  const defaultPages: { key: WebsitePageKey; title: string; path: string }[] = [
    { key: "faculty", title: "Faculty & Administration", path: "/faculty" },
    { key: "login", title: "Sign in", path: "/login-modern" },
  ];

  for (const page of defaultPages) {
    await prisma.websitePage.upsert({
      where: { key: page.key },
      update: {},
      create: {
        key: page.key,
        title: page.title,
        path: page.path,
        status: "draft",
        hasUnpublishedChanges: true,
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        updatedBy: "system",
      },
    });
  }
}