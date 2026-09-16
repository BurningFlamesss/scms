import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageFrame, PageHeader, Section } from "#/templates/modern/components/chrome/PageFrame";
import { StreamChooser } from '#/templates/modern/components/interactions/StreamChooser';

export const Route = createFileRoute("/user/course-finder")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <PageFrame>
      <PageHeader 
        eyebrow="COURSE FINDER"
        title="Which stream"
        lead="Six questions. The result shows all three streams and why each one ranked where it did."
      />
      <Section className="mt-8">
          <StreamChooser
            onHandoff={() => {}}
            onSeeAll={() => navigate({ to: "/" })}
          />
      </Section>
    </PageFrame>
  );
}
