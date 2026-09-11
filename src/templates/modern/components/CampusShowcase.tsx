import { school } from "#/content/school";
import { ArrowLink, ImageReveal, SectionLabel } from "#/templates/modern/components/Editorial";

export function CampusShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`campus-showcase ${compact ? "campus-showcase--compact" : ""}`} data-testid="campus-showcase">
      <div className="u-container">
        <SectionLabel number="06">One school / two spaces</SectionLabel>
        <div className="campus-showcase__headline">
          <h2>
            <span>Everest</span>
            <i>meets</i>
            <span>Canon</span>
          </h2>
          <p>{school.organizationNote}</p>
        </div>
      </div>
      <div className="campus-showcase__images">
        {school.campuses.map((campus, index) => (
          <article key={campus.id} className="campus-panel">
            <ImageReveal
              src={campus.image}
              alt={`${campus.name} architectural learning space`}
              className="campus-panel__image"
              testId={`campus-${campus.id}-image`}
            />
            <div className="campus-panel__content">
              <span>0{index + 1}</span>
              <h3>{campus.name.replace(" Building", "")}</h3>
              <p>{campus.role}</p>
              <p data-testid={`campus-${campus.id}-address`}>{campus.address}</p>
            </div>
          </article>
        ))}
      </div>
      {!compact ? (
        <div className="u-container campus-showcase__link">
          <ArrowLink to="/contact" testId="campus-contact-link">Plan a conversation with the school</ArrowLink>
        </div>
      ) : null}
    </section>
  );
}
