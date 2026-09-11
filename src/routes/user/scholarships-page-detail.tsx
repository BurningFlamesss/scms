import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PageFrame,
  PageHeader,
  Reveal,
  SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import {
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#/templates/modern/components/kit";
import { toast } from "sonner";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { FilterChips } from "#/templates/modern/components/shared/FilterChips";
import {
  scholarshipCategories,
  scholarships,
  totalScholarshipSeats,
} from "#/lib/scholarships";
import { school } from "#/content/school";
import { downloadIcs } from "#/lib/calendar";
import { countdownTo, daysUntil, formatAd, formatNpr } from "#/lib/dates";
import {
  scholarshipChecklistDoc,
  scholarshipFormDoc,
  scholarshipIndexDoc,
} from "#/lib/documents";
import { STAGGER } from "#/lib/motion";
import { downloadOfficialPdf } from "#/lib/pdf";
import type { Scholarship } from "#/types";

const Countdown = ({ deadline }: { deadline: string }) => {
  const [state, setState] = useState(() => countdownTo(deadline));

  useEffect(() => {
    setState(countdownTo(deadline));
    const id = window.setInterval(
      () => setState(countdownTo(deadline)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [deadline]);

  if (state.closed) {
    return (
      <div
        data-testid="scholarship-countdown"
        className="rounded-card border border-border bg-secondary/60 px-5 py-4"
      >
        <p className="t-eyebrow">Applications closed</p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          This window has passed for the current session. The scheme reopens
          with the next academic session.
        </p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: state.days },
    { label: "Hours", value: state.hours },
    { label: "Minutes", value: state.minutes },
    { label: "Seconds", value: state.seconds },
  ];

  return (
    <div
      data-testid="scholarship-countdown"
      className="rounded-card border border-accent/35 bg-accent/[0.07] px-5 py-4"
    >
      <p className="t-eyebrow flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        Time remaining to apply
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
        {units.map((unit) => (
          <div key={unit.label}>
            <dd className="font-mono text-2xl font-semibold tabular-nums leading-none text-foreground">
              {String(unit.value).padStart(2, "0")}
            </dd>
            <dt className="t-eyebrow mt-1.5">{unit.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
};

const EligibilitySelfCheck = ({ item }: { item: Scholarship }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked({});
  }, [item.id]);

  const met = item.eligibility.filter((c) => checked[c.id]).length;
  const total = item.eligibility.length;
  const complete = met === total;

  return (
    <div data-testid="scholarship-eligibility-check">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="t-eyebrow">Check yourself against the criteria</p>
          <p className="t-caption mt-1.5 max-w-measure">
            Tick each condition you meet. Nothing is submitted or stored — this
            is here so you know before you queue at the admissions desk.
          </p>
        </div>
        <span
          className="t-meta shrink-0"
          data-testid="scholarship-eligibility-progress"
        >
          {met} of {total} confirmed
        </span>
      </div>

      <Progress
        value={total === 0 ? 0 : (met / total) * 100}
        className="mt-4 h-1.5 bg-secondary [&>div]:bg-accent"
      />

      <ul className="mt-6 divide-y divide-rule-soft border-y border-border">
        {item.eligibility.map((criterion) => {
          const isChecked = Boolean(checked[criterion.id]);
          return (
            <li key={criterion.id}>
              <button
                type="button"
                onClick={() =>
                  setChecked((prev) => ({
                    ...prev,
                    [criterion.id]: !prev[criterion.id],
                  }))
                }
                aria-pressed={isChecked}
                data-testid="scholarship-eligibility-item"
                className="flex w-full items-start gap-3.5 py-4 text-left transition-colors duration-fast hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
              >
                {isChecked ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={[
                      "block text-[13.5px] leading-snug",
                      isChecked
                        ? "font-medium text-foreground"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {criterion.label}
                  </span>
                  <span className="t-caption mt-1.5 block leading-relaxed">
                    {criterion.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        data-testid="scholarship-eligibility-verdict"
        className={[
          "mt-6 flex items-start gap-3 rounded-card border px-5 py-4",
          complete
            ? "border-accent/40 bg-accent/[0.08]"
            : "border-border bg-secondary/50",
        ].join(" ")}
      >
        <BadgeCheck
          className={[
            "mt-0.5 h-4 w-4 shrink-0",
            complete ? "text-accent" : "text-muted-foreground",
          ].join(" ")}
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">
          {complete
            ? "On these criteria you appear eligible. Download the checklist below, gather the documents, and submit before the deadline — the committee verifies every declaration."
            : `${total - met} condition${total - met === 1 ? "" : "s"} still to confirm. A condition you cannot meet does not always end the application — speak to the contact listed below before assuming.`}
        </p>
      </div>
    </div>
  );
};

const ScholarshipDetail = ({ item }: { item: Scholarship }) => {
  const handleCalendar = () => {
    const name = downloadIcs(
      {
        uid: `scholarship-${item.id}`,
        title: `Deadline: ${item.name}`,
        description: `${item.summary}\n\nRef: ${item.ref}\nCoverage: ${item.coverage}%\nContact: ${item.contact}`,
        date: item.deadlineAd,
        remindDaysBefore: 7,
      },
      `Everest-Scholarship-${item.id}`,
    );
    toast.success("Deadline saved to calendar file", { description: name });
  };

  return (
    <div className="min-w-0">
      <div className="border-l-2 border-accent/35 pl-6">
        <p className="t-eyebrow">
          {item.category} · {item.ref}
        </p>
        <h2
          className="t-h2 mt-2.5 text-foreground"
          data-testid="scholarship-detail-title"
        >
          {item.name}
        </h2>
        <p className="mt-2.5 font-display text-lg leading-snug text-muted-foreground">
          {item.nepaliName}
        </p>
        <p className="t-body mt-5 max-w-measure text-muted-foreground">
          {item.description}
        </p>
      </div>

      {/* Award summary */}
      <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
        {[
          { label: "Tuition covered", value: `${item.coverage}%` },
          { label: "Indicative value", value: formatNpr(item.amountNpr) },
          { label: "Places", value: String(item.seats) },
          { label: "Closes", value: item.deadlineBs },
        ].map((stat) => (
          <div key={stat.label} className="bg-card px-4 py-5">
            <dt className="t-eyebrow">{stat.label}</dt>
            <dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <Progress
          value={item.coverage}
          className="h-1.5 bg-secondary [&>div]:bg-accent"
          aria-label={`Tuition coverage ${item.coverage} percent`}
        />
        <p className="t-meta mt-2.5">
          {item.award} · Applies to {item.appliesTo}
        </p>
      </div>

      {/* Deadline emphasis */}
      <div className="mt-9 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="t-eyebrow">Deadline</p>
          <p
            className="mt-2 font-mono text-sm tabular-nums text-foreground"
            data-testid="scholarship-deadline"
          >
            {item.deadlineBs} BS · {formatAd(item.deadlineAd)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCalendar}
          data-testid="scholarship-add-calendar-button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-field border border-border bg-background px-4 text-sm text-foreground transition-colors duration-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <CalendarPlus
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Add deadline to calendar
        </button>
      </div>

      <div className="mt-5">
        <Countdown deadline={item.deadlineAd} />
      </div>

      {/* Progressive disclosure */}
      <div className="mt-11">
        <Tabs defaultValue="eligibility" className="w-full">
          <TabsList
            data-testid="scholarship-tabs"
            className="h-auto flex-wrap justify-start gap-1 rounded-full bg-secondary p-1"
          >
            {[
              { value: "eligibility", label: "Eligibility" },
              { value: "benefits", label: "Benefits" },
              { value: "documents", label: "Documents" },
              { value: "process", label: "How to apply" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-testid={`scholarship-tab-${tab.value}`}
                className="rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-fast data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="eligibility"
            className="mt-7 focus-visible:outline-none"
          >
            <EligibilitySelfCheck item={item} />
          </TabsContent>

          <TabsContent
            value="benefits"
            className="mt-7 focus-visible:outline-none"
          >
            <ul className="divide-y divide-rule-soft border-y border-border">
              {item.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3.5 py-3.5">
                  <BadgeCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-[13.5px] leading-relaxed text-foreground">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <p className="t-eyebrow">Renewal</p>
              <p className="t-body mt-2.5 max-w-measure text-muted-foreground">
                {item.renewal}
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="documents"
            className="mt-7 focus-visible:outline-none"
          >
            <ol
              className="divide-y divide-rule-soft border-y border-border"
              data-testid="scholarship-documents-list"
            >
              {item.documents.map((doc, index) => (
                <li key={doc} className="flex items-start gap-4 py-3.5">
                  <span className="t-meta mt-0.5 w-5 shrink-0 text-right">
                    {index + 1}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-foreground">
                    {doc}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-7">
              <DownloadButton
                label="Printable document checklist"
                meta={`PDF · ${item.documents.length} documents · tick as you gather them`}
                stamp="Checklist"
                size="sm"
                testId="scholarship-download-checklist-button"
                onDownload={() =>
                  downloadOfficialPdf(scholarshipChecklistDoc(item))
                }
              />
            </div>
          </TabsContent>

          <TabsContent
            value="process"
            className="mt-7 focus-visible:outline-none"
          >
            <ol className="space-y-5">
              {item.process.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[11px] tabular-nums text-foreground">
                    {index + 1}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <p className="t-eyebrow">Who to ask</p>
              <p className="t-body mt-2.5 max-w-measure text-muted-foreground">
                {item.contact}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Persistent application CTA */}
      <div className="mt-11 rounded-card border border-border bg-card p-6 shadow-sm sm:p-7">
        <p className="t-eyebrow">Apply</p>
        <h3 className="t-h3 mt-2 text-foreground">
          Download the form, fill it by hand, submit it at the desk
        </h3>
        <p className="t-body mt-3 max-w-measure text-muted-foreground">
          The form below is generated with the school masthead, this scheme's
          reference number and its full document checklist. Bring it to the
          admissions desk with the enclosures and collect a dated receipt.
        </p>
        <div className="mt-7 flex flex-wrap gap-4">
          <DownloadButton
            label="Application form"
            meta={`PDF · ${item.ref} · four sections and a declaration`}
            stamp="Application form"
            variant="default"
            testId="scholarship-download-form-button"
            onDownload={() => downloadOfficialPdf(scholarshipFormDoc(item))}
          />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/user/scholarships-page-detail")({
	component: RouteComponent,
});

function RouteComponent() {
  const [category, setCategory] = useState<string>("all");
  const [activeId, setActiveId] = useState<string>(scholarships[0].id);

  const filtered = useMemo(() => {
    if (category === "all") return scholarships;
    return scholarships.filter((s) => s.category === category);
  }, [category]);

  const active = useMemo(
    () => filtered.find((s) => s.id === activeId) ?? filtered[0],
    [filtered, activeId],
  );

  const chipOptions = useMemo(
    () => [
      { value: "all", label: "All schemes", count: scholarships.length },
      ...scholarshipCategories.map((c) => ({
        value: c,
        label: c,
        count: scholarships.filter((s) => s.category === c).length,
      })),
    ],
    [],
  );

  const nextDeadline = useMemo(() => {
    const upcoming = [...scholarships]
      .filter((s) => daysUntil(s.deadlineAd) >= 0)
      .sort((a, b) => daysUntil(a.deadlineAd) - daysUntil(b.deadlineAd));
    return upcoming[0];
  }, []);

  const handleCategory = (next: string) => {
    setCategory(next);
    const first =
      next === "all"
        ? scholarships[0]
        : scholarships.find((s) => s.category === next);
    if (first) setActiveId(first.id);
  };

  return (
    <PageFrame testId="scholarships-page">
      <PageHeader
        testId="scholarships-page-header"
        eyebrow="Scholarships"
        title="Chhatrabritti & Free Studentship"
        subtitle="Every criterion, document and deadline published in full. Check yourself against a scheme, then download the form the desk asks for."
        meta={[
          { label: "Schemes", value: String(scholarships.length) },
          { label: "Places", value: String(totalScholarshipSeats) },
          { label: "Max relief", value: "100%" },
          {
            label: "Next close",
            value: nextDeadline
              ? `${formatAd(nextDeadline.deadlineAd)} · ${daysUntil(nextDeadline.deadlineAd)}d`
              : "Closed",
          },
        ]}
        actions={
          <DownloadButton
            label="All schemes and deadlines"
            meta={`PDF · ${scholarships.length} schemes · ${school.session}`}
            stamp="Official"
            testId="scholarships-download-index-button"
            onDownload={() =>
              downloadOfficialPdf(scholarshipIndexDoc(scholarships))
            }
          />
        }
      />

      <div className="mt-14">
        <FilterChips
          label="Scholarship category"
          testId="scholarship-category-filter"
          options={chipOptions}
          value={category}
          onChange={handleCategory}
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[0.78fr_1.45fr] lg:gap-16">
        {/* Scheme list with deadline emphasis */}
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Schemes"
              title="Open this session"
              testId="scholarship-list-title"
              aside={
                <span className="t-meta" data-testid="scholarship-result-count">
                  {filtered.length}
                </span>
              }
            />

            <ul
              data-testid="scholarship-list"
              className="rail-scroll mt-6 divide-y divide-rule-soft border-y border-border lg:max-h-[70vh] lg:overflow-y-auto"
            >
              {filtered.map((item, index) => {
                const isActive = active && item.id === active.id;
                const days = daysUntil(item.deadlineAd);
                return (
                  <li key={item.id}>
                    <Reveal delay={Math.min(index, 8) * STAGGER}>
                      <button
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        aria-current={isActive ? "true" : undefined}
                        data-active={isActive}
                        data-testid="scholarship-row"
                        className={[
                          "flex w-full items-start gap-4 py-4 pl-3 pr-2 text-left transition-colors duration-fast",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
                          isActive
                            ? "bg-accent/[0.08]"
                            : "hover:bg-secondary/60",
                        ].join(" ")}
                      >
                        <span className="w-11 shrink-0 text-right">
                          <span className="block font-mono text-base font-semibold tabular-nums leading-none text-foreground">
                            {item.coverage}
                          </span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                            percent
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={[
                              "block text-[13.5px] leading-snug",
                              isActive
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground",
                            ].join(" ")}
                          >
                            {item.name}
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10.5px] text-muted-foreground">
                              {item.category}
                            </span>
                            <span className="t-meta inline-flex items-center gap-1">
                              <Users className="h-3 w-3" aria-hidden="true" />
                              {item.seats}
                            </span>
                          </span>
                          <span
                            className={[
                              "mt-2 block font-mono text-[10.5px] tabular-nums",
                              days < 0
                                ? "text-muted-foreground"
                                : days <= 21
                                  ? "text-accent"
                                  : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {days < 0
                              ? "Closed for this session"
                              : `${days} days left · ${item.deadlineBs} BS`}
                          </span>
                        </span>
                      </button>
                    </Reveal>
                  </li>
                );
              })}
            </ul>

            <p className="t-meta mt-5 leading-relaxed">
              Selection is made by the committee chaired by the Principal and is
              final. Results are posted on the notice board and sent in writing.
            </p>
          </div>
        </aside>

        {/* Progressive disclosure panel */}
        {active ? (
          <Reveal key={active.id} className="min-w-0">
            <ScholarshipDetail item={active} />
          </Reveal>
        ) : null}
      </div>

      <Separator className="mt-20" />
      <p className="t-meta mt-6 max-w-measure leading-relaxed">
        {school.name}, {school.fullAddress}. {school.affiliation}. Registration
        number {school.regNo}.
      </p>
    </PageFrame>
  );
}
