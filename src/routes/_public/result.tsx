import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';

export const Route = createFileRoute("/_public/result")({
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
      <div className="mt-10 mb-16">
          <ResultsChart />
      </div>
    </PageFrame>
  );
}
