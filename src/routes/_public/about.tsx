import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useRef, useState } from 'react';
import { useScroll, useReducedMotion, AnimatePresence, motion } from 'motion/react';
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { RailFill, RevealUp } from '#/templates/modern/components/motion';
import { CrestExploder } from '#/templates/modern/components/interactions/CrestExploder';
import { ThenNowSlider } from '#/templates/modern/components/utilities/ThenNow';
import { Picture } from '#/templates/modern/components/Picture';
import { Eyebrow, Statement, Rule } from '#/templates/modern/components/Text';
import { Button } from '#/templates/modern/components/Button';
import { duration, easing } from '#/templates/modern/components/tokens';
import { aboutIntro, leadership, milestones, triptych } from '#/content/about';
import { thenNow } from '#/content/extras';
import { photos } from '#/content/images';
import { school } from '#/content/school';
import { cn } from '#/lib/utils';

function MilestoneRows() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end end'] });
  const [open, setOpen] = useState<number | null>(milestones[0].index);
  const reduced = Boolean(useReducedMotion());

  return (
    <div className='flex gap-6' ref={ref}>
      <RailFill progress={scrollYProgress} className='hidden shrink-0 lg:block' />
      <ol className='min-w-0 flex-1'>
        {milestones.map((m) => {
          const expanded = open === m.index;
          return (
            <li key={m.index} className='border-t-hair border-n-200 last:border-b-hair'>
              <button
                type='button'
                onClick={() => setOpen(expanded ? null : m.index)}
                aria-expanded={expanded}
                data-testid={'milestone-row-' + m.index}
                className='flex w-full items-start gap-6 py-8 text-left lg:min-h-[200px] lg:py-12'
              >
                <span className='u-label tnum w-8 shrink-0 text-accent'>
                  {String(m.index).padStart(2, '0')}
                </span>
                <span className='u-label w-[152px] shrink-0 text-n-600'>{m.marker}</span>
                <span className='flex min-w-0 flex-1 flex-col gap-3'>
                  <span className='u-display text-display-m text-ink'>{m.title}</span>
                  <span className='u-label text-n-600'>{m.blurb}</span>
                </span>
                <span
                  aria-hidden='true'
                  className={cn(
                    'u-label shrink-0 text-accent transition-transform duration-standard ease-state',
                    expanded && 'rotate-180',
                  )}
                >
                  ↘
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: duration.standard / 1000, ease: easing.state }}
                    className='overflow-hidden'
                  >
                    <div className='grid gap-8 pb-12 lg:grid-cols-12 lg:pl-[188px]'>
                      {m.image ? (
                        <div className='overflow-hidden rounded-card lg:col-span-5'>
                          <Picture image={m.image} sizes='(min-width: 1024px) 38vw, 92vw' />
                        </div>
                      ) : null}
                      <div className='flex flex-col gap-4 lg:col-span-7'>
                        {m.body.map((para, i) => (
                          <p key={i} className='max-w-measure text-body-m text-n-600'>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export const Route = createFileRoute("/_public/about")({
	component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Section testId='about-intro'>
        <Container>
          <Eyebrow className='mb-4'>{aboutIntro.eyebrow}</Eyebrow>
          <div className='grid items-end gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <Statement as='h1' lines={aboutIntro.statement} />
            </div>
            <p className='max-w-measure text-body-l text-n-600 lg:col-span-4'>{aboutIntro.support}</p>
          </div>
          <Rule className='mt-16' />
          <div className='mt-16'>
            <MilestoneRows />
          </div>
        </Container>
      </Section>

      <Section testId='about-crest' labelledBy='crest-heading'>
        <Container>
          <RevealUp className='mb-12 flex flex-col gap-4'>
            <Eyebrow>The crest, taken apart</Eyebrow>
            <h2 id='crest-heading' className='u-display max-w-measure text-display-l text-ink'>
              Five elements, and what each one is for
            </h2>
          </RevealUp>
          <CrestExploder />
        </Container>
      </Section>

      {/* The single deliberate grid break on this page. */}
      <div className='relative h-[52svh] w-full overflow-hidden' data-testid='about-fullbleed'>
        <Picture image={photos.assemblyAerial} sizes='100vw' className='absolute inset-0' />
      </div>

      <Section testId='about-leadership' labelledBy='leadership-heading'>
        <Container>
          <RevealUp className='mb-12 flex flex-col gap-4'>
            <Eyebrow>The people who hold it</Eyebrow>
            <h2 id='leadership-heading' className='u-display max-w-measure text-display-l text-ink'>
              Leadership
            </h2>
          </RevealUp>
          <ul className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {leadership.map((p, i) => (
              <RevealUp as='li' key={p.id} index={i} className='group flex flex-col gap-4'>
                <div className='aspect-[3/4] w-full overflow-hidden rounded-card border-hair border-n-200'>
                  <Picture
                    image={p.photo}
                    sizes='(min-width: 1024px) 28vw, 90vw'
                    imgClassName='h-full w-full object-cover grayscale transition-[filter] duration-standard ease-state group-hover:grayscale-0'
                  />
                </div>
                <h3 className='u-display text-display-m text-ink'>{p.name}</h3>
                <p className='u-label text-n-600'>{p.role}</p>
                {p.quote ? (
                  <p className='max-w-measure border-l-rule border-accent pl-4 text-body-m text-n-600'>
                    {p.quote}
                  </p>
                ) : null}
              </RevealUp>
            ))}
          </ul>
        </Container>
      </Section>

      <Section testId='about-triptych' labelledBy='triptych-heading'>
        <Container>
          <h2 id='triptych-heading' className='sr-only'>
            Mission, vision and values
          </h2>
          <div className='grid gap-6 lg:grid-cols-3'>
            {triptych.map((t, i) => (
              <RevealUp
                key={t.id}
                index={i}
                className='relative min-h-[420px] overflow-hidden rounded-card border-hair border-n-200 p-8'
              >
                <span
                  aria-hidden='true'
                  className='u-label pointer-events-none absolute -right-2 bottom-0 select-none text-n-100'
                  style={{ fontSize: 180, lineHeight: 0.8 }}
                >
                  {t.numeral}
                </span>
                <div className='relative flex flex-col gap-4'>
                  <Eyebrow>{t.numeral}</Eyebrow>
                  <h3 className='u-display text-display-m text-ink'>{t.title}</h3>
                  <p className='max-w-measure text-body-m text-n-600'>{t.body}</p>
                </div>
              </RevealUp>
            ))}
          </div>
        </Container>
      </Section>

      <Section testId='about-thennow' labelledBy='thennow-heading'>
        <Container>
          <RevealUp className='mb-12 flex flex-col gap-4'>
            <Eyebrow>Then and now</Eyebrow>
            <h2 id='thennow-heading' className='u-display max-w-measure text-display-l text-ink'>
              The same ground, twenty-six years apart
            </h2>
            <p className='u-label text-n-600'>Drag the divider, or use the arrow keys</p>
          </RevealUp>
          <div className='grid gap-12 lg:grid-cols-2'>
            {thenNow.map((t) => (
              <ThenNowSlider key={t.id} item={t} />
            ))}
          </div>
        </Container>
      </Section>

      <section className='w-full bg-brand py-24' aria-labelledby='about-cta'>
        <Container>
          <div className='grid gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-7'>
              <Statement id='about-cta' as='h2' lines={['COME AND', 'SEE IT.']} tone='paper' />
            </div>
            <div className='flex flex-col gap-6 lg:col-span-5'>
              <p className='max-w-measure text-body-m text-paper/85'>
                The office is open from 07:30 through the school week. Ask at the gate for the
                admissions desk, or arrange a walk-through in advance.
              </p>
              <p className='u-label text-paper/70'>
                {school.address.line1}, {school.address.line2}
              </p>
              <Button asChild className='w-fit' testId='about-cta-button'>
                <Link to="/contact">Arrange a visit</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
