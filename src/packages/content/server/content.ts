import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "#/lib/prisma";
import { setResponseHeaders } from "@tanstack/react-start/server";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import type { SchoolConfig, SchoolContent, SidebarContent } from "#/types/school";

const PageKeySchema = z.object({
  key: z.enum(["homepage", "about", "contact", "other"]),
});

const StringSchema = z.object({
  identifier: z.string(),
});

const PUBLIC_CACHE_HEADERS = new Headers({
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

function toWebsitePageContent(page: {
  blocks: Array<{
    id: string;
    type: string;
    label: string;
    visible: boolean;
    order: number;
    fields: unknown;
    updatedAt: Date;
    createdAt: Date;
  }>;
} & Omit<{
  id: string;
  key: string;
  title: string;
  path: string;
  status: string;
  hasUnpublishedChanges: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  updatedBy: string;
  createdAt: Date;
}, "blocks">): WebsitePageContent {
  return {
    id: page.id,
    key: page.key,
    title: page.title,
    path: page.path,
    status: page.status,
    hasUnpublishedChanges: page.hasUnpublishedChanges,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    seoKeywords: page.seoKeywords ?? "",
    blocks: page.blocks.map((block) => ({
      id: block.id,
      type: block.type,
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

export const getWebsitePageServer = createServerFn({ method: "GET" })
  .validator(PageKeySchema)
  .handler(async ({ data: { key } }) => {
    setResponseHeaders(PUBLIC_CACHE_HEADERS);
    const page = await prisma.websitePage.findUnique({
      where: { key, status: "published" },
      include: { blocks: { where: { visible: true }, orderBy: { order: "asc" } } },
    });
    return page ? toWebsitePageContent(page) : null;
  });

export const getSchoolConfigServer = createServerFn({ method: "GET" })
  .validator(StringSchema)
  .handler(async ({ data: { identifier } }) => {
    setResponseHeaders(PUBLIC_CACHE_HEADERS);
    const org = await prisma.organization.findUnique({
      where: { slug: identifier },
      include: {
        branches: {
          take: 1,
        },
      },
    });
    if (!org) return null;

    const mainBranch = org.branches[0];
    const config: SchoolConfig = {
      organization: {
        name: org.name,
        slug: org.slug,
      },
      theme: {
        template: "modern",
        primary: "#1a1a2e",
      },
      features: {
        clubs: true,
        events: true,
        notices: true,
      },
      contact: {
        phone: mainBranch?.phone ?? "",
        email: mainBranch?.email ?? "",
      },
      seo: {
        title: org.name,
        description: org.description ?? "",
      },
    };
    return config;
  });

export const getSchoolContentServer = createServerFn({ method: "GET" })
  .validator(StringSchema)
  .handler(async ({ data: { identifier } }) => {
    setResponseHeaders(PUBLIC_CACHE_HEADERS);
    const org = await prisma.organization.findUnique({
      where: { slug: identifier },
      include: {
        branches: true,
      },
    });
    if (!org) return null;

    const sidebarContent: SidebarContent = {
      logo: org.logo ?? "",
      tagline: org.description ?? "",
      collapsible: {
        about: { id: "about", label: "About", href: "/about" },
        courses: { id: "courses", label: "Courses", href: "/courses" },
        facilities: { id: "facilities", label: "Facilities", href: "/facilities" },
        gallery: { id: "gallery", label: "Gallery", href: "/gallery" },
        moreInfo: { id: "moreInfo", label: "More Info" },
        contact: { id: "contact", label: "Contact", href: "/contact" },
      },
    };

    const content: SchoolContent = {
      sidebar: sidebarContent,
      login: {},
    };
    return content;
  });

export const getAllPublishedPagesServer = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders(PUBLIC_CACHE_HEADERS);
  const pages = await prisma.websitePage.findMany({
    where: { status: "published" },
    include: { blocks: { where: { visible: true }, orderBy: { order: "asc" } } },
  });
  return pages.map(toWebsitePageContent);
});