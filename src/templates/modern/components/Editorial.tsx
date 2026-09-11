import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useImageReveal, useReveal } from "#/hooks/useReveal.ts";
import { Link } from "@tanstack/react-router";

export function SectionLabel({ number, children, inverse = false, testId }) {
  return (
    <div
      className={`section-label ${inverse ? "section-label--inverse" : ""}`}
      data-testid={testId || "section-label"}
    >
      <span>{number}</span>
      <span>{children}</span>
      <i aria-hidden="true" />
    </div>
  );
}

export function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal({ delay });
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function ImageReveal({ src, alt, className = "", caption, eager = false, testId }) {
  const ref = useImageReveal();
  return (
    <figure ref={ref} className={`image-reveal ${className}`} data-testid={testId || "image-reveal"}>
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function ArrowLink({ to, href, children, inverse = false, testId = "arrow-link" }) {
  const content = (
    <>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </>
  );
  const className = `arrow-link ${inverse ? "arrow-link--inverse" : ""}`;
  return to ? (
    <Link to={to} className={className} data-testid={testId}>
      {content}
    </Link>
  ) : (
    <a href={href} className={className} data-testid={testId}>
      {content}
    </a>
  );
}

export function PageHero({ eyebrow, title, intro, index, children, compact = false }) {
  return (
    <section className={`page-hero ${compact ? "page-hero--compact" : ""}`}>
      <div className="page-shell">
        <SectionLabel number={index}>{eyebrow}</SectionLabel>
        <div className="page-hero__grid">
          <Reveal className="page-hero__title-wrap">
            <h1>{title}</h1>
          </Reveal>
          <Reveal className="page-hero__intro" delay={0.08}>
            <p>{intro}</p>
            <ArrowDownRight aria-hidden="true" />
          </Reveal>
        </div>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ kicker, children, className = "" }) {
  return (
    <div className={`section-heading ${className}`}>
      {kicker ? <span>{kicker}</span> : null}
      <h2>{children}</h2>
    </div>
  );
}
