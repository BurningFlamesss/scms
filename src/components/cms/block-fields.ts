import type { BlockType } from "@/types";

// ---------------------------------------------------------------------------
// Field schema per content block.
//
// The inspector renders itself from this schema, which keeps the CMS generic:
// adding a new block type only requires a library entry (services/website.ts)
// plus a field list here.
// ---------------------------------------------------------------------------

export type FieldKind = "text" | "textarea" | "richtext" | "image" | "number" | "date" | "url";

export interface ItemFieldDef {
  key: string;
  label: string;
  kind: "text" | "textarea" | "image";
}

export type FieldDef =
  | { key: string; label: string; kind: FieldKind; placeholder?: string; help?: string }
  | { key: string; label: string; kind: "tags"; placeholder?: string; help?: string }
  | {
      key: string;
      label: string;
      kind: "list";
      addLabel: string;
      itemLabel: string;
      itemFields: ItemFieldDef[];
      help?: string;
    };

export const BLOCK_FIELDS: Record<BlockType, FieldDef[]> = {
  hero: [
    { key: "eyebrow", label: "Eyebrow", kind: "text", placeholder: "Admissions open" },
    { key: "headline", label: "Headline", kind: "text" },
    { key: "subheadline", label: "Supporting text", kind: "textarea" },
    { key: "primaryCtaLabel", label: "Primary button label", kind: "text" },
    { key: "primaryCtaHref", label: "Primary button link", kind: "url", placeholder: "/admissions" },
    { key: "secondaryCtaLabel", label: "Secondary button label", kind: "text" },
    { key: "secondaryCtaHref", label: "Secondary button link", kind: "url", placeholder: "/contact" },
    { key: "image", label: "Hero image", kind: "image" },
  ],
  headline: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
  ],
  intro: [
    { key: "title", label: "Title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
    { key: "image", label: "Image", kind: "image" },
  ],
  stats: [
    {
      key: "items",
      label: "Figures",
      kind: "list",
      addLabel: "Add figure",
      itemLabel: "Figure",
      itemFields: [
        { key: "label", label: "Label", kind: "text" },
        { key: "value", label: "Value", kind: "text" },
      ],
    },
  ],
  cta: [
    { key: "title", label: "Title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
    { key: "buttonLabel", label: "Button label", kind: "text" },
    { key: "buttonHref", label: "Button link", kind: "url" },
  ],
  featured_events: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "count", label: "How many to show", kind: "number", help: "Pulled live from the events calendar" },
  ],
  featured_notices: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "count", label: "How many to show", kind: "number", help: "Pulled live from published notices" },
  ],
  rich_text: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "html", label: "Content", kind: "richtext" },
  ],
  history: [
    { key: "title", label: "Title", kind: "text" },
    { key: "body", label: "Narrative", kind: "textarea" },
    { key: "image", label: "Image", kind: "image" },
    {
      key: "milestones",
      label: "Milestones",
      kind: "list",
      addLabel: "Add milestone",
      itemLabel: "Milestone",
      itemFields: [
        { key: "year", label: "Year", kind: "text" },
        { key: "title", label: "What happened", kind: "text" },
      ],
    },
  ],
  mission_vision: [
    { key: "mission", label: "Mission", kind: "textarea" },
    { key: "vision", label: "Vision", kind: "textarea" },
    { key: "values", label: "Core values", kind: "tags", placeholder: "Add a value and press Enter" },
  ],
  principal_message: [
    { key: "name", label: "Name", kind: "text" },
    { key: "role", label: "Role", kind: "text" },
    { key: "message", label: "Message", kind: "textarea" },
    { key: "photo", label: "Portrait", kind: "image" },
  ],
  facilities: [
    {
      key: "items",
      label: "Facilities",
      kind: "list",
      addLabel: "Add facility",
      itemLabel: "Facility",
      itemFields: [
        { key: "title", label: "Name", kind: "text" },
        { key: "description", label: "Description", kind: "textarea" },
        { key: "image", label: "Image", kind: "image" },
      ],
    },
  ],
  achievements: [
    {
      key: "items",
      label: "Achievements",
      kind: "list",
      addLabel: "Add achievement",
      itemLabel: "Achievement",
      itemFields: [
        { key: "year", label: "Year", kind: "text" },
        { key: "title", label: "Title", kind: "text" },
        { key: "description", label: "Description", kind: "textarea" },
      ],
    },
  ],
  contact_details: [
    { key: "phone", label: "Phone", kind: "text" },
    { key: "secondaryPhone", label: "Secondary phone", kind: "text" },
    { key: "email", label: "Email", kind: "text" },
    { key: "admissionsEmail", label: "Admissions email", kind: "text" },
    { key: "address", label: "Address", kind: "textarea" },
  ],
  office_hours: [
    { key: "weekdays", label: "Weekdays", kind: "text" },
    { key: "saturday", label: "Saturday", kind: "text" },
    { key: "sunday", label: "Sunday", kind: "text" },
    { key: "note", label: "Note", kind: "textarea" },
  ],
  social_links: [
    { key: "facebook", label: "Facebook", kind: "url" },
    { key: "instagram", label: "Instagram", kind: "url" },
    { key: "x", label: "X", kind: "url" },
    { key: "youtube", label: "YouTube", kind: "url" },
    { key: "linkedin", label: "LinkedIn", kind: "url" },
  ],
  map: [
    { key: "label", label: "Location label", kind: "text" },
    { key: "latitude", label: "Latitude", kind: "text" },
    { key: "longitude", label: "Longitude", kind: "text" },
    { key: "directions", label: "Directions", kind: "textarea" },
  ],
  announcements: [
    {
      key: "items",
      label: "Announcements",
      kind: "list",
      addLabel: "Add announcement",
      itemLabel: "Announcement",
      itemFields: [
        { key: "title", label: "Title", kind: "text" },
        { key: "body", label: "Body", kind: "textarea" },
        { key: "date", label: "Date", kind: "text" },
      ],
    },
  ],
  gallery_grid: [{ key: "title", label: "Section title", kind: "text", help: "Albums are pulled from the gallery" }],
  faculty: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
  ],
  academics: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
    {
      key: "programs",
      label: "Programmes",
      kind: "list",
      addLabel: "Add programme",
      itemLabel: "Programme",
      itemFields: [
        { key: "title", label: "Title", kind: "text" },
        { key: "description", label: "Description", kind: "textarea" },
      ],
    },
  ],
  admissions_info: [
    { key: "title", label: "Section title", kind: "text" },
    { key: "body", label: "Body", kind: "textarea" },
    { key: "deadline", label: "Deadline", kind: "date" },
    {
      key: "steps",
      label: "Steps",
      kind: "list",
      addLabel: "Add step",
      itemLabel: "Step",
      itemFields: [
        { key: "title", label: "Title", kind: "text" },
        { key: "description", label: "Description", kind: "textarea" },
      ],
    },
  ],
  // The sign-in page is composed from these four section types; each one maps
  // to a region of the auth layout (visual column, panel intro, form, footer).
  auth_visual: [
    { key: "image", label: "Image", kind: "image" },
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "headline", label: "Headline", kind: "text" },
    { key: "subheadline", label: "Supporting text", kind: "textarea" },
  ],
  auth_intro: [
    { key: "kicker", label: "Kicker", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "intro", label: "Intro", kind: "textarea" },
  ],
  auth_form: [
    { key: "backLabel", label: "Back link label", kind: "text" },
    { key: "emailLabel", label: "Email field label", kind: "text" },
    { key: "passwordLabel", label: "Password field label", kind: "text" },
    { key: "forgotLabel", label: "Forgot password label", kind: "text" },
    { key: "submitLabel", label: "Submit button label", kind: "text" },
    { key: "disclosure", label: "Disclosure text", kind: "textarea" },
  ],
  auth_contact: [
    { key: "title", label: "Title", kind: "text" },
    { key: "linkLabel", label: "Link label", kind: "text" },
    { key: "linkHref", label: "Link", kind: "url", placeholder: "/contact" },
  ],
  // The faculty & administration page sections: header plus the two heading
  // strips above the leadership cards and the directory. The cards and rows
  // under them stay data-driven (managed on the Teachers & Staffs tab).
  faculty_header: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "textarea" },
  ],
  faculty_leadership: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "description", label: "Intro copy", kind: "textarea" },
  ],
  faculty_directory: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "description", label: "Intro copy", kind: "textarea" },
  ],
};

/** Section types that only make sense on the sign-in page. */
export const AUTH_BLOCK_TYPES: BlockType[] = ["auth_visual", "auth_intro", "auth_form", "auth_contact"];

// -------------------------------------------------------------- style presets

export const STYLE_BACKGROUNDS = [
  { value: "default", label: "Plain" },
  { value: "subtle", label: "Subtle tint" },
  { value: "wash", label: "Brand wash" },
];

export const STYLE_SPACING = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "spacious", label: "Spacious" },
];

export const STYLE_ALIGNMENT = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centred" },
];

export const BACKGROUND_CLASS: Record<string, string> = {
  default: "bg-surface-1",
  subtle: "bg-surface-2",
  wash: "header-wash bg-surface-1",
};

export const SPACING_CLASS: Record<string, string> = {
  compact: "px-4 py-4",
  normal: "px-5 py-6",
  spacious: "px-6 py-10",
};

// ------------------------------------------------------------------- helpers

export function str(fields: Record<string, unknown>, key: string, fallback = ""): string {
  const value = fields[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function num(fields: Record<string, unknown>, key: string, fallback = 0): number {
  const value = fields[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return fallback;
}

export function rows(fields: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = fields[key];
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function tags(fields: Record<string, unknown>, key: string): string[] {
  const value = fields[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
