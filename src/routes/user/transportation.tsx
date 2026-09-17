import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from '#/templates/modern/components/interactions/BusFinder';

export const Route = createFileRoute("/user/transportation")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageFrame>
      <PageHeader 
        eyebrow="TRANSPORTATION"
        title="Bus route and pickup finder"
        lead="Three routes cover the valley from Hemja in the north-west to Birauta in the south."
      />
      <div className="mt-10 mb-16">
        <BusFinder />
      </div>
    </PageFrame>
  );
}
