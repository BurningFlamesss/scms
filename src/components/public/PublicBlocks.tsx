import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	CalendarDays,
	Mail,
	MapPin,
	Megaphone,
	Phone,
} from "lucide-react";
import { rows, str, tags } from "#/components/cms/block-fields";
import { formatDate } from "#/lib/format";
import { cn } from "#/lib/utils";
import type { BlockType, ContentBlock } from "#/types";

/**
 * Public renderer for CMS content blocks.
 *
 * Reads the same `fields` payload the admin editor writes and lays each block out
 * with the editorial RYBW scaffolding (`.content`, `.eyebrow`, `.lead`,
 * `.home-intro`, `.ledger`, `.actions`). Used by public routes to reflect edits
 * made in the admin Website Content tab.
 */

const primaryBtn =
	"inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white no-underline transition-colors hover:bg-neutral-700";
const secondaryBtn =
	"inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-[#FEF2F2] px-7 py-3.5 text-sm font-medium text-neutral-900 no-underline transition-colors hover:border-neutral-400";

function BlockLink({
	href,
	label,
	primary = false,
}: {
	href: string;
	label: string;
	primary?: boolean;
}) {
	const internal = href.startsWith("/");
	const className = primary ? primaryBtn : secondaryBtn;
	const content = (
		<>
			{label}
			<ArrowRight aria-hidden="true" className="h-4 w-4" />
		</>
	);
	return internal ? (
		<Link to={href as never} className={className}>
			{content}
		</Link>
	) : (
		<a href={href} target="_blank" rel="noreferrer" className={className}>
			{content}
		</a>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="mt-0 mb-4 text-xl font-semibold tracking-[-0.01em] text-neutral-900">
			{children}
		</h2>
	);
}

function Muted({ children }: { children: React.ReactNode }) {
	return (
		<p className="mt-2 text-sm leading-relaxed text-neutral-500">{children}</p>
	);
}

function rowKey(item: Record<string, unknown>, index: number): string {
	return `${index}-${String(item.year ?? item.title ?? item.label ?? item.value ?? "")}`;
}

function RichText({ html }: { html: string }) {
	const rich = { dangerouslySetInnerHTML: { __html: html } };
	return (
		<div
			className="max-w-[70ch] text-base leading-relaxed text-neutral-700 [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:list-disc [&_li]:ml-5 [&_p]:my-3 [&_ul]:my-3"
			{...rich}
		/>
	);
}

function renderBlock(block: ContentBlock) {
	const fields = block.fields;
	const type = block.type as BlockType;

	switch (type) {
		case "hero":
			return (
				<section key={block.id} className="content page-header">
					{str(fields, "eyebrow") && (
						<p className="eyebrow">{str(fields, "eyebrow")}</p>
					)}
					<h1>{str(fields, "headline", "Welcome")}</h1>
					{str(fields, "subheadline") && (
						<p className="lead">{str(fields, "subheadline")}</p>
					)}
					{(str(fields, "primaryCtaLabel") ||
						str(fields, "secondaryCtaLabel")) && (
						<div className="actions mt-8">
							{str(fields, "primaryCtaLabel") &&
								str(fields, "primaryCtaHref") && (
									<BlockLink
										href={str(fields, "primaryCtaHref")}
										label={str(fields, "primaryCtaLabel")}
										primary
									/>
								)}
							{str(fields, "secondaryCtaLabel") &&
								str(fields, "secondaryCtaHref") && (
									<BlockLink
										href={str(fields, "secondaryCtaHref")}
										label={str(fields, "secondaryCtaLabel")}
									/>
								)}
						</div>
					)}
					{str(fields, "image") && (
						<img
							src={str(fields, "image")}
							alt=""
							className="mt-12 aspect-[21/9] w-full rounded-xl border border-neutral-200 object-cover"
							loading="eager"
						/>
					)}
				</section>
			);

		case "headline":
			return (
				<section
					key={block.id}
					className="border-y border-neutral-200 bg-[#FEF2F2]"
				>
					<div className="content py-8">
						{str(fields, "eyebrow") && (
							<p className="eyebrow">{str(fields, "eyebrow")}</p>
						)}
						{str(fields, "title") && (
							<SectionTitle>{str(fields, "title")}</SectionTitle>
						)}
						{str(fields, "body") && <Muted>{str(fields, "body")}</Muted>}
					</div>
				</section>
			);

		case "intro":
			return (
				<section key={block.id} className="content">
					<div className="home-intro">
						<h2>{str(fields, "title", "Introduction")}</h2>
						<p className="lead">{str(fields, "body")}</p>
					</div>
					{str(fields, "image") && (
						<img
							src={str(fields, "image")}
							alt=""
							className="aspect-[21/10] w-full rounded-xl border border-neutral-200 object-cover"
							loading="lazy"
						/>
					)}
				</section>
			);

		case "stats": {
			const items = rows(fields, "items");
			if (items.length === 0) return null;
			return (
				<section key={block.id} className="content pb-[clamp(48px,8vw,96px)]">
					<div className="ledger">
						{items.map((item, i) => (
							<div key={rowKey(item, i)}>
								<span>{String(item.value ?? "—")}</span>
								<small>{String(item.label ?? "")}</small>
							</div>
						))}
					</div>
				</section>
			);
		}

		case "cta":
			return (
				<section
					key={block.id}
					className="border-y border-neutral-200 bg-[#FEF2F2]"
				>
					<div className="content py-[clamp(48px,7vw,90px)] text-center">
						{str(fields, "title") && (
							<SectionTitle>{str(fields, "title")}</SectionTitle>
						)}
						{str(fields, "body") && (
							<p className="lead mx-auto">{str(fields, "body")}</p>
						)}
						{str(fields, "buttonLabel") && str(fields, "buttonHref") && (
							<div className="actions mt-8 justify-center">
								<BlockLink
									href={str(fields, "buttonHref")}
									label={str(fields, "buttonLabel")}
									primary
								/>
							</div>
						)}
					</div>
				</section>
			);

		case "rich_text":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{str(fields, "title") && (
						<SectionTitle>{str(fields, "title")}</SectionTitle>
					)}
					<RichText html={str(fields, "html", "<p></p>")} />
				</section>
			);

		case "history":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<div className="grid gap-8 xl:grid-cols-[5fr_4fr]">
						<div>
							{str(fields, "title") && (
								<SectionTitle>{str(fields, "title")}</SectionTitle>
							)}
							{str(fields, "body") && <Muted>{str(fields, "body")}</Muted>}
							{str(fields, "image") && (
								<img
									src={str(fields, "image")}
									alt=""
									className="mt-6 aspect-[16/9] w-full rounded-xl border border-neutral-200 object-cover"
									loading="lazy"
								/>
							)}
						</div>
						{rows(fields, "milestones").length > 0 && (
							<ol className="border-t-2 border-neutral-900">
								{rows(fields, "milestones").map((item, i) => (
									<li
										key={rowKey(item, i)}
										className="grid grid-cols-[80px_1fr] gap-4 border-b border-neutral-200 py-4"
									>
										<span className="font-mono text-xs uppercase tracking-[0.12em] text-neutral-900">
											{String(item.year ?? "")}
										</span>
										<span className="text-sm text-neutral-600">
											{String(item.title ?? "")}
										</span>
									</li>
								))}
							</ol>
						)}
					</div>
				</section>
			);

		case "mission_vision":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<div className="grid gap-10 md:grid-cols-2">
						<div>
							<p className="eyebrow">Mission</p>
							{str(fields, "mission") && (
								<p className="mt-4 text-xl leading-relaxed text-neutral-900">
									{str(fields, "mission")}
								</p>
							)}
						</div>
						<div>
							<p className="eyebrow">Vision</p>
							{str(fields, "vision") && (
								<p className="mt-4 text-xl leading-relaxed text-neutral-900">
									{str(fields, "vision")}
								</p>
							)}
						</div>
					</div>
					{tags(fields, "values").length > 0 && (
						<div className="mt-12 flex flex-wrap gap-2.5">
							{tags(fields, "values").map((value) => (
								<span
									key={value}
									className="rounded-full border border-neutral-300 bg-[#FEF2F2] px-4 py-1.5 text-sm text-neutral-700"
								>
									{value}
								</span>
							))}
						</div>
					)}
				</section>
			);

		case "principal_message":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<figure className="max-w-[70ch]">
						<blockquote className="border-l-2 border-neutral-900 pl-6 text-2xl leading-snug text-neutral-900">
							“{str(fields, "message")}”
						</blockquote>
						<figcaption className="mt-6 flex items-center gap-4">
							{str(fields, "photo") && (
								<img
									src={str(fields, "photo")}
									alt=""
									className="h-14 w-14 rounded-full border border-neutral-200 object-cover"
								/>
							)}
							<span>
								<span className="block text-sm font-semibold text-neutral-900">
									{str(fields, "name")}
								</span>
								{str(fields, "role") && (
									<span className="block text-sm text-neutral-500">
										{str(fields, "role")}
									</span>
								)}
							</span>
						</figcaption>
					</figure>
				</section>
			);

		case "facilities":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{rows(fields, "items").length > 0 && (
						<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
							{rows(fields, "items").map((item, i) => (
								<div
									key={rowKey(item, i)}
									className="overflow-hidden rounded-xl border border-neutral-200 bg-[#FEF2F2]"
								>
									{typeof item.image === "string" && item.image && (
										<img
											src={item.image}
											alt=""
											className="aspect-[16/9] w-full object-cover"
											loading="lazy"
										/>
									)}
									<div className="p-5">
										<p className="font-medium text-neutral-900">
											{String(item.title ?? "")}
										</p>
										{typeof item.description === "string" &&
											item.description && (
												<p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
													{item.description}
												</p>
											)}
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			);

		case "achievements":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<ol className="divide-y divide-neutral-200">
						{rows(fields, "items").map((item, i) => (
							<li
								key={rowKey(item, i)}
								className="grid gap-2 py-5 xl:grid-cols-[120px_180px_1fr]"
							>
								<span className="font-mono text-xs uppercase tracking-[0.12em] text-neutral-900">
									{String(item.year ?? "")}
								</span>
								<span className="font-medium text-neutral-900">
									{String(item.title ?? "")}
								</span>
								<span className="text-sm leading-relaxed text-neutral-500">
									{String(item.description ?? "")}
								</span>
							</li>
						))}
					</ol>
				</section>
			);

		case "contact_details":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<div className="grid gap-6 sm:grid-cols-3">
						<div>
							<p className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
								<Phone
									aria-hidden="true"
									className="h-4 w-4 text-neutral-400"
								/>{" "}
								Phone
							</p>
							<p className="text-sm text-neutral-600">
								{str(fields, "phone", "—")}
							</p>
							{str(fields, "secondaryPhone") && (
								<p className="text-sm text-neutral-600">
									{str(fields, "secondaryPhone")}
								</p>
							)}
						</div>
						<div>
							<p className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
								<Mail aria-hidden="true" className="h-4 w-4 text-neutral-400" />{" "}
								Email
							</p>
							<p className="text-sm text-neutral-600">
								{str(fields, "email", "—")}
							</p>
							{str(fields, "admissionsEmail") && (
								<p className="text-sm text-neutral-600">
									{str(fields, "admissionsEmail")}
								</p>
							)}
						</div>
						<div>
							<p className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
								<MapPin
									aria-hidden="true"
									className="h-4 w-4 text-neutral-400"
								/>{" "}
								Address
							</p>
							<p className="text-sm leading-relaxed text-neutral-600">
								{str(fields, "address", "—")}
							</p>
						</div>
					</div>
				</section>
			);

		case "office_hours":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<div className="max-w-xl">
						{[
							["Monday – Friday", str(fields, "weekdays")],
							["Saturday", str(fields, "saturday")],
							["Sunday", str(fields, "sunday")],
						].map(([label, value]) => (
							<div
								key={label}
								className="flex items-baseline justify-between gap-4 border-b border-neutral-200 py-4 last:border-0"
							>
								<span className="text-sm text-neutral-500">{label}</span>
								<span className="text-sm font-medium text-neutral-900">
									{value || "—"}
								</span>
							</div>
						))}
						{str(fields, "note") && <Muted>{str(fields, "note")}</Muted>}
					</div>
				</section>
			);

		case "social_links": {
			const links = [
				{ key: "facebook", label: "Facebook" },
				{ key: "instagram", label: "Instagram" },
				{ key: "x", label: "X" },
				{ key: "youtube", label: "YouTube" },
				{ key: "linkedin", label: "LinkedIn" },
			].filter((link) => str(fields, link.key));
			if (links.length === 0) return null;
			return (
				<section key={block.id} className="content py-[clamp(40px,6vw,72px)]">
					<div className="flex flex-wrap gap-2.5">
						{links.map((link) => (
							<a
								key={link.key}
								href={str(fields, link.key)}
								target="_blank"
								rel="noreferrer"
								className="rounded-full border border-neutral-300 bg-[#FEF2F2] px-4 py-1.5 text-sm text-neutral-700 no-underline transition-colors hover:border-neutral-400"
							>
								{link.label}
							</a>
						))}
					</div>
				</section>
			);
		}

		case "map":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<div className="grid h-56 place-items-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 sm:grid-rows-1">
						<p className="text-sm text-neutral-500">
							{str(fields, "latitude", "—")}, {str(fields, "longitude", "—")}
						</p>
					</div>
					{str(fields, "label") && (
						<p className="mt-4 font-medium text-neutral-900">
							{str(fields, "label")}
						</p>
					)}
					{str(fields, "directions") && (
						<Muted>{str(fields, "directions")}</Muted>
					)}
				</section>
			);

		case "announcements":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<ul className="space-y-4">
						{rows(fields, "items").map((item, i) => (
							<li
								key={rowKey(item, i)}
								className="border-b border-neutral-200 pb-4 last:border-0"
							>
								<div className="flex items-baseline justify-between gap-4">
									<p className="font-medium text-neutral-900">
										{String(item.title ?? "")}
									</p>
									{str(item, "date") && (
										<span className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-500">
											{str(item, "date")}
										</span>
									)}
								</div>
								{str(item, "body") && (
									<p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
										{str(item, "body")}
									</p>
								)}
							</li>
						))}
					</ul>
				</section>
			);

		case "academics":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{str(fields, "title") && (
						<SectionTitle>{str(fields, "title")}</SectionTitle>
					)}
					{str(fields, "body") && <Muted>{str(fields, "body")}</Muted>}
					{rows(fields, "programs").length > 0 && (
						<div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
							{rows(fields, "programs").map((item, i) => (
								<div
									key={rowKey(item, i)}
									className="rounded-xl border border-neutral-200 bg-[#FEF2F2] p-5"
								>
									<p className="font-medium text-neutral-900">
										{String(item.title ?? "")}
									</p>
									{typeof item.description === "string" && item.description && (
										<p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
											{item.description}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</section>
			);

		case "admissions_info":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{str(fields, "title") && (
						<SectionTitle>{str(fields, "title")}</SectionTitle>
					)}
					{str(fields, "body") && <Muted>{str(fields, "body")}</Muted>}
					{str(fields, "deadline") && (
						<p className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white">
							<CalendarDays aria-hidden="true" className="h-4 w-4" /> Deadline{" "}
							{formatDate(str(fields, "deadline"))}
						</p>
					)}
					{rows(fields, "steps").length > 0 && (
						<ol className="mt-8 space-y-4">
							{rows(fields, "steps").map((item, i) => (
								<li key={rowKey(item, i)} className="flex gap-4">
									<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-300 text-sm font-medium text-neutral-900">
										{i + 1}
									</span>
									<span>
										<span className="font-medium text-neutral-900">
											{String(item.title ?? "")}
										</span>
										{str(item, "description") && (
											<span className="text-sm text-neutral-500">
												{" "}
												— {str(item, "description")}
											</span>
										)}
									</span>
								</li>
							))}
						</ol>
					)}
				</section>
			);

		case "faculty":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{str(fields, "title") && (
						<SectionTitle>{str(fields, "title")}</SectionTitle>
					)}
					{str(fields, "body") && <Muted>{str(fields, "body")}</Muted>}
				</section>
			);

		case "featured_notices":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<p className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-900">
						<Megaphone
							aria-hidden="true"
							className="h-4 w-4 text-neutral-400"
						/>
						{str(fields, "title", "Latest notices")}
					</p>
					<Muted>Live content pulled from published notices.</Muted>
				</section>
			);

		case "featured_events":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					<p className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-900">
						<CalendarDays
							aria-hidden="true"
							className="h-4 w-4 text-neutral-400"
						/>
						{str(fields, "title", "Upcoming events")}
					</p>
					<Muted>Live content pulled from the events calendar.</Muted>
				</section>
			);

		case "gallery_grid":
			return (
				<section key={block.id} className="content py-[clamp(48px,8vw,96px)]">
					{str(fields, "title") && (
						<SectionTitle>{str(fields, "title")}</SectionTitle>
					)}
					<Muted>Live content pulled from the gallery albums.</Muted>
				</section>
			);

		default:
			return null;
	}
}

interface PublicBlocksProps {
	blocks: ContentBlock[];
	className?: string;
}

export function PublicBlocks({ blocks, className }: PublicBlocksProps) {
	if (!blocks || blocks.length === 0) return null;
	return (
		<div className={cn("divide-y-0", className)}>{blocks.map(renderBlock)}</div>
	);
}
