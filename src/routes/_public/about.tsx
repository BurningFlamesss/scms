import { createFileRoute } from "@tanstack/react-router";
import { Expand, MapPin, Quote, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PageFrame,
  PageHeader,
  Reveal,
  SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#/templates/modern/components/kit";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { EditorialImage } from "#/templates/modern/components/shared/EditorialImage";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";
import { FilterChips } from "#/templates/modern/components/shared/FilterChips";
import { school } from "#/content/school";
import { photo } from "#/lib/media";
import { downloadOfficialPdf } from "#/lib/pdf";
import type { Doc } from "#/lib/types";

const brochureDoc: Doc = {
  id: "about-brochure",
  title: "Everest Institutional Profile",
  type: "application/pdf",
  url: "/downloads/everest-profile-2026.pdf",
  size: 2.1 * 1024 * 1024,
  category: "official",
  date: new Date("2026-01-12"),
  description: "Comprehensive overview of our institutional mission, leadership, and community impact.",
};

const chapters = [
  {
    id: "overview",
    name: "Our Story",
    category: "Foundation",
    description: "Welcome to Everest English Boarding Secondary School, a premier institution dedicated to nurturing young minds. For over three decades, we have provided an environment that balances rigorous academic standards with holistic personal development.",
    image: photo("schoolBuilding"),
    stats: [
      { label: "Established", value: school.establishedAd },
      { label: "Students", value: "1,200+" },
      { label: "Pass Rate", value: "98%" }
    ],
    inCharge: "School Board",
    since: "1995",
    block: "Overall Campus",
    studentsLove: "A home away from home where every student is known, valued, and inspired to succeed.",
    gallery: [
      photo("assemblyCrowd"),
      photo("youngLearners"),
      photo("studyPair"),
    ]
  },
  {
    id: "vision-mission",
    name: "Vision & Mission",
    category: "Foundation",
    description: "Our vision is to be a center of excellence that shapes global citizens. Our mission is to foster academic excellence while developing strong character and integrity in every student, making disciplined learning feel personal and connected.",
    image: photo("assemblyCrowd"),
    stats: [
      { label: "Core Focus", value: "Academics" },
      { label: "Approach", value: "Holistic" },
      { label: "Values", value: "Integrity" }
    ],
    inCharge: "Academic Council",
    since: "1995",
    block: "Institutional Policy",
    studentsLove: "Education is not just about filling minds, but igniting curiosity that lasts a lifetime.",
    gallery: [
      photo("classroomTeens"),
      photo("studentsWithBooks"),
      photo("lectureRoom"),
    ]
  },
  {
    id: "principal-message",
    name: "Principal's Message",
    category: "Leadership",
    description: "Education is a shared commitment between dedicated teachers, motivated students, and enthusiastic parents. We strive to create a dynamic environment where every child is empowered to discover their potential and achieve their dreams.",
    image: photo("teacherPortrait"),
    stats: [
      { label: "Leadership", value: "Dr. Thapa" },
      { label: "Experience", value: "25+ Years" },
      { label: "Focus", value: "Excellence" }
    ],
    inCharge: "Principal's Office",
    since: "2010",
    block: "Administration",
    studentsLove: "The principal's door is always open—leadership here is about listening and guiding.",
    gallery: [
      photo("teacherPortrait"),
      photo("readingSupport"),
      photo("auditoriumAudience"),
    ]
  },
  {
    id: "history",
    name: "Legacy & Heritage",
    category: "History",
    description: "What started as a small cohort of dedicated educators has blossomed into a vibrant, multi-building campus. Everest EBSS has consistently ranked among the top educational institutions in the Gandaki Province, shaping regional standards.",
    image: photo("schoolBuilding"),
    stats: [
      { label: "Alumni Network", value: "4,500+" },
      { label: "Academic Rank", value: "Top 10" },
      { label: "Campus Expanse", value: "2 Blocks" }
    ],
    inCharge: "Founding Members",
    since: "1995",
    block: "Legacy & Timeline",
    studentsLove: "The history of our school is reflected in every brick and every lesson.",
    gallery: [
      photo("libraryHall"),
      photo("schoolBuilding"),
      photo("himalaya"),
    ]
  },
  {
    id: "values",
    name: "Core Values",
    category: "Student Life",
    description: "We are guided by respect, responsibility, curiosity, and resilience. Everest encourages active participation in extracurricular activities, social service programs, and leadership councils to ensure students grow both inside and outside the classroom.",
    image: photo("studentGroup"),
    stats: [
      { label: "Student Clubs", value: 12 },
      { label: "School Houses", value: 4 },
      { label: "Yearly Events", value: "20+" }
    ],
    inCharge: "Student Council",
    since: "2000",
    block: "Student Governance",
    studentsLove: "The strength of Everest lies in the diversity of its community and the shared commitment to excellence.",
    gallery: [
      photo("coachBus"),
      photo("basketball"),
      photo("studentsTeamwork"),
    ]
  },
  {
    id: "affiliations",
    name: "Accreditations",
    category: "Academics",
    description: "Fully accredited by the National Examinations Board (NEB) and the Ministry of Education, Nepal. We maintain rigorous standards across all our primary, secondary, and +2 programs ensuring our students are prepared for higher education globally.",
    image: photo("booksStacked"),
    stats: [
      { label: "Board", value: "NEB Nepal" },
      { label: "Curriculum", value: "National" },
      { label: "Programs", value: "PG to +2" }
    ],
    inCharge: "Examination Board",
    since: "1995",
    block: "Academic Quality",
    studentsLove: "Knowing our education is recognized everywhere gives us the confidence to aim high.",
    gallery: [
      photo("libraryShelf"),
      photo("equations"),
      photo("labCoat"),
    ]
  }
];

const CATEGORY_ORDER = [
  "Foundation",
  "Leadership",
  "History",
  "Student Life",
  "Academics"
];

export const Route = createFileRoute("/_public/about")({
	component: RouteComponent,
});

function RouteComponent() {
  const [category, setCategory] = useState<string>("all");
  const [activeId, setActiveId] = useState<string>(chapters[0].id);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    if (category === "all") return chapters;
    return chapters.filter((f) => f.category === category);
  }, [category]);

  const active = useMemo(
    () => filtered.find((f) => f.id === activeId) ?? filtered[0],
    [filtered, activeId],
  );

  const chipOptions = useMemo(
    () => [
      { value: "all", label: "All chapters", count: chapters.length },
      ...CATEGORY_ORDER.filter((c) =>
        chapters.some((f) => f.category === c),
      ).map((c) => ({
        value: c,
        label: c,
        count: chapters.filter((f) => f.category === c).length,
      })),
    ],
    [],
  );

  const handleCategory = (next: string) => {
    setCategory(next);
    const first =
      next === "all"
        ? chapters[0]
        : chapters.find((f) => f.category === next);
    if (first) setActiveId(first.id);
  };

  return (
    <PageFrame testId="about-page">
      <PageHeader
        testId="about-page-header"
        eyebrow="ABOUT EVEREST"
        title="A place where curiosity becomes capability."
        subtitle="An institutional story told through the people, spaces, and principles that shape each school day."
        meta={[]}
        actions={
          <DownloadButton
            label="Download Institution Profile"
            meta={`PDF · ${school.establishedBs} BS · ${school.establishedAd} AD`}
            stamp="Official"
            testId="about-download-brochure-button"
            onDownload={() => downloadOfficialPdf(brochureDoc)}
          />
        }
      />

      <div className="mt-14">
        <FilterChips
          label="Chapter category"
          testId="chapter-category-filter"
          options={chipOptions}
          value={category}
          onChange={handleCategory}
        />
      </div>

      {!active ? (
        <div className="mt-10">
          <EmptyState
            title="No chapters matches that category"
            description="Try a different category, or view all chapters."
            actionLabel="Show all chapters"
            onAction={() => handleCategory("all")}
            testId="about-empty-state"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.55fr_0.85fr] lg:gap-14">
          {/* Featured space */}
          <Reveal key={active.id} className="min-w-0">
            <article data-testid="chapter-featured">
              <EditorialImage
                src={active.image}
                alt={active.name}
                ratio="feature"
                caption={`${active.name} · ${active.block}`}
                testId="chapter-featured-image"
                onClick={() =>
                  setLightbox({ src: active.image, alt: active.name })
                }
              />

              <div className="mt-8 border-l-2 border-accent/35 pl-6">
                <p className="t-eyebrow">{active.category}</p>
                <h2
                  className="t-h2 mt-2.5 text-foreground"
                  data-testid="chapter-featured-title"
                >
                  {active.name}
                </h2>
                <p className="t-body mt-4 max-w-measure text-muted-foreground">
                  {active.description}
                </p>
              </div>

              {/* Specs strip */}
              <dl
                data-testid="chapter-specs-strip"
                className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3"
              >
                {active.stats.map((stat) => (
                  <div key={stat.label} className="bg-card px-4 py-5">
                    <dt className="t-eyebrow">{stat.label}</dt>
                    <dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Operating detail */}
              <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {[
                  { icon: MapPin, label: "Focus Area", value: active.block },
                  {
                    icon: UserRound,
                    label: "Key Stakeholders",
                    value: active.inCharge,
                  },
                  {
                    icon: Expand,
                    label: "Initiated Since",
                    value: active.since,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <item.icon
                      className="mt-[3px] h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt className="t-eyebrow">{item.label}</dt>
                      <dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              {/* What students say */}
              <blockquote
                data-testid="chapter-students-love"
                className="mt-9 rounded-card bg-secondary/60 px-6 py-6"
              >
                <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 max-w-measure font-display text-lg italic leading-snug text-foreground">
                  {active.studentsLove}
                </p>
                <footer className="t-meta mt-3">
                  A note on {active.name.toLowerCase()}
                </footer>
              </blockquote>

              {/* Gallery */}
              <div className="mt-14">
                <SectionHeading
                  eyebrow="Glimpses"
                  title="In Context"
                  testId="chapter-gallery-title"
                />
                <div className="mt-7 grid grid-cols-3 gap-4">
                  {active.gallery.map((src, index) => (
                    <EditorialImage
                      key={src}
                      src={src}
                      alt={`${active.name}, view ${index + 1}`}
                      ratio="square"
                      testId={`chapter-gallery-item-${index}`}
                      onClick={() =>
                        setLightbox({
                          src,
                          alt: `${active.name}, view ${index + 1}`,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </article>
          </Reveal>

          {/* Chapter index rail */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline justify-between gap-4">
              <p className="t-eyebrow">Contents</p>
              <span className="t-meta">{filtered.length} chapters</span>
            </div>

            <div
              data-testid="chapter-rail"
              className="rail-scroll mt-4 overflow-y-auto rounded-card border border-border bg-secondary/50 lg:max-h-[68vh]"
            >
              <ul>
                {filtered.map((chapter, index) => {
                  const isActive = chapter.id === active.id;
                  return (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(chapter.id)}
                        aria-current={isActive ? "true" : undefined}
                        data-active={isActive}
                        data-testid="chapter-rail-item"
                        className={[
                          "flex w-full items-start gap-3.5 border-b border-border/70 px-4 py-3.5 text-left transition-colors duration-fast",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
                          index === filtered.length - 1 ? "border-b-0" : "",
                          isActive ? "bg-background" : "hover:bg-background/60",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-fast",
                            isActive ? "bg-accent" : "bg-rule-strong",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={[
                              "block text-[13px] leading-snug",
                              isActive
                                ? "font-medium text-foreground"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {chapter.name}
                          </span>
                          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {chapter.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="t-meta mt-4 leading-relaxed">
              {school.address.line1}, {school.address.line2}. Visiting hours for prospective families are
              Sunday to Friday, 10:00 to 16:00.
            </p>
          </aside>
        </div>
      )}

      {/* Lightbox */}
      <Dialog
        open={lightbox !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent
          data-testid="chapter-lightbox"
          className="max-w-4xl border-border bg-card p-3 sm:p-4"
        >
          <DialogTitle className="sr-only">
            {lightbox?.alt ?? "Chapter image"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged photograph illustrating our story.
          </DialogDescription>
          {lightbox ? (
            <>
              <div className="overflow-hidden rounded-field border border-border">
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="max-h-[74vh] w-full object-contain"
                />
              </div>
              <p className="t-meta mt-3 px-1">{lightbox.alt}</p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
