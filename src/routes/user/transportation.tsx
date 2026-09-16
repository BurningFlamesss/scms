import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { BusFinder } from '#/templates/modern/components/interactions/BusFinder';
import { RevealUp } from '#/templates/modern/components/motion';

export const Route = createFileRoute("/user/transportation")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container className="pt-24 pb-16">
      <Section className="mb-16">
        <RevealUp>
          <BusFinder />
        </RevealUp>
      </Section>
    </Container>
  );
}
