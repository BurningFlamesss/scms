import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from '#/templates/modern/components/interactions/BusFinder';
import { getBusRoutesServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/transportation")({
  component: RouteComponent,
  loader: async () => {
    return {
      routes: await getBusRoutesServer(),
    };
  }
});

function RouteComponent() {
  const { routes } = Route.useLoaderData();
  
  return (
    <PageFrame>
      <PageHeader 
        eyebrow="TRANSPORTATION"
        title="Bus route and pickup finder"
        lead="Three routes cover the valley from Hemja in the north-west to Birauta in the south."
      />
      <div className="mt-10 mb-16">
        <BusFinder routes={routes} />
      </div>
    </PageFrame>
  );
}
