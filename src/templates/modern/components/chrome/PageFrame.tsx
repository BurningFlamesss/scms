import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE, STAGGER } from "#lib/motion";

/** Outer page container. Never centre-aligned; editorial gutters only. */
export const PageFrame = ({
  children,
  className = "",
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    className={`mx-auto w-full max-w-frame px-4 pb-28 sm:px-6 lg:px-10 ${className}`}
  >
    {children}
  </div>
);

/** Fade + 8px rise. Used for page-level entrance and list staggering. */
export const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: DUR.slow, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

export interface MetaItem {
  label: string;
  value: string;
}

/**
 * Page masthead shared by all five sections.
 *
 * Plain and legible: one quiet eyebrow, a serif title at a comfortable
 * reading size, a single explanatory line, and an optional fact row.
 * No banner, no image, no stacked calls to action — the page simply
 * says what it is and then gets on with the content.
 */
export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  testId,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: MetaItem[];
  actions?: ReactNode;
  testId: string;
}) => (
  <header className="pt-12 sm:pt-16" data-testid={testId}>
    <Reveal>
      <p className="t-eyebrow" data-testid={`${testId}-eyebrow`}>
        {eyebrow}
      </p>
      <h1
        className="t-page-title mt-4 max-w-[24ch] text-foreground"
        data-testid={`${testId}-title`}
      >
        {title}
      </h1>
      <p
        className="mt-5 max-w-[58ch] font-sans text-[15px] leading-[1.65] text-muted-foreground sm:text-base"
        data-testid={`${testId}-subtitle`}
      >
        {subtitle}
      </p>
    </Reveal>

    {(meta && meta.length > 0) || actions ? (
      <Reveal delay={STAGGER}>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 border-t border-rule pt-6">
          {meta && meta.length > 0 ? (
            <dl
              className="flex flex-wrap gap-x-12 gap-y-5"
              data-testid={`${testId}-meta`}
            >
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="t-eyebrow">{item.label}</dt>
                  <dd className="mt-2 font-display text-[17px] font-semibold leading-none text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <span />
          )}
          {actions ? (
            <div className="min-w-0 max-w-full basis-full sm:basis-auto">
              {actions}
            </div>
          ) : null}
        </div>
      </Reveal>
    ) : (
      <div className="mt-10 border-t border-rule" />
    )}
  </header>
);

/**
 * A distinct, clearly delimited page section.
 *
 * Each one opens on a full-width hairline so the eye can tell where one
 * subject ends and the next begins, rather than reading the page as a
 * single dense wall.
 */
export const Section = ({
  children,
  className = "",
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) => (
  <section
    className={`mt-section lg:mt-section-lg ${className}`}
    data-testid={testId}
  >
    {children}
  </section>
);

/** Section opener: hairline, quiet label, serif title, optional single line. */
export const SectionHeading = ({
  eyebrow,
  title,
  description,
  aside,
  rule = true,
  className = "",
  testId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  rule?: boolean;
  className?: string;
  testId?: string;
}) => (
  <div
    className={`${rule ? "border-t border-rule-strong pt-6" : ""} ${className}`}
  >
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="min-w-0">
        {eyebrow ? <p className="t-eyebrow">{eyebrow}</p> : null}
        <h2 className="t-h2 mt-2 text-foreground" data-testid={testId}>
          {title}
        </h2>
      </div>
      {aside ? (
        <div className="flex items-center gap-2 pb-1">{aside}</div>
      ) : null}
    </div>
    {description ? (
      <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    ) : null}
  </div>
);
