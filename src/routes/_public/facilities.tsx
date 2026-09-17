import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Expand, MapPin, Quote, UserRound } from "lucide-react";
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
import { facilities } from "#/lib/facilities";
import { school } from "#/content/school";
import { facilityBriefDoc, facilityIndexDoc } from "#/lib/documents";
import { downloadOfficialPdf } from "#/lib/pdf";
import type { Facility } from "#/types";

const CATEGORY_ORDER = [
  "Academic",
  "Laboratory",
  "Technology",
  "Sports",
  "Residential",
  "Wellbeing",
  "Arts",
  "Campus",
];

export const Route = createFileRoute("/_public/facilities")({
	component: RouteComponent,
});

function RouteComponent() {
  const [category, setCategory] = useState<string>("all");
  const [activeId, setActiveId] = useState<string>(facilities[0].id);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    if (category === "all") return facilities;
    return facilities.filter((f) => f.category === category);
  }, [category]);

  const active: Facility | undefined = useMemo(
    () => filtered.find((f) => f.id === activeId) ?? filtered[0],
    [filtered, activeId],
  );

  const chipOptions = useMemo(
    () => [
      { value: "all", label: "All spaces", count: facilities.length },
      ...CATEGORY_ORDER.filter((c) =>
        facilities.some((f) => f.category === c),
      ).map((c) => ({
        value: c,
        label: c,
        count: facilities.filter((f) => f.category === c).length,
      })),
    ],
    [],
  );

  const handleCategory = (next: string) => {
    setCategory(next);
    const first =
      next === "all"
        ? facilities[0]
        : facilities.find((f) => f.category === next);
    if (first) setActiveId(first.id);
  };

  return (
    <PageFrame testId="facilities-page">
      <PageHeader
        testId="facilities-page-header"
        eyebrow="Campus"
        title="Facilities & Infrastructure"
        subtitle="Capacity, opening hours and the member of staff who holds the key, for every space on the Butwal-8 campus."
        meta={[
          { label: "Facilities", value: String(facilities.length) },
          { label: "Laboratories", value: "3" },
          { label: "Hostel", value: "240 beds" },
          { label: "Campus", value: "Butwal-8" },
        ]}
        actions={
          <DownloadButton
            label="Campus facilities index"
            meta={`PDF · ${facilities.length} facilities · ${school.session}`}
            stamp="Official"
            testId="facilities-download-index-button"
            onDownload={() => downloadOfficialPdf(facilityIndexDoc(facilities))}
          />
        }
      />

      <div className="mt-14">
        <FilterChips
          label="Facility category"
          testId="facility-category-filter"
          options={chipOptions}
          value={category}
          onChange={handleCategory}
        />
      </div>

      {!active ? (
        <div className="mt-10">
          <EmptyState
            title="No space matches that category"
            description="Try a different category, or view every space on the campus index."
            actionLabel="Show all spaces"
            onAction={() => handleCategory("all")}
            testId="facilities-empty-state"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.55fr_0.85fr] lg:gap-14">
          {/* Featured space */}
          <Reveal key={active.id} className="min-w-0">
            <article data-testid="facility-featured">
              <EditorialImage
                src={active.image}
                alt={active.name}
                ratio="feature"
                caption={`${active.name} · ${active.block}`}
                testId="facility-featured-image"
                onClick={() =>
                  setLightbox({ src: active.image, alt: active.name })
                }
              />

              <div className="mt-8 border-l-2 border-accent/35 pl-6">
                <p className="t-eyebrow">{active.category}</p>
                <h2
                  className="t-h2 mt-2.5 text-foreground"
                  data-testid="facility-featured-title"
                >
                  {active.name}
                </h2>
                <p className="t-body mt-4 max-w-measure text-muted-foreground">
                  {active.description}
                </p>
              </div>

              {/* Specs strip */}
              <dl
                data-testid="facility-specs-strip"
                className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4"
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
                  { icon: MapPin, label: "Location", value: active.block },
                  { icon: Clock3, label: "Open hours", value: active.hours },
                  {
                    icon: UserRound,
                    label: "In charge",
                    value: active.inCharge,
                  },
                  {
                    icon: Expand,
                    label: "In service since",
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
                data-testid="facility-students-love"
                className="mt-9 rounded-card bg-secondary/60 px-6 py-6"
              >
                <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 max-w-measure font-display text-lg italic leading-snug text-foreground">
                  {active.studentsLove}
                </p>
                <footer className="t-meta mt-3">
                  What students say about this space
                </footer>
              </blockquote>

              {/* Gallery */}
              <div className="mt-14">
                <SectionHeading
                  eyebrow="Gallery"
                  title="Inside the space"
                  testId="facility-gallery-title"
                />
                <div className="mt-7 grid grid-cols-3 gap-4">
                  {active.gallery.map((src, index) => (
                    <EditorialImage
                      key={src}
                      src={src}
                      alt={`${active.name}, view ${index + 1}`}
                      ratio="square"
                      testId={`facility-gallery-item-${index}`}
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

              <div className="mt-10 border-t border-rule-soft pt-7">
                <DownloadButton
                  label="Facility brief"
                  meta={`PDF · ${active.name} · specifications and hours`}
                  stamp="Facility brief"
                  testId="facility-download-brief-button"
                  onDownload={() =>
                    downloadOfficialPdf(facilityBriefDoc(active))
                  }
                />
              </div>
            </article>
          </Reveal>

          {/* Facility index rail */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline justify-between gap-4">
              <p className="t-eyebrow">Facility index</p>
              <span className="t-meta">{filtered.length} spaces</span>
            </div>

            <div
              data-testid="facility-rail"
              className="rail-scroll mt-4 overflow-y-auto rounded-card border border-border bg-secondary/50 lg:max-h-[68vh]"
            >
              <ul>
                {filtered.map((facility, index) => {
                  const isActive = facility.id === active.id;
                  return (
                    <li key={facility.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(facility.id)}
                        aria-current={isActive ? "true" : undefined}
                        data-active={isActive}
                        data-testid="facility-rail-item"
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
                            {facility.name}
                          </span>
                          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {facility.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="t-meta mt-4 leading-relaxed">
              {school.fullAddress}. Visiting hours for prospective families are
              Saturday, 10:00 to 16:00.
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
          data-testid="facility-lightbox"
          className="max-w-4xl border-border bg-card p-3 sm:p-4"
        >
          <DialogTitle className="sr-only">
            {lightbox?.alt ?? "Facility image"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged photograph of the selected campus facility.
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
