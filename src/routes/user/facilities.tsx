import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useRef } from 'react';
import { useReducedMotion, useScroll } from 'motion/react';
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { FrameSequence, RevealUp } from '#/templates/modern/components/motion';
import { CampusPlan } from '#/templates/modern/components/interactions/CampusPlan';
import { BusFinder } from '#/templates/modern/components/interactions/BusFinder';
import { Picture } from '#/templates/modern/components/Picture';
import { Button } from '#/templates/modern/components/Button';
import { Eyebrow, Statement, Rule } from '#/templates/modern/components/Text';
import { facilities, facilitiesIntro } from '#/content/facilities';
import { photos } from '#/content/images';
import type { Facility } from '#/types';

/**
 * Each facility is a full-height panel. The photograph inside it is a
 * frameSequence, so a facility with several images reveals them by scroll depth.
 * Vertically stacked — never a horizontal scroll hijack.
 */
function FacilityPanel({ facility, n }: { facility: Facility; n: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const frames = facility.images.map((im) => ({
    src: im.src,
    alt: im.alt,
    width: im.width,
    height: im.height,
  }));

  return (
    <section
      className='grid gap-8 border-t-hair border-n-200 py-16 lg:grid-cols-12 lg:py-24'
      aria-labelledby={'facility-' + facility.id}
      data-testid={'facility-panel-' + facility.id}
    >
      <div className='flex flex-col gap-6 lg:col-span-5'>
        <div className='flex items-baseline gap-4'>
          <span className='u-label tnum text-accent'>{String(n).padStart(2, '0')}</span>
          <span className='u-label text-n-600'>{facility.room}</span>
        </div>
        <h3 id={'facility-' + facility.id} className='u-display text-display-l text-ink'>
          {facility.name}
        </h3>
        <p className='max-w-measure text-body-l text-n-600'>{facility.note}</p>
        <ul className='flex flex-col'>
          {facility.specs.map((s) => (
            <li key={s} className='border-t-hair border-n-200 py-3 text-body-m text-ink last:border-b-hair'>
              {s}
            </li>
          ))}
        </ul>
        <dl className='flex flex-wrap gap-x-8 gap-y-2'>
          <div className='flex gap-2'>
            <dt className='u-label text-n-600'>Capacity</dt>
            <dd className='u-label tnum text-ink'>{facility.capacity}</dd>
          </div>
          <div className='flex gap-2'>
            <dt className='u-label text-n-600'>Hours</dt>
            <dd className='u-label tnum text-ink'>{facility.hours}</dd>
          </div>
        </dl>
      </div>

      <div ref={ref} className='lg:col-span-7'>
        <div className='relative aspect-[4/3] w-full overflow-hidden rounded-card border-hair border-n-200'>
          {frames.length > 1 ? (
            <FrameSequence
              frames={frames}
              progress={scrollYProgress}
              reduced={reduced}
              sizes='(min-width: 1024px) 55vw, 92vw'
            />
          ) : (
            <Picture image={facility.images[0]} sizes='(min-width: 1024px) 55vw, 92vw' className='absolute inset-0' />
          )}
        </div>
        {frames.length > 1 ? (
          <p className='u-label mt-3 text-n-600'>
            {frames.length} photographs · they change as you scroll past
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/user/facilities")({
	component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Section testId='facilities-intro'>
        <Container>
          <Eyebrow className='mb-4'>{facilitiesIntro.eyebrow}</Eyebrow>
          <div className='grid items-end gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <Statement as='h1' lines={facilitiesIntro.statement} />
            </div>
            <p className='max-w-measure text-body-l text-n-600 lg:col-span-4'>{facilitiesIntro.support}</p>
          </div>
          <Rule className='mt-16' />
          <div className='mt-16'>
            <CampusPlan />
          </div>
        </Container>
      </Section>

      {/* The single deliberate grid break on this page. */}
      <div className='relative h-[46svh] w-full overflow-hidden' data-testid='facilities-fullbleed'>
        <Picture image={photos.campusModern} sizes='100vw' className='absolute inset-0' />
      </div>

      <Section testId='facilities-rooms' labelledBy='rooms-heading'>
        <Container>
          <RevealUp className='mb-8 flex flex-col gap-4'>
            <Eyebrow>The rooms</Eyebrow>
            <h2 id='rooms-heading' className='u-display max-w-measure text-display-l text-ink'>
              What happens in each one
            </h2>
          </RevealUp>
          {facilities.map((f, i) => (
            <FacilityPanel key={f.id} facility={f} n={i + 1} />
          ))}
        </Container>
      </Section>

      <Section testId='facilities-transport' className='bg-n-50'>
        <Container>
          <BusFinder />
        </Container>
      </Section>

      <section className='w-full bg-brand py-24' aria-labelledby='facilities-cta'>
        <Container>
          <div className='grid gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-7'>
              <Statement id='facilities-cta' as='h2' lines={['WALK THROUGH', 'IT YOURSELF.']} tone='paper' />
            </div>
            <div className='flex flex-col gap-6 lg:col-span-5'>
              <p className='max-w-measure text-body-m text-paper/85'>
                Campus visits run on any school day between 10:00 and 15:00. Ask for the transport
                in-charge if you want to see the bus route before you decide.
              </p>
              <Button asChild className='w-fit' testId='facilities-cta-button'>
                <Link to="/contact">Arrange a campus visit</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
