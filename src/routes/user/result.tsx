import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader, Section } from "#/templates/modern/components/chrome/PageFrame";
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';

export const Route = createFileRoute("/user/result")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageFrame>
      <PageHeader 
        eyebrow="RESULT"
        title="Board results"
        lead="Division splits over the last five sessions for secondary education exams."
      />
      <Section className="mb-16 mt-8">
          <ResultsChart />
      </Section>
    </PageFrame>
  );
}
