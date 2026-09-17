import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import {
	ACADEMIC_YEAR_BS,
	calendarEvents,
	calendarIntro,
	eventKindMeta,
	terms,
} from "#/content/calendar";
import type { EventKind } from "#/content/types";
import {
	countdownLabel,
	downloadIcs,
	eventsInTerm,
	eventsOnBs,
	nextOfKind,
	today,
} from "#/lib/calendar";
import {
	addDaysAd,
	adToBs,
	BS_MONTHS_EN,
	BS_MONTHS_NE,
	bsToAd,
	buildBsMonthGrid,
	formatAd,
	formatBs,
	toNepaliDigits,
	WEEKDAYS_NE,
	WEEKDAYS_SHORT,
} from "#/lib/nepaliDate";
import { cn } from "#/lib/utils";
import { Button } from "#/templates/modern/components/Button";
import {
	Section as ChromeSection,
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { Segmented } from "#/templates/modern/components/Segmented";
import { WidgetCaption } from "#/templates/modern/components/Text";
import { duration, easing } from "#/templates/modern/components/tokens";
import { RoutineViewer } from "#/templates/modern/components/utilities/RoutineViewer";

const KINDS: EventKind[] = [
	"exam",
	"holiday",
	"festival",
	"event",
	"admission",
];

function Glyph({ kind }: { kind: EventKind }) {
	const g = eventKindMeta[kind].glyph;
	return (
		<svg
			width="9"
			height="9"
			viewBox="0 0 10 10"
			aria-hidden="true"
			className="shrink-0"
		>
			{g === "square" ? (
				<rect x="1" y="1" width="8" height="8" fill="currentColor" />
			) : null}
			{g === "circle" ? (
				<circle cx="5" cy="5" r="4" fill="currentColor" />
			) : null}
			{g === "diamond" ? (
				<path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
			) : null}
			{g === "triangle" ? (
				<path d="M5 0 L10 9 L0 9 Z" fill="currentColor" />
			) : null}
			{g === "bar" ? (
				<rect x="0" y="3.5" width="10" height="3" fill="currentColor" />
			) : null}
		</svg>
	);
}

const KIND_TEXT: Record<EventKind, string> = {
	exam: "text-brand",
	holiday: "text-accent",
	festival: "text-ink",
	event: "text-n-600",
	admission: "text-brand-deep",
};

export const Route = createFileRoute("/_public/calendar")({
	component: RouteComponent,
});

function RouteComponent() {
	const reduced = Boolean(useReducedMotion());
	const [primary, setPrimary] = useState<"bs" | "ad">("bs");
	const [month, setMonth] = useState(1);
	const [year, setYear] = useState(ACADEMIC_YEAR_BS);
	const [selected, setSelected] = useState<string | null>(null);
	const [focusBs, setFocusBs] = useState<string>(ACADEMIC_YEAR_BS + "-01-01");
	const [hidden, setHidden] = useState<EventKind[]>([]);

	const cells = useMemo(() => buildBsMonthGrid(year, month), [year, month]);
	const visibleKinds = KINDS.filter((k) => !hidden.includes(k));

	const nextHoliday = nextOfKind(["holiday", "festival"]);
	const nextExam = nextOfKind(["exam"]);

	const selectedEvents = selected
		? eventsOnBs(selected).filter((e) => visibleKinds.includes(e.kind))
		: [];

	const monthStartAd =
		bsToAd(year + "-" + String(month).padStart(2, "0") + "-01") ?? "";

	const step = (deltaMonths: number) => {
		let m = month + deltaMonths;
		let y = year;
		if (m > 12) {
			m = 1;
			y += 1;
		}
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		setMonth(m);
		setYear(y);
		setFocusBs(y + "-" + String(m).padStart(2, "0") + "-01");
	};

	const moveFocus = (days: number, fromBs: string) => {
		const ad = bsToAd(fromBs);
		if (!ad) return;
		const nextBs = adToBs(addDaysAd(ad, days));
		if (!nextBs) return;
		const [y, m] = nextBs.split("-").map(Number);
		setFocusBs(nextBs);
		if (y !== year || m !== month) {
			setYear(y);
			setMonth(m);
		}
		window.setTimeout(() => {
			document
				.querySelector<HTMLElement>('[data-cell="' + nextBs + '"]')
				?.focus();
		}, 0);
	};

	const focusCell = (bs: string) => {
		setFocusBs(bs);
		window.setTimeout(() => {
			document.querySelector<HTMLElement>('[data-cell="' + bs + '"]')?.focus();
		}, 0);
	};

	const onCellKey = (e: React.KeyboardEvent, bs: string) => {
		const keys: Record<string, number> = {
			ArrowRight: 1,
			ArrowLeft: -1,
			ArrowDown: 7,
			ArrowUp: -7,
		};
		if (keys[e.key] !== undefined) {
			e.preventDefault();
			moveFocus(keys[e.key], bs);
		} else if (e.key === "PageDown") {
			e.preventDefault();
			step(1);
		} else if (e.key === "PageUp") {
			e.preventDefault();
			step(-1);
		} else if (e.key === "Home") {
			e.preventDefault();
			const first = cells.find((c) => c.inMonth);
			if (first) focusCell(first.bs);
		} else if (e.key === "End") {
			e.preventDefault();
			const last = [...cells].reverse().find((c) => c.inMonth);
			if (last) focusCell(last.bs);
		}
	};

	const todayAd = today();

	return (
		<PageFrame>
			<PageHeader
				eyebrow={calendarIntro.eyebrow}
				title={calendarIntro.statement.join(" ")}
				lead={calendarIntro.support}
			/>
			<ChromeSection testId="calendar-intro" className="!mt-10">
				<div
					className="grid gap-px border-hair border-n-200 bg-n-200 sm:grid-cols-2"
					data-testid="calendar-counters"
				>
					{[
						{ label: "Next holiday", ev: nextHoliday },
						{ label: "Next examination", ev: nextExam },
					].map((c) => (
						<div key={c.label} className="flex flex-col gap-2 bg-[#FEF2F2] p-6">
							<p className="u-label text-n-600">{c.label}</p>
							{c.ev ? (
								<>
									<p className="u-display text-display-m text-ink">
										{c.ev.title}
									</p>
									<p className="u-label tnum text-accent">
										{countdownLabel(c.ev.date.ad)} &middot;{" "}
										{formatBs(c.ev.date.bs)} BS &middot;{" "}
										{formatAd(c.ev.date.ad)}
									</p>
								</>
							) : (
								<p className="text-body-m text-n-600">
									Nothing further is scheduled this session.
								</p>
							)}
						</div>
					))}
				</div>
			</ChromeSection>

			<ChromeSection testId="calendar-grid-section" className="!mt-10">
				<div className="flex flex-col gap-6">
					<WidgetCaption>
						Both calendars are always shown; the toggle only chooses which one
						leads.
					</WidgetCaption>

					<div className="flex flex-wrap items-end justify-between gap-6 border-y-hair border-n-200 py-6">
						<Segmented
							label="Primary calendar"
							value={primary}
							onChange={setPrimary}
							testId="calendar-system"
							options={[
								{ value: "bs", label: "Bikram Sambat" },
								{ value: "ad", label: "Gregorian" },
							]}
						/>

						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() => step(-1)}
								data-testid="calendar-prev"
								aria-label="Previous month"
								className="inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-n-300 text-ink hover:border-ink"
							>
								<ChevronLeft aria-hidden="true" size={18} />
							</button>
							<div className="min-w-[220px] text-center">
								<p
									className="u-display text-display-m text-ink"
									data-testid="calendar-month-label"
								>
									{primary === "bs"
										? BS_MONTHS_EN[month - 1] + " " + year
										: formatAd(monthStartAd).replace(/^\d+\s/, "")}
								</p>
								<p className="u-label text-n-600">
									{primary === "bs"
										? BS_MONTHS_NE[month - 1] +
											" " +
											toNepaliDigits(year) +
											" \u00b7 " +
											formatAd(monthStartAd)
										: BS_MONTHS_EN[month - 1] + " " + year + " BS"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => step(1)}
								data-testid="calendar-next"
								aria-label="Next month"
								className="inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-n-300 text-ink hover:border-ink"
							>
								<ChevronRight aria-hidden="true" size={18} />
							</button>
						</div>
					</div>

					<div
						className="flex flex-wrap items-center gap-2"
						data-testid="calendar-year-strip"
					>
						<span className="t-eyebrow mr-2 text-muted-foreground">Jump to month</span>
						{BS_MONTHS_EN.map((m, i) => (
							<button
								key={m}
								type="button"
								onClick={() => {
									setMonth(i + 1);
									setFocusBs(
										year + "-" + String(i + 1).padStart(2, "0") + "-01",
									);
								}}
								aria-pressed={month === i + 1}
								data-testid={"calendar-month-" + (i + 1)}
								className={[
									"inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
									month === i + 1
										? "border-accent/40 bg-accent/12 font-medium text-foreground"
										: "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
								].join(" ")}
							>
								{m.slice(0, 3)}
							</button>
						))}
					</div>

					<div
						role="grid"
						aria-label={
							"Academic calendar, " +
							BS_MONTHS_EN[month - 1] +
							" " +
							year +
							" Bikram Sambat"
						}
						className="mt-4 border-l-hair border-t-hair border-n-200"
					>
						<div role="row" className="grid grid-cols-7">
							{WEEKDAYS_SHORT.map((d, i) => (
								<div
									key={d}
									role="columnheader"
									className={cn(
										"u-label border-b-rule border-r-hair border-n-300 px-2 py-3 text-n-600",
										i === 6 && "bg-n-50",
									)}
								>
									{d}
									<span className="u-ne ml-1">{WEEKDAYS_NE[i]}</span>
								</div>
							))}
						</div>

						{Array.from({ length: Math.ceil(cells.length / 7) }, (_, w) => (
							<div role="row" className="grid grid-cols-7" key={w}>
								{cells.slice(w * 7, w * 7 + 7).map((c) => {
									const evs = eventsOnBs(c.bs).filter((e) =>
										visibleKinds.includes(e.kind),
									);
									const isSelected = selected === c.bs;
									const isToday = c.ad === todayAd;
									const bsDay = Number(c.bs.split("-")[2]);
									const adDay = Number(c.ad.split("-")[2]);
									return (
										<button
											key={c.bs}
											role="gridcell"
											data-cell={c.bs}
											tabIndex={focusBs === c.bs ? 0 : -1}
											aria-selected={isSelected}
											data-testid={"cell-" + c.bs}
											onFocus={() => setFocusBs(c.bs)}
											onKeyDown={(e) => onCellKey(e, c.bs)}
											onClick={() => setSelected(isSelected ? null : c.bs)}
											aria-label={
												formatBs(c.bs) +
												" Bikram Sambat, " +
												formatAd(c.ad) +
												", " +
												evs.length +
												(evs.length === 1 ? " event" : " events")
											}
											className={cn(
												"relative flex min-h-[92px] flex-col items-start gap-1 border-b-hair border-r-hair border-n-200 p-2 text-left",
												c.weekday === 6 && "bg-n-50",
												isSelected &&
													"outline outline-rule -outline-offset-2 outline-accent",
											)}
										>
											<span className="flex w-full items-baseline justify-between gap-1">
												{/* Days outside the month recede via a token colour, not
                              container opacity, which would drag every child below AA. */}
												<span
													className={cn(
														"u-display tnum text-display-m",
														c.inMonth ? "text-ink" : "text-n-500",
													)}
												>
													{primary === "bs" ? bsDay : adDay}
												</span>
												<span className="u-label tnum text-n-600">
													{primary === "bs" ? adDay : bsDay}
												</span>
											</span>
											{isToday ? (
												<span className="u-label text-accent">Today</span>
											) : null}
											<span className="flex flex-wrap items-center gap-1">
												{evs.slice(0, 4).map((e) => (
													<span key={e.id} className={KIND_TEXT[e.kind]}>
														<Glyph kind={e.kind} />
													</span>
												))}
											</span>
										</button>
									);
								})}
							</div>
						))}
					</div>

					<AnimatePresence initial={false}>
						{selected ? (
							<motion.div
								initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
								animate={
									reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }
								}
								exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
								transition={{
									duration: (reduced ? 0 : duration.standard) / 1000,
									ease: easing.state,
								}}
								className="overflow-hidden"
								data-testid="calendar-detail"
							>
								<div className="border-b-rule border-accent bg-n-50 p-6">
									<p className="u-label text-accent">
										{formatBs(selected)} BS &middot;{" "}
										{formatBs(selected, { nepali: true })} &middot;{" "}
										{formatAd(bsToAd(selected) ?? "")}
									</p>
									{selectedEvents.length === 0 ? (
										<p className="mt-3 text-body-l text-ink">
											Nothing scheduled on this date. It is a normal teaching
											day.
										</p>
									) : (
										<ul className="mt-4 flex flex-col">
											{selectedEvents.map((e) => (
												<li
													key={e.id}
													className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t-hair border-n-200 py-4"
												>
													<span
														className={cn(
															"u-label inline-flex items-center gap-2",
															KIND_TEXT[e.kind],
														)}
													>
														<Glyph kind={e.kind} />
														{eventKindMeta[e.kind].label}
													</span>
													<span className="min-w-0 flex-1">
														<span className="block text-body-l text-ink">
															{e.title}
														</span>
														{e.titleNe ? (
															<span className="u-ne block text-body-m text-n-600">
																{e.titleNe}
															</span>
														) : null}
														{e.detail ? (
															<span className="block text-body-s text-n-600">
																{e.detail}
															</span>
														) : null}
														{e.endDate ? (
															<span className="u-label block text-n-600">
																until {formatBs(e.endDate.bs)} BS &middot;{" "}
																{formatAd(e.endDate.ad)}
															</span>
														) : null}
													</span>
													<Button
														variant="secondary"
														onClick={() => downloadIcs([e], e.title)}
														testId={"ics-" + e.id}
													>
														<CalendarPlus aria-hidden="true" size={14} />
														Add to calendar
													</Button>
												</li>
											))}
										</ul>
									)}
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>

					<div
						className="mt-6 flex flex-wrap items-center gap-2"
						data-testid="calendar-legend"
					>
						<span className="t-eyebrow mr-2 text-muted-foreground">Show</span>
						{KINDS.map((k) => {
							const on = !hidden.includes(k);
							return (
								<button
									key={k}
									type="button"
									aria-pressed={on}
									onClick={() =>
										setHidden((h) =>
											h.includes(k) ? h.filter((x) => x !== k) : [...h, k],
										)
									}
									data-testid={"legend-" + k}
									className={[
										"inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
										on
											? "border-accent/40 bg-accent/12 font-medium text-foreground"
											: "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground line-through opacity-50",
									].join(" ")}
								>
									<span className={KIND_TEXT[k]}>
										<Glyph kind={k} />
									</span>
									{eventKindMeta[k].label}
								</button>
							);
						})}
					</div>

					<div className="mt-6 flex flex-wrap items-center gap-3">
						<span className="u-label mr-2 text-n-600">Export a whole term</span>
						{terms.map((t) => (
							<Button
								key={t.id}
								variant="secondary"
								onClick={() => downloadIcs(eventsInTerm(t.id), t.name)}
								testId={"ics-term-" + t.id}
							>
								<CalendarPlus aria-hidden="true" size={14} />
								{t.name}
							</Button>
						))}
					</div>
				</div>
			</ChromeSection>

			<ChromeSection testId="calendar-list" className="bg-n-50">
				<h2
					id="allnotices-heading"
					className="u-display mb-8 text-display-l text-ink"
				>
					Every date this session
				</h2>
				<ul className="flex flex-col">
					{calendarEvents
						.filter((e) => visibleKinds.includes(e.kind))
						.map((e) => (
							<li
								key={e.id}
								className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-hair border-n-200 py-3 last:border-b-hair"
							>
								<span
									className={cn(
										"u-label inline-flex w-[152px] items-center gap-2",
										KIND_TEXT[e.kind],
									)}
								>
									<Glyph kind={e.kind} />
									{eventKindMeta[e.kind].label}
								</span>
								<span className="min-w-0 flex-1 text-body-m text-ink">
									{e.title}
								</span>
								<span className="u-label tnum text-n-600">
									{formatBs(e.date.bs)} BS
								</span>
								<span className="u-label tnum w-[168px] text-right text-n-600">
									{formatAd(e.date.ad)}
								</span>
							</li>
						))}
				</ul>
			</ChromeSection>

			<ChromeSection testId="calendar-routine">
				<RoutineViewer />
			</ChromeSection>
		</PageFrame>
	);
}
