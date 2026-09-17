import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';
import { getBoardResultsServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/result")({
  component: RouteComponent,
  loader: async () => {
    return {
      results: await getBoardResultsServer(),
    };
  }
});

function RouteComponent() {
  const { results } = Route.useLoaderData();

  return (
    <PageFrame>
      <PageHeader 
        eyebrow="RESULT"
        title="Board results"
        lead="Division splits over the last five sessions for secondary education exams."
      />
      <div className="mt-10 mb-16">
          <ResultsChart dbResults={results} />
      </div>
    </PageFrame>
  );
}
