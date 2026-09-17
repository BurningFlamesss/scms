import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, GraduationCap, Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageFrame, PageHeader, Reveal, Section, SectionHeading } from "#/templates/modern/components/chrome/PageFrame";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { EditorialImage } from "#/templates/modern/components/shared/EditorialImage";
import { RoutineTable } from "#/templates/modern/components/shared/RoutineTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#/templates/modern/components/kit";
import { levels, programs } from "#/lib/programs";
import { routineByKey } from "#/lib/routines";
import { school } from "#/content/school";
import { formatNpr } from "#/lib/fees";
import { academicProspectusDoc, programProspectusDoc } from "#/lib/documents";
import { downloadOfficialPdf } from "#/lib/pdf";
import { STAGGER } from "#/lib/motion";
import type { LevelId, Program } from "#/types";

const ProgramDetail = ({ program }: { program: Program }) => {
  const level = levels.find((l) => l.id === program.level) ?? levels[0];
  const totalCredits = program.subjects.reduce((sum, s) => sum + s.credit, 0);
  const annual = program.fees
    .filter((f) => f.frequency === "Annual")
    .reduce((sum, f) => sum + f.amount, 0);
  const monthly = program.fees
    .filter((f) => f.frequency === "Monthly")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList
        data-testid={`program-tabs-${program.id}`}
        className="h-auto flex-wrap justify-start gap-1 rounded-full bg-secondary p-1"
      >
        {[
          { value: "overview", label: "Overview" },
          { value: "subjects", label: "Subjects" },
          { value: "fees", label: "Fees" },
          { value: "pathways", label: "Pathways" },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-testid={`program-tab-${program.id}-${tab.value}`}
            className="rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-fast data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            <p className="t-body max-w-measure text-muted-foreground">
              {program.description}
            </p>
            <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                { label: "Eligibility", value: program.eligibility },
                { label: "Medium", value: program.medium },
                { label: "Duration", value: program.duration },
                { label: "Board", value: level.board },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="t-eyebrow">{item.label}</dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 rounded-card border border-border bg-secondary/50 p-5">
            <p className="t-eyebrow">What makes it distinctive</p>
            <ul className="mt-4 space-y-3">
              {program.highlights.map((item) => (
                <li key={item} className="flex gap-3">
                  <Minus
                    className="mt-[7px] h-3 w-3 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-[13px] leading-relaxed text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-rule-soft pt-6">
          <DownloadButton
            label="Programme prospectus"
            meta={`PDF · ${program.code} · Session 2083 BS`}
            stamp="Official"
            size="sm"
            testId={`program-download-prospectus-${program.id}`}
            onDownload={() =>
              downloadOfficialPdf(programProspectusDoc(program, level))
            }
          />
        </div>
      </TabsContent>

      <TabsContent value="subjects" className="mt-6 focus-visible:outline-none">
        <div className="overflow-hidden rounded-card border border-border">
          <div className="rail-scroll overflow-x-auto">
            <table
              className="w-full min-w-[520px] border-collapse text-left"
              data-testid={`program-subjects-table-${program.id}`}
            >
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Code
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Credit
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {program.subjects.map((subject, index) => (
                  <tr
                    key={subject.code}
                    className={`border-b border-rule-soft last:border-b-0 ${
                      index % 2 === 1 ? "bg-secondary/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {subject.code}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-foreground">
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                      {subject.credit}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        {subject.kind}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-secondary">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                    Total credit hours
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
                    {totalCredits}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="fees" className="mt-6 focus-visible:outline-none">
        <div className="overflow-hidden rounded-card border border-border">
          <div className="rail-scroll overflow-x-auto">
            <table
              className="w-full min-w-[560px] border-collapse text-left"
              data-testid={`program-fees-table-${program.id}`}
            >
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Particular
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {program.fees.map((fee, index) => (
                  <tr
                    key={fee.label}
                    className={`border-b border-rule-soft last:border-b-0 ${
                      index % 2 === 1 ? "bg-secondary/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-[13px] text-foreground">
                      {fee.label}
                      {fee.note ? (
                        <span className="mt-1 block t-meta">{fee.note}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                      {formatNpr(fee.amount)}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">
                      {fee.frequency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="t-eyebrow">Annual charges</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {formatNpr(annual)}
            </dd>
          </div>
          <div>
            <dt className="t-eyebrow">Monthly tuition</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {formatNpr(monthly)}
            </dd>
          </div>
        </dl>
        <p className="t-meta mt-4 max-w-measure leading-relaxed">
          Figures are indicative for session 2083 BS. Any approved scholarship is
          applied at the accounts desk before the term invoice is issued.
        </p>
      </TabsContent>

      <TabsContent value="pathways" className="mt-6 focus-visible:outline-none">
        {program.careers.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {program.careers.map((career) => (
              <li
                key={career}
                className="flex items-start gap-3 rounded-field border border-border bg-card px-4 py-3.5"
              >
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="text-[13px] leading-relaxed text-foreground">
                  {career}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-body max-w-measure text-muted-foreground">
            This programme feeds directly into the next level within the school
            rather than into external pathways. Progression is automatic on
            completion, and no separate application is required.
          </p>
        )}

        <div className="mt-8 border-t border-rule-soft pt-6">
          <p className="t-eyebrow">Learning outcomes</p>
          <ul className="mt-4 space-y-3">
            {program.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3">
                <span
                  className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span className="text-[13px] leading-relaxed text-foreground">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const Route = createFileRoute("/_public/courses")({
	component: RouteComponent,
});

function RouteComponent() {
  const [levelId, setLevelId] = useState<LevelId>("plus2-science");

  const level = useMemo(
    () => levels.find((l) => l.id === levelId) ?? levels[0],
    [levelId],
  );

  const levelPrograms = useMemo(
    () => programs.filter((p) => p.level === level.id),
    [level.id],
  );

  const spotlight = useMemo(
    () => levelPrograms.find((p) => p.spotlight) ?? levelPrograms[0],
    [levelPrograms],
  );

  const routine = routineByKey(spotlight.routineKey);
  const totalSeats = levelPrograms.reduce((sum, p) => sum + p.seats, 0);

  return (
    <PageFrame testId="courses-page">
      <PageHeader
        testId="courses-page-header"
        eyebrow="Academics"
        title="Courses & Academic Programmes"
        subtitle="Subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12."
        meta={[
          { label: "Programmes", value: String(programs.length) },
          { label: "Levels", value: "5" },
          { label: "+2 streams", value: "Science, Management" },
          { label: "Session", value: "2083 BS" },
        ]}
        actions={
          <DownloadButton
            label="Full academic prospectus"
            meta={`PDF · ${programs.length} programmes · ${school.session}`}
            stamp="Official"
            testId="courses-download-prospectus-button"
            onDownload={() =>
              downloadOfficialPdf(academicProspectusDoc(levels, programs))
            }
          />
        }
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-[236px_1fr] lg:gap-16">
        {/* Level rail — vertical index on desktop, snap rail on mobile */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="t-eyebrow">Choose a level</p>
          <div
            role="group"
            aria-label="Academic level"
            data-testid="program-level-switcher"
            className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
          >
            {levels.map((item) => {
              const active = item.id === level.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevelId(item.id)}
                  aria-pressed={active}
                  data-active={active}
                  data-testid={`program-level-switcher-item-${item.id}`}
                  className={[
                    "shrink-0 rounded-field border px-3.5 py-2.5 text-left transition-colors duration-fast",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4",
                    active
                      ? "border-accent/40 bg-accent/10 lg:border-accent lg:bg-transparent"
                      : "border-border bg-background hover:bg-secondary lg:border-rule lg:bg-transparent lg:hover:border-rule-strong",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block whitespace-nowrap text-[13px] lg:whitespace-normal",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                  <span className="mt-1 hidden font-mono text-[10px] tabular-nums text-muted-foreground lg:block">
                    {item.grades}
                  </span>
                </button>
              );
            })}
          </div>

          <Separator className="my-7 hidden lg:block" />

          <dl className="hidden gap-y-5 lg:grid">
            {[
              { label: "Grades", value: level.grades },
              { label: "Board", value: level.board },
              { label: "Programmes", value: String(levelPrograms.length) },
              { label: "Seats this session", value: String(totalSeats) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="t-eyebrow">{item.label}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* Main editorial column */}
        <div className="min-w-0">
          <Reveal key={`intro-${level.id}`}>
            <section className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:gap-12">
              <div className="min-w-0">
                <p className="t-eyebrow">{level.grades}</p>
                <h2 className="t-h2 mt-2.5 text-foreground" data-testid="level-title">
                  {level.label}
                </h2>
                <p className="mt-4 font-display text-lg italic leading-snug text-accent">
                  {level.tagline}
                </p>
                <p className="t-body mt-5 max-w-measure text-muted-foreground">
                  {level.description}
                </p>
                <p className="t-meta mt-6 flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  {level.board}
                </p>
              </div>
              <EditorialImage
                src={level.image}
                alt={`${level.label} at ${school.name}`}
                ratio="feature"
                caption={`${level.short} · ${school.address}`}
                testId="level-image"
              />
            </section>
          </Reveal>

          {/* Flagship programme — editorial featured block */}
          <Reveal key={`spotlight-${spotlight.id}`} delay={STAGGER}>
            <article
              data-testid="featured-block"
              className="mt-section overflow-hidden rounded-card border border-border bg-card shadow-sm lg:mt-section-lg"
            >
              <div className="grid lg:grid-cols-[1fr_0.8fr]">
                <div className="border-l-2 border-accent/35 p-6 sm:p-8">
                  <p className="t-eyebrow">Most-chosen programme at this level</p>
                  <h3
                    className="t-h2 mt-2.5 text-foreground"
                    data-testid="featured-block-title"
                  >
                    {spotlight.title}
                  </h3>
                  <p className="t-meta mt-2.5">
                    {spotlight.code}
                    {spotlight.stream ? ` · ${spotlight.stream}` : ""}
                  </p>
                  <p className="t-body mt-5 max-w-measure text-muted-foreground">
                    {spotlight.summary}
                  </p>
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                    {[
                      { label: "Duration", value: spotlight.duration },
                      { label: "Seats", value: String(spotlight.seats) },
                      { label: "Medium", value: spotlight.medium },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="t-eyebrow">{item.label}</dt>
                        <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8">
                    <DownloadButton
                      label="Prospectus for this programme"
                      meta={`PDF · ${spotlight.code} · signed by the Principal`}
                      stamp="Official"
                      testId="featured-block-download-button"
                      onDownload={() =>
                        downloadOfficialPdf(
                          programProspectusDoc(spotlight, level),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <EditorialImage
                    src={spotlight.image}
                    alt={spotlight.title}
                    ratio="square"
                    testId="featured-block-image"
                  />
                  <ul className="mt-6 space-y-3">
                    {spotlight.highlights.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
                          aria-hidden="true"
                        />
                        <span className="text-[13px] leading-relaxed text-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Programme index — stacked editorial rows, not a card grid */}
          <Section>
            <SectionHeading
              eyebrow="Programme index"
              title={`${levelPrograms.length} programmes at ${level.short}`}
              description="Each row opens into the full subject list, credit hours, fee table and progression routes for that programme."
              testId="program-index-title"
            />
            <Accordion
              type="single"
              collapsible
              className="mt-8 border-y border-border"
              data-testid="program-index"
            >
              {levelPrograms.map((program) => (
                <AccordionItem
                  key={program.id}
                  value={program.id}
                  data-testid="program-row"
                  className="border-b border-rule-soft last:border-b-0"
                >
                  <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline [&[data-state=open]>svg]:text-accent">
                    <div className="grid min-w-0 flex-1 gap-1 text-left sm:grid-cols-[108px_1fr] sm:items-baseline sm:gap-x-5">
                      <span className="t-meta">{program.code}</span>
                      <span className="min-w-0">
                        <span className="block font-display text-[17px] font-semibold leading-snug text-foreground">
                          {program.title}
                        </span>
                        {program.stream ? (
                          <span className="mt-1 block t-caption">
                            {program.stream}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="hidden shrink-0 items-center gap-7 pr-3 lg:flex">
                      <span className="t-meta">{program.duration}</span>
                      <span className="t-meta">{program.seats} seats</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-10 pt-1">
                    <ProgramDetail program={program} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>

          {/* Weekly routine */}
          {routine ? (
            <Section>
              <SectionHeading
                eyebrow="Timetable"
                title={`Weekly routine · ${routine.label}`}
                description="The published timetable for this level, as it runs from Sunday to Friday."
                testId="routine-section-title"
              />
              <div className="mt-8">
                <RoutineTable routine={routine} />
              </div>
            </Section>
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}
