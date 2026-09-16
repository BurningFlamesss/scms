import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';
import { Eyebrow } from '#/templates/modern/components/Text';
import { RevealUp } from '#/templates/modern/components/motion';

export const Route = createFileRoute("/user/result")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container className="pt-24 pb-16">
      <Section className="mb-16">
        <RevealUp>
          <ResultsChart />
        </RevealUp>
      </Section>
    </Container>
  );
}
