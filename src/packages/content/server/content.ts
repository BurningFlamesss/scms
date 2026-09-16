import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { prisma } from "#/lib/prisma";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import type { Notice, Person, Scholarship } from "#/types";
import type {
	SchoolConfig,
	SchoolContent,
	SidebarContent,
} from "#/types/school";

const PageKeySchema = z.object({
	key: z.enum(["homepage", "about", "contact", "other", "faculty", "login"]),
});

const StringSchema = z.object({
	identifier: z.string(),
});

const PUBLIC_CACHE_HEADERS = new Headers({
	"Cache-Control":
		"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

function toWebsitePageContent(
	page: {
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
	} & Omit<
		{
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
		},
		"blocks"
	>,
): WebsitePageContent {
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

/** Published page for a managed key (public rendering). */
export const getWebsitePageServer = createServerFn({ method: "GET" })
	.validator(PageKeySchema)
	.handler(async ({ data: { key } }) => {
		setResponseHeaders(PUBLIC_CACHE_HEADERS);
		const page = await prisma.websitePage.findUnique({
			where: { key, status: "published" },
			include: {
				blocks: { where: { visible: true }, orderBy: { order: "asc" } },
			},
		});
		return page ? toWebsitePageContent(page) : null;
	});

/**
 * Any-status page for a managed key, used by the admin live preview
 * (`?cms=1`), so drafts render WYSIWYG before being published. Not cached.
 */
export const getWebsitePagePreviewServer = createServerFn({ method: "GET" })
	.validator(PageKeySchema)
	.handler(async ({ data: { key } }) => {
		const page = await prisma.websitePage.findUnique({
			where: { key },
			include: {
				blocks: { where: { visible: true }, orderBy: { order: "asc" } },
			},
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
			home: { id: "home", label: "HOME", href: "/" },
			about: { id: "about", label: "ABOUT", href: "/about" },
			courses: { id: "courses", label: "COURSES", href: "/user/courses-page-detail" },
			facilities: { id: "facilities", label: "FACILITIES", href: "/user/facilities-page-detail" },
			gallery: { id: "gallery", label: "GALLERY", href: "/gallery" },
			moreInfo: {
				id: "moreInfo",
				label: "More Info",
				children: [
					{ id: "faculty", label: "Faculty", href: "/user/faculty-page-detail" },
					{ id: "notices", label: "Notices", href: "/user/notices-page-detail" },
					{ id: "scholarships", label: "Scholarships", href: "/user/scholarships-page-detail" },
					{ id: "calendar", label: "Calendar", href: "/calendar" },
					{ id: "transportation", label: "Transportation", href: "/user/transportation" },
					{ id: "result", label: "Result", href: "/user/result" },
					{ id: "course-finder", label: "Course Finder", href: "/user/course-finder" },
				],
			},
			contact: { id: "contact", label: "CONTACT", href: "/contact" },
		},
	};

		const content: SchoolContent = {
			sidebar: sidebarContent,
			login: {},
		};
		return content;
	});

export const getAllPublishedPagesServer = createServerFn({
	method: "GET",
}).handler(async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	const pages = await prisma.websitePage.findMany({
		where: { status: "published" },
		include: {
			blocks: { where: { visible: true }, orderBy: { order: "asc" } },
		},
	});
	return pages.map(toWebsitePageContent);
});

// ---------------------------------------------------------------------------
// Public content collections (faculty / notices / scholarships). These power
// the /user/*-page-detail routes from the database, mirroring the static
// src/lib types so the pages can fall back to their static data when the
// collection has not been seeded yet.
// ---------------------------------------------------------------------------

interface FacultyMemberRow {
	slug: string;
	name: string;
	role: string;
	department: string;
	qualification: string;
	experience: string;
	subjects: unknown;
	email: string;
	extension: string;
	officeHours: string;
	bio: string;
	joined: string;
	leadership: boolean;
	rank: number | null;
}

function toPerson(row: FacultyMemberRow): Person {
	return {
		id: row.slug,
		name: row.name,
		role: row.role,
		department: row.department as Person["department"],
		qualification: row.qualification,
		experience: row.experience,
		subjects: Array.isArray(row.subjects) ? (row.subjects as string[]) : [],
		email: row.email,
		extension: row.extension,
		officeHours: row.officeHours,
		bio: row.bio,
		joined: row.joined,
		leadership: row.leadership || undefined,
		rank: row.rank ?? undefined,
	};
}

interface NoticeRow {
	ref: string;
	title: string;
	category: string;
	dateAd: string;
	dateBs: string;
	audience: string;
	issuedBy: string;
	summary: string;
	body: unknown;
	bullets: unknown;
	table: unknown;
	attachments: unknown;
	pinned: boolean;
}

function toNotice(row: NoticeRow): Notice {
	return {
		id: row.ref,
		ref: row.ref,
		title: row.title,
		category: row.category as Notice["category"],
		dateAd: row.dateAd,
		dateBs: row.dateBs,
		audience: row.audience,
		issuedBy: row.issuedBy,
		summary: row.summary,
		body: Array.isArray(row.body) ? (row.body as string[]) : [],
		bullets: Array.isArray(row.bullets) ? (row.bullets as string[]) : undefined,
		table: row.table ? (row.table as Notice["table"]) : undefined,
		attachments: Array.isArray(row.attachments)
			? (row.attachments as Notice["attachments"])
			: [],
		pinned: row.pinned || undefined,
	};
}

interface ScholarshipRow {
	ref: string;
	name: string;
	nepaliName: string;
	category: string;
	coverage: number;
	award: string;
	amountNpr: number;
	seats: number;
	deadlineAd: string;
	deadlineBs: string;
	appliesTo: string;
	summary: string;
	description: string;
	eligibility: unknown;
	benefits: unknown;
	documents: unknown;
	process: unknown;
	renewal: string;
	contact: string;
	spotlight: boolean;
}

function toScholarship(row: ScholarshipRow): Scholarship {
	return {
		id: row.ref,
		ref: row.ref,
		name: row.name,
		nepaliName: row.nepaliName,
		category: row.category as Scholarship["category"],
		coverage: row.coverage,
		award: row.award,
		amountNpr: row.amountNpr,
		seats: row.seats,
		deadlineAd: row.deadlineAd,
		deadlineBs: row.deadlineBs,
		appliesTo: row.appliesTo,
		summary: row.summary,
		description: row.description,
		eligibility: Array.isArray(row.eligibility)
			? (row.eligibility as Scholarship["eligibility"])
			: [],
		benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
		documents: Array.isArray(row.documents) ? (row.documents as string[]) : [],
		process: Array.isArray(row.process) ? (row.process as string[]) : [],
		renewal: row.renewal,
		contact: row.contact,
		spotlight: row.spotlight || undefined,
	};
}

/** Public faculty directory, sorted leadership-first by rank. */
export const getFacultyMembersServer = createServerFn({
	method: "GET",
}).handler(async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	const rows = await prisma.facultyMember.findMany({
		orderBy: [{ leadership: "desc" }, { rank: "asc" }, { order: "asc" }],
	});
	return rows.map(toPerson);
});

/** Public notice board, pinned first then newest date first. */
export const getNoticesServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setResponseHeaders(PUBLIC_CACHE_HEADERS);
		const rows = await prisma.notice.findMany({
			orderBy: [{ pinned: "desc" }, { dateAd: "desc" }],
		});
		return rows.map(toNotice);
	},
);

/** Public scholarship schemes in their editorial (seed) order. */
export const getScholarshipsServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setResponseHeaders(PUBLIC_CACHE_HEADERS);
		const rows = await prisma.scholarship.findMany({
			orderBy: { order: "asc" },
		});
		return rows.map(toScholarship);
	},
);
