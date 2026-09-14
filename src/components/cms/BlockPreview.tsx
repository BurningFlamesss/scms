import { CalendarDays, Facebook, Instagram, Linkedin, Mail, MapPin, Megaphone, Phone, Youtube } from "lucide-react";
import {
  BACKGROUND_CLASS,
  SPACING_CLASS,
  num,
  rows,
  str,
  tags,
} from "#/components/cms/block-fields";
import { formatDate } from "#/lib/format";
import { cn } from "#/lib/utils";
import type { Album, ContentBlock, Notice, SchoolEvent } from "#/types";

export interface PreviewData {
  notices: Notice[];
  events: SchoolEvent[];
  albums: Album[];
}

interface BlockPreviewProps {
  block: ContentBlock;
  data: PreviewData;
  active?: boolean;
  onSelect?: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">{children}</h3>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

function FauxButton({ label, primary = false }: { label: string; primary?: boolean }) {
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium",
        primary
          ? "bg-primary text-primary-foreground"
          : "border border-hairline bg-surface-1 text-foreground",
      )}
    >
      {label}
    </span>
  );
}

/** Renders a single content block the way a public website visitor would see it. */
export function BlockPreview({ block, data, active = false, onSelect }: BlockPreviewProps) {
  const fields = block.fields;
  const background = BACKGROUND_CLASS[str(fields, "styleBackground", "default")] ?? BACKGROUND_CLASS.default;
  const spacing = SPACING_CLASS[str(fields, "styleSpacing", "normal")] ?? SPACING_CLASS.normal;
  const align = str(fields, "styleAlign", "left") === "center" ? "text-center" : "text-left";

  const inner = (() => {
    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-3">
            {str(fields, "eyebrow") && <p className="eyebrow-label">{str(fields, "eyebrow")}</p>}
            <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground">
              {str(fields, "headline", "Headline")}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">{str(fields, "subheadline")}</p>
            <div className={cn("flex flex-wrap gap-2", align === "text-center" && "justify-center")}>
              <FauxButton label={str(fields, "primaryCtaLabel")} primary />
              <FauxButton label={str(fields, "secondaryCtaLabel")} />
            </div>
            {str(fields, "image") && (
              <img
                src={str(fields, "image")}
                alt=""
                className="mt-1 aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
              />
            )}
          </div>
        );

      case "headline":
        return (
          <div>
            {str(fields, "eyebrow") && <p className="eyebrow-label mb-1">{str(fields, "eyebrow")}</p>}
            <SectionTitle>{str(fields, "title", "Announcement")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
          </div>
        );

      case "intro":
        return (
          <div className="space-y-3">
            <SectionTitle>{str(fields, "title", "Introduction")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
            {str(fields, "image") && (
              <img
                src={str(fields, "image")}
                alt=""
                className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
              />
            )}
          </div>
        );

      case "stats":
        return (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {rows(fields, "items").map((item, index) => (
              <div key={index} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                <p className="num font-display text-base font-semibold text-foreground">
                  {String(item.value ?? "—")}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{String(item.label ?? "")}</p>
              </div>
            ))}
          </div>
        );

      case "cta":
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Ready to join us?")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
            <div className={cn("flex", align === "text-center" && "justify-center")}>
              <FauxButton label={str(fields, "buttonLabel", "Get in touch")} primary />
            </div>
          </div>
        );

      case "featured_notices": {
        const count = num(fields, "count", 3) || 3;
        const items = data.notices.slice(0, count);
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Latest notices")}</SectionTitle>
            {items.length === 0 ? (
              <Body>No published notices to show yet.</Body>
            ) : (
              <ul className="space-y-2">
                {items.map((notice) => (
                  <li key={notice.id} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Megaphone className="h-3 w-3 shrink-0 text-primary" />
                      <span className="min-w-0 truncate">{notice.title}</span>
                    </p>
                    <p className="num mt-0.5 text-[11px] text-muted-foreground">{formatDate(notice.publishAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      case "featured_events": {
        const count = num(fields, "count", 4) || 4;
        const items = data.events.slice(0, count);
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Upcoming events")}</SectionTitle>
            {items.length === 0 ? (
              <Body>No upcoming events on the calendar.</Body>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((event) => (
                  <li key={event.id} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <CalendarDays className="h-3 w-3 shrink-0 text-primary" />
                      <span className="min-w-0 truncate">{event.title}</span>
                    </p>
                    <p className="num mt-0.5 text-[11px] text-muted-foreground">
                      {formatDate(event.startDate)} · {event.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      case "gallery_grid": {
        const albums = data.albums.slice(0, 3);
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Life at school")}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {albums.map((album) => {
                const cover = album.images.find((image) => image.id === album.coverImageId) ?? album.images[0];
                return (
                  <div key={album.id} className="overflow-hidden rounded-lg border border-hairline">
                    {cover ? (
                      <img src={cover.url} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-surface-2" />
                    )}
                    <p className="truncate px-2 py-1 text-[11px] text-muted-foreground">{album.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case "rich_text":
        return (
          <div>
            {str(fields, "title") && <SectionTitle>{str(fields, "title")}</SectionTitle>}
            <div
              className="prose-editor mt-2 text-xs"
              dangerouslySetInnerHTML={{ __html: str(fields, "html", "<p></p>") }}
            />
          </div>
        );

      case "history":
        return (
          <div className="space-y-3">
            <SectionTitle>{str(fields, "title", "Our history")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
            {str(fields, "image") && (
              <img
                src={str(fields, "image")}
                alt=""
                className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
              />
            )}
            <ol className="space-y-1.5">
              {rows(fields, "milestones").map((item, index) => (
                <li key={index} className="flex gap-2 text-xs">
                  <span className="num w-10 shrink-0 font-medium text-primary">{String(item.year ?? "")}</span>
                  <span className="min-w-0 text-muted-foreground">{String(item.title ?? "")}</span>
                </li>
              ))}
            </ol>
          </div>
        );

      case "mission_vision":
        return (
          <div className="space-y-3">
            <div>
              <p className="eyebrow-label mb-1">Mission</p>
              <p className="text-xs leading-relaxed text-foreground">{str(fields, "mission")}</p>
            </div>
            <div>
              <p className="eyebrow-label mb-1">Vision</p>
              <p className="text-xs leading-relaxed text-foreground">{str(fields, "vision")}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags(fields, "values").map((value) => (
                <span
                  key={value}
                  className="rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        );

      case "principal_message":
        return (
          <figure className="flex gap-3">
            {str(fields, "photo") && (
              <img
                src={str(fields, "photo")}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border border-hairline object-cover"
              />
            )}
            <div className="min-w-0">
              <blockquote className="border-l-2 border-primary pl-2.5 text-xs italic leading-relaxed text-foreground">
                {str(fields, "message")}
              </blockquote>
              <figcaption className="mt-1.5 text-[11px] text-muted-foreground">
                {str(fields, "name")} · {str(fields, "role")}
              </figcaption>
            </div>
          </figure>
        );

      case "facilities":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            {rows(fields, "items").map((item, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-hairline bg-surface-1">
                {typeof item.image === "string" && item.image && (
                  <img src={item.image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
                )}
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium text-foreground">{String(item.title ?? "")}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {String(item.description ?? "")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "achievements":
        return (
          <ul className="space-y-2">
            {rows(fields, "items").map((item, index) => (
              <li key={index} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                <p className="flex items-baseline gap-2">
                  <span className="num text-[11px] font-semibold text-primary">{String(item.year ?? "")}</span>
                  <span className="min-w-0 text-xs font-medium text-foreground">{String(item.title ?? "")}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{String(item.description ?? "")}</p>
              </li>
            ))}
          </ul>
        );

      case "contact_details":
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Phone className="h-3 w-3 shrink-0 text-primary" /> {str(fields, "phone", "—")}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Phone className="h-3 w-3 shrink-0 text-muted-foreground" /> {str(fields, "secondaryPhone", "—")}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Mail className="h-3 w-3 shrink-0 text-primary" /> {str(fields, "email", "—")}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Mail className="h-3 w-3 shrink-0 text-muted-foreground" /> {str(fields, "admissionsEmail", "—")}
            </p>
            <p className="flex items-start gap-1.5 text-xs text-foreground sm:col-span-2">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {str(fields, "address", "—")}
            </p>
          </div>
        );

      case "office_hours":
        return (
          <div className="space-y-1.5">
            {[
              ["Monday – Friday", str(fields, "weekdays")],
              ["Saturday", str(fields, "saturday")],
              ["Sunday", str(fields, "sunday")],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="num text-xs font-medium text-foreground">{value || "—"}</span>
              </div>
            ))}
            {str(fields, "note") && <Body>{str(fields, "note")}</Body>}
          </div>
        );

      case "social_links": {
        const links = [
          { key: "facebook", icon: Facebook },
          { key: "instagram", icon: Instagram },
          { key: "x", icon: Megaphone },
          { key: "youtube", icon: Youtube },
          { key: "linkedin", icon: Linkedin },
        ].filter((link) => str(fields, link.key));
        return (
          <div className="flex flex-wrap gap-2">
            {links.length === 0 && <Body>No social profiles added yet.</Body>}
            {links.map((link) => (
              <span
                key={link.key}
                className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-2 py-1 text-[11px] text-foreground"
              >
                <link.icon className="h-3 w-3 text-muted-foreground" />
                {link.key}
              </span>
            ))}
          </div>
        );
      }

      case "map":
        return (
          <div className="space-y-2">
            <div className="grid h-24 place-items-center rounded-lg border border-dashed border-hairline bg-surface-2">
              <p className="num flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {str(fields, "latitude", "—")}, {str(fields, "longitude", "—")}
              </p>
            </div>
            <p className="text-xs font-medium text-foreground">{str(fields, "label")}</p>
            <Body>{str(fields, "directions")}</Body>
          </div>
        );

      case "announcements":
        return (
          <ul className="space-y-2">
            {rows(fields, "items").map((item, index) => (
              <li key={index} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-medium text-foreground">{String(item.title ?? "")}</p>
                  <p className="num shrink-0 text-[11px] text-muted-foreground">{String(item.date ?? "")}</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{String(item.body ?? "")}</p>
              </li>
            ))}
          </ul>
        );

      case "academics":
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Academics")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
            <div className="grid gap-2 sm:grid-cols-3">
              {rows(fields, "programs").map((item, index) => (
                <div key={index} className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2">
                  <p className="text-xs font-medium text-foreground">{String(item.title ?? "")}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {String(item.description ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "admissions_info":
        return (
          <div className="space-y-2.5">
            <SectionTitle>{str(fields, "title", "Admissions")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
            {str(fields, "deadline") && (
              <p className="num inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-[11px] font-medium text-accent">
                Deadline {formatDate(str(fields, "deadline"))}
              </p>
            )}
            <ol className="space-y-1.5">
              {rows(fields, "steps").map((item, index) => (
                <li key={index} className="flex gap-2 text-xs">
                  <span className="num grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">{String(item.title ?? "")}</span>
                    <span className="text-muted-foreground"> — {String(item.description ?? "")}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );

      case "faculty":
        return (
          <div className="space-y-2">
            <SectionTitle>{str(fields, "title", "Our faculty")}</SectionTitle>
            <Body>{str(fields, "body")}</Body>
          </div>
        );

      case "auth_visual":
        return (
          <div className="space-y-3">
            {str(fields, "image") && (
              <img
                src={str(fields, "image")}
                alt=""
                className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
              />
            )}
            {str(fields, "eyebrow") && <p className="eyebrow-label">{str(fields, "eyebrow")}</p>}
            <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground">
              {str(fields, "headline", "Headline")}
            </h2>
            <Body>{str(fields, "subheadline")}</Body>
          </div>
        );

      case "auth_intro":
        return (
          <div className="space-y-2">
            {str(fields, "kicker") && <p className="eyebrow-label">{str(fields, "kicker")}</p>}
            <SectionTitle>{str(fields, "title", "Welcome back.")}</SectionTitle>
            <Body>{str(fields, "intro")}</Body>
          </div>
        );

      case "auth_form":
        return (
          <div className="space-y-1.5">
            {[
              ["Email field label", "emailLabel"],
              ["Password field label", "passwordLabel"],
              ["Forgot password label", "forgotLabel"],
              ["Submit button label", "submitLabel"],
              ["Back link label", "backLabel"],
            ].map(([label, key]) => (
              <div key={key} className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="min-w-0 truncate text-xs font-medium text-foreground">{String(str(fields, key) || "—")}</span>
              </div>
            ))}
            <Body>{str(fields, "disclosure")}</Body>
          </div>
        );

      case "auth_contact":
        return (
          <div className="space-y-1.5">
            <p className="text-xs text-foreground">{str(fields, "title", "Don't have access?")}</p>
            <p className="num text-[11px] text-muted-foreground">{str(fields, "linkLabel")} {str(fields, "linkHref")}</p>
          </div>
        );

      default:
        return <Body>This section has no preview yet.</Body>;
    }
  })();

  return (
    <section
      data-testid={`cms-preview-block-${block.id}`}
      data-block-type={block.type}
      onClick={onSelect}
      className={cn(
        "relative border-b border-hairline transition-colors duration-150 last:border-b-0",
        background,
        spacing,
        align,
        onSelect && "cursor-pointer hover:bg-surface-2",
        active && "ring-2 ring-inset ring-primary/40",
        !block.visible && "opacity-45",
      )}
    >
      {!block.visible && (
        <span className="absolute right-2 top-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Hidden
        </span>
      )}
      {inner}
    </section>
  );
}
