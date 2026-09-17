import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Paperclip, Pin } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PageFrame,
  PageHeader,
  Reveal,
  Section,
  SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Separator,
} from "#/templates/modern/components/kit";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";
import { FilterChips } from "#/templates/modern/components/shared/FilterChips";
import { notices as staticNotices } from "#/lib/notices";
import { formatAd, relativeDay } from "#/lib/dates";
import { noticeDoc } from "#/lib/documents";
import { downloadOfficialPdf } from "#/lib/pdf";
import { useNotices } from "#/packages/school/hook.tsx";
import type { Notice } from "#/types";

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground">
    {children}
  </span>
);

/* --------------------------- Reader dialog --------------------------- */

const NoticeReader = ({ notice }: { notice: Notice }) => (
  <div>
    <div className="flex flex-wrap items-center gap-2.5">
      <Chip>{notice.category}</Chip>
      <span className="t-meta">{notice.ref}</span>
    </div>

    <DialogTitle
      className="mt-4 pr-8 font-display text-[23px] font-semibold leading-snug text-foreground sm:text-[27px]"
      data-testid="notice-detail-title"
    >
      {notice.title}
    </DialogTitle>

    <DialogDescription className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
      {notice.dateBs} BS · {formatAd(notice.dateAd)} · issued by{" "}
      {notice.issuedBy} · for {notice.audience}
    </DialogDescription>

    <Separator className="my-7" />

    <div className="space-y-4">
      {notice.body.map((paragraph) => (
        <p
          key={paragraph.slice(0, 40)}
          className="text-[14.5px] leading-[1.75] text-foreground"
        >
          {paragraph}
        </p>
      ))}
    </div>

    {notice.bullets ? (
      <div className="mt-8">
        <p className="t-eyebrow">Points to note</p>
        <ul className="mt-3.5 space-y-2.5">
          {notice.bullets.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="text-[13.5px] leading-relaxed text-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ) : null}

    {notice.table ? (
      <div className="mt-8 overflow-hidden rounded-card border border-border">
        <div className="rail-scroll overflow-x-auto">
          <table
            className="w-full min-w-[600px] border-collapse text-left"
            data-testid="notice-detail-table"
          >
            <caption className="sr-only">{notice.table.caption}</caption>
            <thead>
              <tr className="border-b border-border bg-secondary">
                {notice.table.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-3.5 py-3 text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notice.table.rows.map((row, index) => (
                <tr
                  key={row.join("-")}
                  className={`border-b border-rule-soft last:border-b-0 ${
                    index % 2 === 1 ? "bg-secondary/40" : ""
                  }`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cell}-${cellIndex}`}
                      className={[
                        "px-3.5 py-3 align-top text-[12.5px]",
                        cellIndex < 2
                          ? "whitespace-nowrap font-mono text-[10.5px] tabular-nums text-muted-foreground"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : null}

    {notice.attachments.length > 0 ? (
      <div className="mt-8">
        <p className="t-eyebrow">Attachments</p>
        <ul className="mt-3.5 divide-y divide-rule-soft border-y border-border">
          {notice.attachments.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Paperclip
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="truncate font-mono text-[11.5px] text-foreground">
                  {file.name}
                </span>
              </span>
              <span className="t-meta shrink-0">{file.size}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null}

    <div className="mt-9 border-t border-rule-soft pt-7">
      <DownloadButton
        label="Download this notice"
        meta={`PDF · true copy of ${notice.ref}`}
        stamp="Official"
        testId="notice-download-pdf-button"
        onDownload={() => downloadOfficialPdf(noticeDoc(notice))}
      />
    </div>
  </div>
);

/* ------------------------------- Page -------------------------------- */

export const Route = createFileRoute("/_public/notices")({
	component: RouteComponent,
});

function RouteComponent() {
  // Notices are served from the database (seeded from src/lib/notices); the
  // static list is the fallback when the collection is empty.
  const dbNotices = useNotices();
  const notices = dbNotices && dbNotices.length > 0 ? dbNotices : staticNotices;
  const noticeCategories = Array.from(
    new Set(notices.map((n) => n.category)),
  ).sort();

  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState<Notice | null>(null);

  const byDateDesc = (a: Notice, b: Notice) => b.dateAd.localeCompare(a.dateAd);

  /** The single pinned notice, or failing that the most recent one. */
  const pinned = useMemo(() => {
    const flagged = notices.filter((n) => n.pinned).sort(byDateDesc);
    return flagged[0] ?? [...notices].sort(byDateDesc)[0];
  }, [notices]);

  /** Everything else, newest first. */
  const rest = useMemo(
    () => notices.filter((n) => n.id !== pinned.id).sort(byDateDesc),
    [notices, pinned.id],
  );

  const filtered = useMemo(
    () =>
      category === "all" ? rest : rest.filter((n) => n.category === category),
    [rest, category],
  );

  const chipOptions = useMemo(
    () => [
      { value: "all", label: "All", count: rest.length },
      ...noticeCategories
        .filter((c) => rest.some((n) => n.category === c))
        .map((c) => ({
          value: c,
          label: c,
          count: rest.filter((n) => n.category === c).length,
        })),
    ],
    [rest, noticeCategories],
  );

  return (
    <PageFrame testId="notices-page">
      <PageHeader
        testId="notices-page-header"
        eyebrow="Notice board"
        title="Notices & Announcements"
        subtitle="Everything the school has published this session, newest first. Open any notice to read it in full."
        meta={[
          { label: "Published", value: String(notices.length) },
          { label: "Latest", value: formatAd(rest[0]?.dateAd ?? pinned.dateAd) },
        ]}
      />

      {/* ---------------- Pinned notice: read it right here ---------------- */}
      <Section testId="notice-pinned-section">
        <SectionHeading
          eyebrow="Pinned by the office"
          title="Read this first"
          testId="notice-pinned-heading"
        />

        <Reveal>
          <article
            data-testid="notice-pinned-card"
            className="mt-8 rounded-card border border-border bg-card p-6 shadow-sm sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-[11.5px] font-medium leading-normal text-accent">
                <Pin className="h-3 w-3" aria-hidden="true" />
                Pinned
              </span>
              <Chip>{pinned.category}</Chip>
              <span className="t-meta">
                {pinned.dateBs} BS · {relativeDay(pinned.dateAd)}
              </span>
            </div>

            <h3
              className="mt-5 max-w-[30ch] font-display text-[25px] font-semibold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[30px]"
              data-testid="notice-pinned-title"
            >
              {pinned.title}
            </h3>

            <p
              className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-muted-foreground"
              data-testid="notice-pinned-summary"
            >
              {pinned.summary}
            </p>

            <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5 border-t border-rule-soft pt-6">
              {[
                { label: "Reference", value: pinned.ref },
                { label: "Issued by", value: pinned.issuedBy },
                { label: "Concerns", value: pinned.audience },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="t-eyebrow">{item.label}</dt>
                  <dd className="mt-2 text-[13.5px] leading-relaxed text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setOpen(pinned)}
              data-testid="notice-pinned-read-button"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-field bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-fast hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the full notice
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </article>
        </Reveal>
      </Section>

      {/* ---------------------- Everything else ---------------------- */}
      <Section testId="notice-list-section">
        <SectionHeading
          eyebrow="Archive"
          title="Every other notice"
          description="Select any line to read the notice in full, along with its attachments and a printable copy."
          testId="notice-list-heading"
          aside={
            <span className="t-meta" data-testid="notice-result-count">
              {filtered.length} of {rest.length}
            </span>
          }
        />

        <div className="mt-7">
          <FilterChips
            label="Notice category"
            testId="notice-category-filter"
            options={chipOptions}
            value={category}
            onChange={setCategory}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-9">
            <EmptyState
              eyebrow="No notices"
              title="Nothing published under that heading"
              description="Choose another category to see the notices filed there."
              actionLabel="Show all notices"
              onAction={() => setCategory("all")}
              testId="notices-empty-state"
            />
          </div>
        ) : (
          <ul
            data-testid="notice-list"
            className="mt-8 divide-y divide-rule-soft"
          >
            {filtered.map((notice) => (
              <li key={notice.id} id={notice.id}>
                <button
                  type="button"
                  onClick={() => setOpen(notice)}
                  data-testid="notice-row"
                  className="group grid w-full grid-cols-1 gap-x-8 gap-y-2.5 py-6 text-left transition-colors duration-fast !border-0 !bg-transparent hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-0 sm:grid-cols-[110px_1fr_auto] sm:items-start"
                >
                  <span className="sm:pt-1">
                    <span className="block font-mono text-[12px] tabular-nums leading-none text-foreground">
                      {formatAd(notice.dateAd)}
                    </span>
                    <span className="mt-2 block font-mono text-[10.5px] leading-none text-muted-foreground">
                      {notice.dateBs.replace(", 2083", "")} BS
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block max-w-[54ch] font-display text-[17px] font-semibold leading-snug text-foreground">
                      {notice.title}
                    </span>
                    <span className="mt-2.5 block max-w-[62ch] text-[13.5px] leading-relaxed text-muted-foreground">
                      {notice.summary}
                    </span>
                    <span className="mt-3.5 flex flex-wrap items-center gap-2.5">
                      <Chip>{notice.category}</Chip>
                      <span className="t-meta">{notice.ref}</span>
                    </span>
                  </span>

                  <span className="hidden shrink-0 items-center gap-1.5 pt-1 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground sm:flex">
                    Read
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Reader */}
      <Dialog
        open={open !== null}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setOpen(null);
        }}
      >
        <DialogContent
          data-testid="notice-detail-dialog"
          className="max-h-[88vh] max-w-3xl overflow-y-auto border-border bg-card p-6 sm:p-8"
        >
          {open ? <NoticeReader notice={open} /> : null}
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
