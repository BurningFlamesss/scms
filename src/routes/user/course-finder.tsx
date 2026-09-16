import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { StreamChooser } from '#/templates/modern/components/interactions/StreamChooser';
import { RevealUp } from '#/templates/modern/components/motion';
import { Eyebrow, Statement } from "#/templates/modern/components/Text";

export const Route = createFileRoute("/user/course-finder")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container className="pt-24 pb-16">
      <Section className="mx-auto max-w-4xl text-center mb-16">
        <RevealUp>
          <Eyebrow>Which stream</Eyebrow>
          <Statement>Six questions. The result shows all three streams and why each one ranked where it did.</Statement>
        </RevealUp>
      </Section>
      <Section>
        <RevealUp delay={100}>
          <StreamChooser />
        </RevealUp>
      </Section>
    </Container>
  );
}
