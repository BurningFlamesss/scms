import type {
  AcademicYear,
  Actor,
  Branch,
  BlockType,
  ContentBlock,
  SchoolSettings,
  WebsitePage,
  WebsitePageKey,
} from "@/types";
import { db, latency, nowIso, persist, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { pushNotification } from "@/services/notifications";
import { photoFor } from "@/lib/format";

/** Blocks an administrator can add, grouped for the "Add section" picker. */
export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  description: string;
  group: "Layout" | "Content" | "Dynamic" | "Contact";
  defaults: Record<string, unknown>;
}[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Full-width headline, supporting text and up to two calls to action.",
    group: "Layout",
    defaults: {
      eyebrow: "Admissions open",
      headline: "A new headline for your school",
      subheadline: "Describe what makes your school distinctive in one or two sentences.",
      primaryCtaLabel: "Apply now",
      primaryCtaHref: "/admissions",
      secondaryCtaLabel: "Book a tour",
      secondaryCtaHref: "/contact",
      image: photoFor("cms-new-hero", 1600, 900),
    },
  },
  {
    type: "headline",
    label: "Announcement banner",
    description: "A single highlighted message, ideal for time-sensitive updates.",
    group: "Layout",
    defaults: { eyebrow: "Notice", title: "Announcement title", body: "Short supporting sentence." },
  },
  {
    type: "intro",
    label: "Introduction",
    description: "Text with a supporting image — good for a welcome section.",
    group: "Content",
    defaults: {
      title: "Introduction title",
      body: "Two to three sentences introducing this part of the school.",
      image: photoFor("cms-new-intro", 1200, 800),
    },
  },
  {
    type: "stats",
    label: "Statistics",
    description: "Four short figures such as students, faculty or placement rate.",
    group: "Content",
    defaults: {
      items: [
        { label: "Students", value: "1,180" },
        { label: "Faculty", value: "96" },
        { label: "Ratio", value: "12:1" },
        { label: "Placement", value: "98%" },
      ],
    },
  },
  {
    type: "rich_text",
    label: "Rich text",
    description: "A formatted text block for longer prose.",
    group: "Content",
    defaults: { title: "Section title", html: "<p>Write your content here.</p>" },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Closing prompt with a single button.",
    group: "Layout",
    defaults: {
      title: "Ready to join us?",
      body: "Tell visitors what to do next.",
      buttonLabel: "Get in touch",
      buttonHref: "/contact",
    },
  },
  {
    type: "featured_notices",
    label: "Featured notices",
    description: "Automatically pulls the latest published notices.",
    group: "Dynamic",
    defaults: { title: "Latest notices", count: 3, source: "published" },
  },
  {
    type: "featured_events",
    label: "Featured events",
    description: "Automatically pulls upcoming events from the calendar.",
    group: "Dynamic",
    defaults: { title: "Upcoming events", count: 4 },
  },
  {
    type: "gallery_grid",
    label: "Gallery grid",
    description: "Shows selected albums from the gallery.",
    group: "Dynamic",
    defaults: { title: "Life at school", albumIds: [] },
  },
  {
    type: "facilities",
    label: "Facilities",
    description: "Cards describing campus facilities.",
    group: "Content",
    defaults: { items: [{ title: "Facility", description: "Short description.", image: photoFor("cms-new-facility", 800, 600) }] },
  },
  {
    type: "achievements",
    label: "Achievements",
    description: "A list of awards and milestones by year.",
    group: "Content",
    defaults: { items: [{ year: "2026", title: "Achievement", description: "What was won and by whom." }] },
  },
  {
    type: "principal_message",
    label: "Principal's message",
    description: "A quote from school leadership with a portrait.",
    group: "Content",
    defaults: { name: "Principal name", role: "Principal", message: "A short message to families.", photo: "" },
  },
  {
    type: "contact_details",
    label: "Contact details",
    description: "Phone, email and address blocks.",
    group: "Contact",
    defaults: { phone: "", email: "", address: "" },
  },
  {
    type: "office_hours",
    label: "Office hours",
    description: "Weekday, weekend and holiday timings.",
    group: "Contact",
    defaults: { weekdays: "8:00 AM – 4:30 PM", saturday: "Closed", sunday: "Closed", note: "" },
  },
  {
    type: "social_links",
    label: "Social links",
    description: "Links to the school's social profiles.",
    group: "Contact",
    defaults: { facebook: "", instagram: "", x: "", youtube: "", linkedin: "" },
  },
  {
    type: "map",
    label: "Map & directions",
    description: "Coordinates and written directions to campus.",
    group: "Contact",
    defaults: { label: "Main Campus", latitude: "", longitude: "", directions: "" },
  },
  {
    type: "announcements",
    label: "Announcements",
    description: "Manually curated short announcements.",
    group: "Content",
    defaults: { items: [{ title: "Announcement", body: "Details…", date: new Date().toISOString().slice(0, 10) }] },
  },
  {
    type: "academics",
    label: "Academic information",
    description: "Programme overview with stage-by-stage detail.",
    group: "Content",
    defaults: { title: "Academics", body: "", programs: [{ title: "Stage", description: "What it covers." }] },
  },
  {
    type: "admissions_info",
    label: "Admission information",
    description: "Steps, deadlines and requirements for applicants.",
    group: "Content",
    defaults: { title: "Admissions", body: "", deadline: "", steps: [{ title: "Step", description: "What happens." }] },
  },
  {
    type: "faculty",
    label: "Faculty information",
    description: "Highlight teaching staff and department strength.",
    group: "Content",
    defaults: { title: "Our faculty", body: "", highlightStaffIds: [] },
  },
  {
    type: "mission_vision",
    label: "Mission & vision",
    description: "Mission statement, vision and core values.",
    group: "Content",
    defaults: { mission: "", vision: "", values: ["Curiosity", "Integrity"] },
  },
  {
    type: "history",
    label: "School history",
    description: "Narrative history with dated milestones.",
    group: "Content",
    defaults: { title: "Our history", body: "", image: "", milestones: [{ year: "2000", title: "Milestone" }] },
  },
];

export async function listWebsitePages(): Promise<WebsitePage[]> {
  await latency(200);
  return db().websitePages;
}

export async function getWebsitePage(key: WebsitePageKey): Promise<WebsitePage | null> {
  await latency(200);
  return db().websitePages.find((p) => p.key === key) ?? null;
}

function touch(page: WebsitePage, actor: Actor): void {
  page.updatedAt = nowIso();
  page.updatedBy = actor.name;
  page.hasUnpublishedChanges = true;
  persist();
}

function findPage(key: WebsitePageKey): WebsitePage {
  const page = db().websitePages.find((p) => p.key === key);
  if (!page) throw new Error("Page not found");
  return page;
}

export async function updateBlockFields(
  key: WebsitePageKey,
  blockId: string,
  fields: Record<string, unknown>,
  actor: Actor,
): Promise<WebsitePage> {
  await latency(280);
  const page = findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");
  block.fields = { ...block.fields, ...fields };
  block.updatedAt = nowIso();
  touch(page, actor);
  recordAudit({
    actor,
    action: "updated",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `Edited the ${block.label} section on the ${page.title} page`,
  });
  return page;
}

export async function toggleBlockVisibility(
  key: WebsitePageKey,
  blockId: string,
  actor: Actor,
): Promise<WebsitePage> {
  await latency(200);
  const page = findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");
  block.visible = !block.visible;
  block.updatedAt = nowIso();
  touch(page, actor);
  recordAudit({
    actor,
    action: "updated",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `${block.visible ? "Showed" : "Hid"} the ${block.label} section on ${page.title}`,
  });
  return page;
}

export async function moveBlock(
  key: WebsitePageKey,
  blockId: string,
  direction: "up" | "down",
  actor: Actor,
): Promise<WebsitePage> {
  await latency(180);
  const page = findPage(key);
  const sorted = [...page.blocks].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((b) => b.id === blockId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= sorted.length) return page;
  [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
  sorted.forEach((b, i) => {
    b.order = i;
  });
  page.blocks = sorted;
  touch(page, actor);
  return page;
}

export async function reorderBlocks(
  key: WebsitePageKey,
  orderedIds: string[],
  actor: Actor,
): Promise<WebsitePage> {
  await latency(180);
  const page = findPage(key);
  page.blocks = orderedIds
    .map((id, index) => {
      const block = page.blocks.find((b) => b.id === id);
      return block ? { ...block, order: index } : null;
    })
    .filter(Boolean) as ContentBlock[];
  touch(page, actor);
  recordAudit({
    actor,
    action: "updated",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `Reordered sections on the ${page.title} page`,
  });
  return page;
}

export async function addBlock(key: WebsitePageKey, type: BlockType, actor: Actor): Promise<WebsitePage> {
  await latency(300);
  const page = findPage(key);
  const template = BLOCK_LIBRARY.find((b) => b.type === type);
  if (!template) throw new Error("Unknown block type");
  page.blocks.push({
    id: uid("blk"),
    type,
    label: template.label,
    visible: true,
    order: page.blocks.length,
    fields: JSON.parse(JSON.stringify(template.defaults)),
    updatedAt: nowIso(),
  });
  touch(page, actor);
  recordAudit({
    actor,
    action: "created",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `Added a ${template.label} section to the ${page.title} page`,
  });
  return page;
}

export async function duplicateBlock(key: WebsitePageKey, blockId: string, actor: Actor): Promise<WebsitePage> {
  await latency(240);
  const page = findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");
  page.blocks.push({
    ...JSON.parse(JSON.stringify(block)),
    id: uid("blk"),
    label: `${block.label} (copy)`,
    order: page.blocks.length,
    updatedAt: nowIso(),
  });
  touch(page, actor);
  return page;
}

export async function deleteBlock(key: WebsitePageKey, blockId: string, actor: Actor): Promise<WebsitePage> {
  await latency(260);
  const page = findPage(key);
  const block = page.blocks.find((b) => b.id === blockId);
  page.blocks = page.blocks.filter((b) => b.id !== blockId).map((b, i) => ({ ...b, order: i }));
  touch(page, actor);
  if (block) {
    recordAudit({
      actor,
      action: "deleted",
      resourceType: "website_page",
      resourceId: page.id,
      resourceLabel: page.title,
      summary: `Removed the ${block.label} section from the ${page.title} page`,
    });
  }
  return page;
}

export async function updatePageSeo(
  key: WebsitePageKey,
  seo: WebsitePage["seo"],
  actor: Actor,
): Promise<WebsitePage> {
  await latency(260);
  const page = findPage(key);
  page.seo = seo;
  touch(page, actor);
  return page;
}

export async function publishPage(key: WebsitePageKey, actor: Actor): Promise<WebsitePage> {
  await latency(520);
  const page = findPage(key);
  page.status = "published";
  page.hasUnpublishedChanges = false;
  page.publishedAt = nowIso();
  page.updatedAt = nowIso();
  page.updatedBy = actor.name;
  persist();
  recordAudit({
    actor,
    action: "published",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `Published the ${page.title} page to the public website`,
  });
  pushNotification({
    kind: "system",
    title: "Website updated",
    body: `The ${page.title} page is now live.`,
    severity: "success",
    href: `/website?page=${page.key}`,
    actorName: actor.name,
  });
  return page;
}

export async function unpublishPage(key: WebsitePageKey, actor: Actor): Promise<WebsitePage> {
  await latency(360);
  const page = findPage(key);
  page.status = "draft";
  page.hasUnpublishedChanges = true;
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "website_page",
    resourceId: page.id,
    resourceLabel: page.title,
    summary: `Reverted the ${page.title} page to draft`,
  });
  return page;
}

// ------------------------------------------------------------------- settings

export async function getSettings(): Promise<SchoolSettings> {
  await latency(200);
  return db().settings;
}

export async function updateSettings(
  patch: Partial<SchoolSettings>,
  actor: Actor,
  section = "School",
): Promise<SchoolSettings> {
  await latency(420);
  Object.assign(db().settings, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "settings",
    resourceId: "settings",
    resourceLabel: section,
    summary: `Updated ${section} settings`,
  });
  return db().settings;
}

export async function listBranches(): Promise<Branch[]> {
  await latency(160);
  return db().branches;
}

export async function createBranch(
  input: { name: string; code: string; address: string; phone: string },
  actor: Actor,
): Promise<Branch> {
  await latency(400);
  const branch: Branch = { id: uid("branch"), ...input, isMain: false, studentCount: 0 };
  db().branches.push(branch);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "branch",
    resourceId: branch.id,
    resourceLabel: branch.name,
    summary: `Added branch ${branch.name} (${branch.code})`,
  });
  return branch;
}

export async function listAcademicYears(): Promise<AcademicYear[]> {
  await latency(160);
  return db().academicYears;
}

export async function setCurrentAcademicYear(id: string, actor: Actor): Promise<AcademicYear[]> {
  await latency(320);
  db().academicYears.forEach((y) => {
    y.isCurrent = y.id === id;
    if (y.isCurrent) y.status = "active";
  });
  persist();
  const current = db().academicYears.find((y) => y.id === id);
  recordAudit({
    actor,
    action: "updated",
    resourceType: "academic_year",
    resourceId: id,
    resourceLabel: current?.label ?? id,
    summary: `Set ${current?.label} as the current academic year`,
  });
  return db().academicYears;
}


export async function updateBranch(
  id: string,
  patch: Partial<Branch>,
  actor: Actor,
): Promise<Branch> {
  await latency(340);
  const branch = db().branches.find((b) => b.id === id);
  if (!branch) throw new Error("Branch not found");
  Object.assign(branch, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "branch",
    resourceId: branch.id,
    resourceLabel: branch.name,
    summary: `Updated branch ${branch.name}`,
  });
  return branch;
}

export async function deleteBranch(id: string, actor: Actor): Promise<void> {
  await latency(320);
  const branch = db().branches.find((b) => b.id === id);
  if (!branch) throw new Error("Branch not found");
  if (branch.isMain) throw new Error("The main campus cannot be removed");
  db().branches = db().branches.filter((b) => b.id !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "branch",
    resourceId: id,
    resourceLabel: branch.name,
    summary: `Removed branch ${branch.name}`,
  });
}

export async function createAcademicYear(
  input: { label: string; startDate: string; endDate: string },
  actor: Actor,
): Promise<AcademicYear> {
  await latency(400);
  const year: AcademicYear = {
    id: uid("ay"),
    ...input,
    isCurrent: false,
    status: "planning",
  };
  db().academicYears.push(year);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "academic_year",
    resourceId: year.id,
    resourceLabel: year.label,
    summary: `Created academic year ${year.label}`,
  });
  return year;
}

export async function closeAcademicYear(id: string, actor: Actor): Promise<AcademicYear> {
  await latency(340);
  const year = db().academicYears.find((y) => y.id === id);
  if (!year) throw new Error("Academic year not found");
  if (year.isCurrent) throw new Error("Set another year as current before closing this one");
  year.status = "closed";
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "academic_year",
    resourceId: year.id,
    resourceLabel: year.label,
    summary: `Closed academic year ${year.label}`,
  });
  return year;
}
