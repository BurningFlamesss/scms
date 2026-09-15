import { createFileRoute, useSearch } from "@tanstack/react-router";
import { ArrowRight, type Copy, Mail, Phone, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { school } from "#/content/school";
import { copyText } from "#/lib/calendar";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { facultyDirectoryDoc, personProfileDoc } from "#/lib/documents";
import { people as staticPeople } from "#/lib/faculty";
import { STAGGER } from "#/lib/motion";
import { downloadOfficialPdf } from "#/lib/pdf";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useFacultyDirectory, useWebsitePageContent } from "#/packages/school/hook.tsx";
import {
  PageFrame,
  PageHeader,
  Reveal,
  Section,
  SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "#/templates/modern/components/kit";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";
import { FilterChips } from "#/templates/modern/components/shared/FilterChips";
import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";
import { SearchField } from "#/templates/modern/components/shared/SearchField";
import type { BlockType, Person } from "#/types";

const QuickAction = ({
  icon: Icon,
  label,
  onClick,
  testId,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  testId: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className="inline-flex min-h-[40px] items-center gap-2 rounded-field border border-border bg-background px-3 py-2 text-[13px] text-foreground transition-colors duration-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    {label}
  </button>
);

export const Route = createFileRoute("/user/faculty-page-detail")({
  loader: async ({ location }) => {
    if (String(location.search.cms ?? "") === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: { key: "faculty" },
      });
      return { previewPage };
    }
    return { previewPage: null };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search =
    (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("faculty");
  const preview = String(cms ?? "") === "1";
  const facultyContent = preview ? previewPage : publishedContent;

  const headerSection = {
    ...sectionDefaults("faculty_header"),
    ...getSectionFields(facultyContent?.blocks, "faculty_header"),
  };
  const leadershipSection = {
    ...sectionDefaults("faculty_leadership"),
    ...getSectionFields(facultyContent?.blocks, "faculty_leadership"),
  };
  const directorySection = {
    ...sectionDefaults("faculty_directory"),
    ...getSectionFields(facultyContent?.blocks, "faculty_directory"),
  };

  const onSelectSection = (sectionType: BlockType) => {
    window.parent?.postMessage(
      {
        source: "scms-cms",
        type: "select-section",
        pageKey: "faculty",
        sectionType,
      },
      "*",
    );
  };

  // Faculty data is served from the database (seeded from src/lib/faculty);
  // the static list is only the fallback when the collection is empty.
  const dbPeople = useFacultyDirectory();
  const people = dbPeople && dbPeople.length > 0 ? dbPeople : staticPeople;
  const leadership = people
    .filter((person) => person.leadership)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  const faculty = people.filter((person) => !person.leadership);
  const facultyDepartments = Array.from(
    new Set(people.map((person) => person.department)),
  ).sort();

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [selected, setSelected] = useState<Person | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return faculty.filter((person) => {
      const matchesDept =
        department === "all" || person.department === department;
      if (!matchesDept) return false;
      if (!needle) return true;
      return [
        person.name,
        person.role,
        person.department,
        person.qualification,
        person.subjects.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, department, faculty]);

  const chipOptions = useMemo(
    () => [
      { value: "all", label: "All departments", count: faculty.length },
      ...facultyDepartments
        .filter((dept) => faculty.some((p) => p.department === dept))
        .map((dept) => ({
          value: dept,
          label: dept,
          count: faculty.filter((p) => p.department === dept).length,
        })),
    ],
    [faculty, facultyDepartments],
  );

  const handleCopy = async (value: string, description: string) => {
    const ok = await copyText(value);
    if (ok) {
      toast.success("Copied to clipboard", { description });
    } else {
      toast.error("Could not copy", { description: value });
    }
  };

  const resetFilters = () => {
    setQuery("");
    setDepartment("all");
  };

  return (
    <PageFrame testId="faculty-page">
      <CmsSectionBox
        preview={preview}
        sectionType="faculty_header"
        onSelect={onSelectSection}
        testId="cms-section-hit-faculty_header"
      >
        <PageHeader
          testId="faculty-page-header"
          eyebrow={str(headerSection, "eyebrow")}
          title={str(headerSection, "title")}
          subtitle={str(headerSection, "subtitle")}
          meta={[
          { label: "Total staff", value: String(people.length) },
          { label: "Leadership", value: String(leadership.length) },
          { label: "Departments", value: String(facultyDepartments.length) },
          { label: "Main line", value: school.phone },
        ]}
        actions={
          <DownloadButton
            label="Staff contact directory"
            meta={`PDF · ${people.length} entries · extensions and office hours`}
            stamp="Official"
            testId="faculty-download-directory-button"
            onDownload={() => downloadOfficialPdf(facultyDirectoryDoc(people))}
          />
        }
      />
      </CmsSectionBox>

      {/* Leadership — six cards, each opening a full profile in the sidebar */}
      <Section testId="leadership-section">
        <CmsSectionBox
          preview={preview}
          sectionType="faculty_leadership"
          onSelect={onSelectSection}
          testId="cms-section-hit-faculty_leadership"
        >
          <SectionHeading
            eyebrow={str(leadershipSection, "eyebrow")}
            title={str(leadershipSection, "title")}
            description={str(leadershipSection, "description")}
            testId="leadership-title"
          />
        </CmsSectionBox>

        <ul
          data-testid="leadership-grid"
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {leadership.map((person, index) => (
            <li key={person.id} className="min-w-0">
              <Reveal delay={Math.min(index, 6) * STAGGER}>
                <button
                  type="button"
                  onClick={() => setSelected(person)}
                  data-testid="leadership-card"
                  className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MonogramAvatar
                    name={person.name}
                    department={person.department}
                    size="lg"
                  />

                  <p className="t-eyebrow mt-6">{person.role}</p>
                  <h3
                    className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground"
                    data-testid="leadership-card-name"
                  >
                    {person.name}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                    {person.qualification}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4">
                    <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground">
                      {person.department}
                    </span>
                    <span className="t-meta">Ext. {person.extension}</span>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
                    View profile
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Directory */}
      <Section>
        <CmsSectionBox
          preview={preview}
          sectionType="faculty_directory"
          onSelect={onSelectSection}
          testId="cms-section-hit-faculty_directory"
        >
          <SectionHeading
            eyebrow={str(directorySection, "eyebrow")}
            title={str(directorySection, "title")}
            description={str(directorySection, "description")}
            testId="directory-title"
            aside={
              <span className="t-meta" data-testid="faculty-result-count">
                {filtered.length} of {faculty.length}
              </span>
            }
          />
        </CmsSectionBox>

        <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-8">
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search faculty by name, subject or qualification"
            placeholder="Search name, subject, qualification…"
            testId="faculty-search-input"
          />
          <FilterChips
            label="Department"
            testId="faculty-department-filter"
            options={chipOptions}
            value={department}
            onChange={setDepartment}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-9">
            <EmptyState
              eyebrow="No match"
              title="Nobody matches that search"
              description="Try a shorter search term, or clear the filters to see the whole faculty list again."
              actionLabel="Clear filters"
              onAction={resetFilters}
              testId="faculty-empty-state"
            />
          </div>
        ) : (
          <ul
            data-testid="faculty-directory"
            className="mt-9 divide-y divide-rule-soft border-y border-border"
          >
            {filtered.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => setSelected(person)}
                  data-testid="faculty-directory-row"
                  className="group flex w-full items-center gap-4 py-4 text-left transition-colors duration-fast hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                >
                  <MonogramAvatar
                    name={person.name}
                    department={person.department}
                    size="md"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] font-semibold leading-snug text-foreground">
                      {person.name}
                    </span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">
                      {person.role}
                    </span>
                  </span>

                  <span className="hidden min-w-0 flex-1 lg:block">
                    <span className="t-caption line-clamp-1">
                      {person.subjects.join(" · ")}
                    </span>
                  </span>

                  <span className="hidden shrink-0 sm:block">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {person.department}
                    </span>
                  </span>

                  <span className="t-meta w-[74px] shrink-0 text-right">
                    Ext. {person.extension}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Detail sheet */}
      <Sheet
        open={selected !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent
          data-testid="faculty-detail-sheet"
          className="w-full overflow-y-auto border-border bg-card sm:max-w-lg"
        >
          {selected ? (
            <div>
              <div className="border-b border-border pb-6">
                <p className="t-eyebrow">{selected.department} department</p>
                <SheetTitle
                  className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground"
                  data-testid="faculty-detail-name"
                >
                  {selected.name}
                </SheetTitle>
                <SheetDescription className="mt-2 text-[13px] text-muted-foreground">
                  {selected.role}
                </SheetDescription>
                <div className="mt-5 flex items-center gap-4">
                  <MonogramAvatar
                    name={selected.name}
                    department={selected.department}
                    size="lg"
                    testId="faculty-detail-avatar"
                  />
                  <p className="t-meta leading-relaxed">
                    {selected.qualification}
                  </p>
                </div>
              </div>

              <div className="space-y-7 pt-6">
                <div>
                  <p className="t-eyebrow">Profile</p>
                  <p className="t-body mt-3 text-muted-foreground">
                    {selected.bio}
                  </p>
                </div>

                <div>
                  <p className="t-eyebrow">Teaches</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {selected.subjects.map((subject) => (
                      <li
                        key={subject}
                        className="rounded-full border border-border bg-background px-2.5 py-1 text-[12px] text-foreground"
                      >
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>

                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {[
                    { label: "Office hours", value: selected.officeHours },
                    { label: "Experience", value: selected.experience },
                    { label: "At Everest since", value: selected.joined },
                    { label: "Extension", value: selected.extension },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="t-eyebrow">{item.label}</dt>
                      <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className="t-eyebrow">Quick actions</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <QuickAction
                      icon={Mail}
                      label="Copy email"
                      testId="faculty-detail-copy-email"
                      onClick={() =>
                        handleCopy(selected.email, selected.email)
                      }
                    />
                    <QuickAction
                      icon={Phone}
                      label="Copy extension"
                      testId="faculty-detail-copy-extension"
                      onClick={() =>
                        handleCopy(
                          `${school.phone} ext ${selected.extension}`,
                          `${school.phone} ext ${selected.extension}`,
                        )
                      }
                    />
                  </div>
                  <p className="t-meta mt-3">{selected.email}</p>
                </div>

                <div className="border-t border-rule-soft pt-6">
                  <DownloadButton
                    label="Staff profile PDF"
                    meta={`PDF · ${selected.name} · ${selected.department}`}
                    stamp="Staff profile"
                    size="sm"
                    testId="faculty-detail-download-profile"
                    onDownload={() =>
                      downloadOfficialPdf(personProfileDoc(selected))
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  data-testid="faculty-detail-close"
                  className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-fast hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Close profile
                </button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageFrame>
  );
}
