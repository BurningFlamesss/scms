import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { facilities } from "#/content/facilities";
import type { Facility } from "#/content/types";
import { useIsDesktop } from "#/lib/hooks";
import { cn } from "#/lib/utils";
import { Picture } from "../Picture";
import { Eyebrow, WidgetCaption } from "../Text";
import { duration, easing, motionScale } from "../tokens";

const VW = 960;
const VH = 600;

const SHORT_NAMES: Record<string, string> = {
	"f-classrooms": "CLASSROOMS",
	"f-science": "SCIENCE LABS",
	"f-computer": "COMPUTER LAB",
	"f-hostel": "RESIDENTIAL HOSTEL",
	"f-library": "LIBRARY",
	"f-canteen": "CANTEEN",
	"f-medical": "MEDICAL ROOM",
	"f-sports": "SPORTS GROUND",
	"f-transport": "TRANSPORT BAY",
};

/** Every plan block is authored as an axis-aligned rectangle path. */
function rectFromPath(d: string) {
	const m = /M\s*([\d.]+)\s+([\d.]+)\s*H\s*([\d.]+)\s*V\s*([\d.]+)/.exec(d);
	if (!m) return { x: 0, y: 0, w: 0, h: 0 };
	const x = Number(m[1]);
	const y = Number(m[2]);
	return { x, y, w: Number(m[3]) - x, h: Number(m[4]) - y };
}

function DetailPanel({
	facility,
	onClose,
}: {
	facility: Facility;
	onClose: () => void;
}) {
	const reduced = Boolean(useReducedMotion());
	const ref = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		closeRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key !== "Tab") return;
			const nodes = ref.current?.querySelectorAll<HTMLElement>(
				'button, [href], [tabindex]:not([tabindex="-1"])',
			);
			if (!nodes || !nodes.length) return;
			const list = Array.from(nodes);
			const first = list[0];
			const last = list[list.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<motion.div
			className="fixed inset-0 z-overlay flex justify-end"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: duration.standard / 1000 }}
		>
			<button
				type="button"
				aria-label="Close the facility detail"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/50"
				tabIndex={-1}
			/>
			<motion.div
				ref={ref}
				role="dialog"
				aria-modal="true"
				aria-label={facility.name}
				data-testid="plan-detail"
				initial={reduced ? { opacity: 0 } : { x: "100%" }}
				animate={reduced ? { opacity: 1 } : { x: 0 }}
				exit={reduced ? { opacity: 0 } : { x: "100%" }}
				transition={{ duration: duration.sheet / 1000, ease: easing.entrance }}
				className="relative flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-background shadow-high"
			>
				<div className="flex items-start justify-between gap-4 border-b border-border p-8">
					<div className="flex flex-col gap-2">
						<Eyebrow>{facility.room}</Eyebrow>
						<h3 className="u-display text-display-m text-foreground">
							{facility.name}
						</h3>
					</div>
					<button
						ref={closeRef}
						type="button"
						onClick={onClose}
						data-testid="plan-detail-close"
						className="inline-flex h-tap w-tap shrink-0 items-center justify-center rounded-ui border border-border text-foreground hover:border-foreground"
					>
						<X aria-hidden="true" size={18} />
						<span className="sr-only">Close</span>
					</button>
				</div>

				<div className="flex flex-col gap-8 p-8">
					<p className="max-w-measure text-body-l text-muted-foreground">
						{facility.note}
					</p>

					<dl className="flex flex-col">
						<div className="flex justify-between gap-4 border-t border-border py-3">
							<dt className="u-label text-muted-foreground">Capacity</dt>
							<dd className="u-label tnum text-foreground">
								{facility.capacity}
							</dd>
						</div>
						<div className="flex justify-between gap-4 border-y border-border py-3">
							<dt className="u-label text-muted-foreground">Hours</dt>
							<dd className="u-label tnum text-foreground">{facility.hours}</dd>
						</div>
					</dl>

					<ul className="flex flex-col">
						{facility.specs.map((s) => (
							<li
								key={s}
								className="border-b border-border py-3 text-body-m text-foreground"
							>
								{s}
							</li>
						))}
					</ul>

					<div className="grid gap-4 sm:grid-cols-2">
						{facility.images.map((im) => (
							<div
								key={im.src}
								className="overflow-hidden rounded-card border border-border"
							>
								<Picture image={im} sizes="(min-width: 640px) 260px, 90vw" />
							</div>
						))}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

/**
 * SIGNATURE INTERACTION - Facilities
 * A stylised top-down campus plan. Blocks only. Every block is a real button
 * with an accessible name, and a synchronised text list sits beside the plan so
 * the diagram is never the only route to the content.
 */
export function CampusPlan() {
	const reduced = Boolean(useReducedMotion());
	const desktop = useIsDesktop();
	const [active, setActive] = useState<string | null>(null);
	const [open, setOpen] = useState<Facility | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);

	const activeFacility = facilities.find((f) => f.id === active) ?? null;

	const close = () => {
		setOpen(null);
		triggerRef.current?.focus();
	};

	const list = (
		<ul className="flex flex-col" data-testid="plan-list">
			{facilities.map((f, i) => (
				<li key={f.id} className="border-t border-border last:border-b">
					<button
						type="button"
						onFocus={() => setActive(f.id)}
						onMouseEnter={() => setActive(f.id)}
						onMouseLeave={() => setActive(null)}
						onClick={(e) => {
							triggerRef.current = e.currentTarget;
							setOpen(f);
						}}
						data-testid={"plan-list-" + f.id}
						className={cn(
							"flex w-full items-start gap-4 py-4 text-left transition-colors duration-micro ease-state",
							active === f.id ? "text-foreground" : "text-muted-foreground",
						)}
					>
						<span className="u-label tnum w-6 shrink-0 text-accent">
							{String(i + 1).padStart(2, "0")}
						</span>
						<span className="flex min-w-0 flex-1 flex-col gap-1">
							<span className="text-body-l text-foreground">{f.name}</span>
							<span className="u-label">{f.room}</span>
						</span>
						<span aria-hidden="true" className="u-label shrink-0 text-accent">
							↗
						</span>
					</button>
				</li>
			))}
		</ul>
	);

	return (
		<div className="flex flex-col gap-8" data-testid="campus-plan">
			<div className="flex flex-col gap-2">
				<Eyebrow>The plan</Eyebrow>
				<WidgetCaption>
					Select a block, or use the list, to open its detail.
				</WidgetCaption>
			</div>

			<div className="grid gap-12 lg:grid-cols-12">
				{/* On small screens and under reduced motion the plan becomes the list. */}
				{desktop && !reduced ? (
					<div className="relative lg:col-span-7">
						<svg
							viewBox={`0 0 ${VW} ${VH}`}
							className="w-full rounded-card border border-border bg-muted"
							aria-hidden="true"
						>
							<rect
								x="0"
								y="0"
								width={VW}
								height={VH}
								fill="var(--c-gray-50)"
							/>
							<text
								x="555"
								y="215"
								textAnchor="middle"
								fill="var(--c-gray-500)"
								fontSize="16"
								letterSpacing="2"
								fontFamily="'IBM Plex Mono', monospace"
							>
								ASSEMBLY GROUND
							</text>
							<line
								x1="0"
								y1="560"
								x2={VW}
								y2="560"
								stroke="var(--c-gray-300)"
								strokeWidth="1"
							/>
							<text
								x="24"
								y="584"
								fill="var(--c-gray-500)"
								fontSize="14"
								letterSpacing="2"
								fontFamily="'IBM Plex Mono', monospace"
							>
								SRIMAN MARGA · MAIN GATE
							</text>
							{facilities.map((f) => {
								const on = active === f.id;
								const r = rectFromPath(f.block.d);
								return (
									<g
										key={f.id}
										style={{
											transform: on
												? `translateY(-${motionScale.planLift}px)`
												: "none",
											transition: `transform ${duration.standard}ms var(--e-state)`,
										}}
									>
										<path
											d={f.block.d}
											fill={on ? "var(--c-yellow)" : "var(--c-white)"}
											stroke={on ? "var(--c-yellow)" : "var(--c-gray-300)"}
											strokeWidth="1"
										/>
										<text
											x={r.x + 14}
											y={r.y + 26}
											fill={on ? "var(--c-black)" : "var(--c-gray-600)"}
											fontSize="14"
											letterSpacing="1.6"
											fontFamily="'IBM Plex Mono', monospace"
										>
											{SHORT_NAMES[f.id] || f.name.toUpperCase()}
										</text>
									</g>
								);
							})}
						</svg>

						{/* Real buttons, positioned over the diagram. */}
						<div className="absolute inset-0">
							{facilities.map((f) => {
								const r = rectFromPath(f.block.d);
								return (
									<button
										key={f.id}
										type="button"
										data-testid={"plan-block-" + f.id}
										aria-label={`${f.name}, ${f.room}. ${f.note}`}
										onFocus={() => setActive(f.id)}
										onBlur={() => setActive(null)}
										onMouseEnter={() => setActive(f.id)}
										onMouseLeave={() => setActive(null)}
										onClick={(e) => {
											triggerRef.current = e.currentTarget;
											setOpen(f);
										}}
										className="absolute rounded-ui"
										style={{
											left: (r.x / VW) * 100 + "%",
											top: (r.y / VH) * 100 + "%",
											width: (r.w / VW) * 100 + "%",
											height: (r.h / VH) * 100 + "%",
										}}
									/>
								);
							})}
						</div>

						{/* The raised photo card. */}
						<AnimatePresence>
							{activeFacility && (
								<motion.div
									key={activeFacility.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: duration.micro / 1000,
										ease: easing.state,
									}}
									className="pointer-events-none absolute w-[240px] overflow-hidden rounded-card border border-border bg-background shadow-low"
									style={{
										left: `clamp(8px, calc(${(activeFacility.block.cx / VW) * 100}% - 120px), calc(100% - 248px))`,
										top: `max(8px, calc(${(activeFacility.block.cy / VH) * 100}% - 200px))`,
									}}
									data-testid="plan-photo-card"
								>
									<div className="aspect-[4/3] w-full">
										<Picture image={activeFacility.images[0]} sizes="240px" />
									</div>
									<div className="flex flex-col gap-1 p-4">
										<p className="u-label text-accent">{activeFacility.room}</p>
										<p className="text-body-m text-foreground">
											{activeFacility.name}
										</p>
										<p className="text-body-s text-muted-foreground">
											{activeFacility.note}
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				) : (
					<div className="lg:col-span-7">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
							{facilities.map((f) => (
								<button
									key={f.id}
									type="button"
									onClick={(e) => {
										triggerRef.current = e.currentTarget;
										setOpen(f);
									}}
									data-testid={"plan-thumb-" + f.id}
									className="flex flex-col gap-2 text-left"
								>
									<span className="aspect-[4/3] w-full overflow-hidden rounded-ui border border-border">
										<Picture image={f.images[0]} sizes="40vw" />
									</span>
									<span className="u-label text-foreground">{f.name}</span>
								</button>
							))}
						</div>
					</div>
				)}

				<div className="lg:col-span-5">{list}</div>
			</div>

			<AnimatePresence>
				{open ? <DetailPanel facility={open} onClose={close} /> : null}
			</AnimatePresence>
		</div>
	);
}
