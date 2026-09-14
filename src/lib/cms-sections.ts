import type { BlockType, ContentBlock } from "@/types";

// ---------------------------------------------------------------------------
// Fixed-section model for the two live-preview pages.
//
// The faculty and sign-in pages are no longer assembled from drag-and-drop
// blocks. Each page has a fixed list of sections; admins click a section in a
// live preview and edit its fields, which upsert a per-type content block on
// the page. This module is the single source of truth for which sections exist
// per page, their labels and the default copy shown when a section has not
// been saved yet.
// ---------------------------------------------------------------------------

export type CmsPageKey = "faculty" | "login";

export const LOGIN_SECTION_TYPES: BlockType[] = [
	"auth_visual",
	"auth_intro",
	"auth_form",
	"auth_contact",
];

export const FACULTY_SECTION_TYPES: BlockType[] = [
	"faculty_header",
	"faculty_leadership",
	"faculty_directory",
];

export function pageSectionTypes(pageKey: CmsPageKey): BlockType[] {
	return pageKey === "faculty" ? FACULTY_SECTION_TYPES : LOGIN_SECTION_TYPES;
}

export const SECTION_LABELS: Partial<Record<BlockType, string>> = {
	auth_visual: "Visual column",
	auth_intro: "Intro",
	auth_form: "Form",
	auth_contact: "Footer",
	faculty_header: "Header",
	faculty_leadership: "Leadership heading",
	faculty_directory: "Directory heading",
};

/** Default copy for every fixed section — mirrors the static public fallbacks. */
export const SECTION_DEFAULTS: Partial<
	Record<BlockType, Record<string, unknown>>
> = {
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
		disclosure:
			"Frontend demonstration — no credentials are transmitted or stored.",
	},
	auth_contact: {
		title: "Don't have access?",
		linkLabel: "Contact the school",
		linkHref: "/contact",
	},
	faculty_header: {
		eyebrow: "Administration",
		title: "Administration & Faculty",
		subtitle:
			"Every member of staff, with their qualification, the subjects they teach and the hours they keep an open door.",
	},
	faculty_leadership: {
		eyebrow: "Leadership",
		title: "Who runs what",
		description:
			"The six people who carry responsibility for the school. Select a card to see the full profile, office hours and contact details.",
	},
	faculty_directory: {
		eyebrow: "Directory",
		title: "Teaching and support faculty",
		description:
			"Search by name, subject or qualification, or narrow the list to a single department.",
	},
};

export function sectionLabel(type: BlockType): string {
	return SECTION_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Default fields for a section, used to seed the editor and create blocks. */
export function sectionDefaults(type: BlockType): Record<string, unknown> {
	return SECTION_DEFAULTS[type] ?? {};
}

/** Fields for a section on a page, if a block of that type has been saved. */
export function getSectionFields(
	blocks: ContentBlock[] | null | undefined,
	type: BlockType,
): Record<string, unknown> | undefined {
	return blocks?.find((block) => block.type === type)?.fields;
}
