import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'motion/react';
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { RailFill, RevealUp } from '#/templates/modern/components/motion';
import { StreamChooser } from '#/templates/modern/components/interactions/StreamChooser';
import { StreamCompare } from '#/templates/modern/components/interactions/StreamCompare';
import { FeeEstimator } from '#/templates/modern/components/interactions/FeeEstimator';
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';
import { Chip } from '#/templates/modern/components/Chip';
import { Button } from '#/templates/modern/components/Button';
import { Eyebrow, Statement, Rule } from '#/templates/modern/components/Text';
import { duration, easing } from '#/templates/modern/components/tokens';
import { coursesIntro, eligibility, levels, plusTwoStreams } from '#/content/courses';
import { formatNpr } from '#/lib/fees';
import { cn } from '#/lib/utils';
import type { QuizStreamId, Subject } from '#/content/types';

export const Route = createFileRoute("/_public/courses")({
	component: RouteComponent,
});


function SubjectRow({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const reduced = Boolean(useReducedMotion());
  return (
    <li className='border-t-hair border-n-200 last:border-b-hair'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        data-testid={'subject-' + subject.id}
        className='flex w-full flex-wrap items-baseline gap-x-6 gap-y-2 py-4 text-left'
      >
        <span className='u-display min-w-0 flex-1 text-display-m text-ink'>{subject.name}</span>
        <span className='u-label tnum text-n-600'>{subject.creditHours} credit hours</span>
        <span className='u-label tnum text-n-600'>
          {subject.theory} theory + {subject.practical} practical
        </span>
        <span
          aria-hidden='true'
          className={cn(
            'u-label text-accent transition-transform duration-standard ease-state',
            open && 'rotate-180',
          )}
        >
          ↘
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: duration.standard / 1000, ease: easing.state }}
            className='overflow-hidden'
          >
            <ul className='flex flex-col gap-2 pb-6 pl-6'>
              {subject.outline.map((o, i) => (
                <li key={i} className='max-w-measure text-body-m text-n-600'>
                  — {o}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export default function RouteComponent() {
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [streamFilter, setStreamFilter] = useState<QuizStreamId | null>(null);
  const [left, setLeft] = useState<QuizStreamId>('science');
  const [right, setRight] = useState<QuizStreamId>('management');
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start center', 'end end'] });

  const visible = useMemo(
    () => (levelFilter.length === 0 ? levels : levels.filter((l) => levelFilter.includes(l.id))),
    [levelFilter],
  );

  const toggleLevel = (id: string) =>
    setLevelFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Section testId='courses-intro'>
        <Container>
          <Eyebrow className='mb-4'>{coursesIntro.eyebrow}</Eyebrow>
          <div className='grid items-end gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <Statement as='h1' lines={coursesIntro.statement} />
            </div>
            <p className='max-w-measure text-body-l text-n-600 lg:col-span-4'>{coursesIntro.support}</p>
          </div>
          <Rule className='mt-16' />
        </Container>
      </Section>

      {/* The climb: three bands with a rising baseline. */}
      <div ref={railRef}>
        <Container className='pb-8'>
          <div className='flex flex-wrap items-center gap-3' data-testid='level-filters'>
            <span className='u-label mr-2 text-n-600'>Filter</span>
            {levels.map((l) => (
              <Chip
                key={l.id}
                selected={levelFilter.includes(l.id)}
                onClick={() => toggleLevel(l.id)}
                testId={'chip-' + l.id}
              >
                {l.name}
              </Chip>
            ))}
            {levelFilter.length ? (
              <Chip selected={false} onClick={() => setLevelFilter([])} testId='chip-clear'>
                Clear
              </Chip>
            ) : null}
          </div>
        </Container>

        {visible.length === 0 ? (
          <Container>
            <p className='border-y-hair border-n-300 py-12 text-body-l text-ink'>
              No level matches that filter. Clear it to see all four again.
            </p>
          </Container>
        ) : null}

        {visible.map((level, bandIndex) => {
          const rise = ['pt-24', 'pt-16', 'pt-8', 'pt-2'][Math.min(bandIndex, 3)];
          const isPlusTwo = level.id === 'plus-two';
          const streams = isPlusTwo
            ? streamFilter
              ? level.streams.filter((s) => s.id === streamFilter)
              : level.streams
            : level.streams;
          return (
            <section
              key={level.id}
              id={'level-' + level.id}
              className={cn('w-full border-t-hair border-n-200 pb-24', rise)}
              data-testid={'band-' + level.id}
              aria-labelledby={'band-heading-' + level.id}
            >
              <Container>
                <div className='flex gap-6'>
                  <div className='hidden shrink-0 flex-col items-center gap-4 lg:flex'>
                    <span className='u-label whitespace-nowrap text-accent'>{level.marker}</span>
                    <RailFill progress={scrollYProgress} className='min-h-[120px] flex-1' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <RevealUp className='flex flex-col gap-4'>
                      <p className='u-label text-accent lg:hidden'>{level.marker}</p>
                      <h2 id={'band-heading-' + level.id} className='u-display text-display-l text-ink'>
                        {level.name}
                      </h2>
                      <p className='u-label text-n-600'>{level.grades}</p>
                      <p className='max-w-measure text-body-l text-n-600'>{level.blurb}</p>
                    </RevealUp>

                    {isPlusTwo ? (
                      <div className='mt-8 flex flex-wrap items-center gap-3' data-testid='stream-filters'>
                        <span className='u-label mr-2 text-n-600'>Stream</span>
                        {plusTwoStreams.map((s) => (
                          <Chip
                            key={s.id}
                            selected={streamFilter === s.id}
                            onClick={() =>
                              setStreamFilter(streamFilter === s.id ? null : (s.id as QuizStreamId))
                            }
                            testId={'chip-stream-' + s.id}
                          >
                            {s.name}
                          </Chip>
                        ))}
                      </div>
                    ) : null}

                    <div className='mt-12 flex flex-col gap-12'>
                      {streams.map((stream) => (
                        <div key={stream.id}>
                          {isPlusTwo ? (
                            <h3 className='u-display mb-4 text-display-m text-ink'>{stream.name}</h3>
                          ) : null}
                          <ul className='flex flex-col'>
                            {stream.subjects.map((s) => (
                              <SubjectRow key={stream.id + s.id} subject={s} />
                            ))}
                          </ul>
                          {stream.careers.length ? (
                            <ul className='mt-4 flex flex-wrap gap-2'>
                              {stream.careers.map((c) => (
                                <li
                                  key={c}
                                  className='u-label rounded-pill border-hair border-n-300 px-3 py-1 text-n-600'
                                >
                                  {c}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          );
        })}
      </div>

      <Section testId='courses-chooser' className='bg-n-50'>
        <Container>
          <StreamChooser
            onSeeAll={() => {
              setStreamFilter(null);
              scrollTo('level-plus-two');
            }}
            onHandoff={([a, b]) => {
              setLeft(a);
              setRight(b);
              scrollTo('stream-compare');
            }}
          />
        </Container>
      </Section>

      <Section testId='courses-compare'>
        <Container>
          <StreamCompare left={left} right={right} onLeft={setLeft} onRight={setRight} />
        </Container>
      </Section>

      <Section testId='courses-fees' labelledBy='fees-heading'>
        <Container>
          <RevealUp className='mb-12 flex flex-col gap-4'>
            <Eyebrow>Eligibility and fees</Eyebrow>
            <h2 id='fees-heading' className='u-display max-w-measure text-display-l text-ink'>
              What it takes to join, and what it costs
            </h2>
          </RevealUp>

          <div
            className='max-h-[560px] overflow-auto u-edge-fade'
            tabIndex={0}
            role='region'
            aria-label='Full fee table, scrolls within this panel'
            data-testid='fee-table-scroll'
          >
            <table className='w-full min-w-[820px] border-collapse text-left'>
              <caption className='u-label pb-4 text-left text-n-600'>
                Eligibility, intake and published fees for the 2083 BS session
              </caption>
              <thead className='sticky top-0 z-10 bg-paper'>
                <tr>
                  {['Level', 'Entry requirement', 'Intake', 'Admission fee', 'Monthly tuition'].map((h) => (
                    <th key={h} scope='col' className='u-label border-b-rule border-n-300 bg-paper py-3 pr-6 text-n-600'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eligibility.map((e) => (
                  <tr key={e.id} data-testid={'eligibility-' + e.id}>
                    <th scope='row' className='border-b-hair border-n-200 py-4 pr-6 text-body-m text-ink'>
                      {e.level}
                    </th>
                    <td className='border-b-hair border-n-200 py-4 pr-6 text-body-s text-n-600'>
                      {e.requirement}
                    </td>
                    <td className='u-label tnum border-b-hair border-n-200 py-4 pr-6 text-n-600'>{e.intake}</td>
                    <td className='tnum border-b-hair border-n-200 py-4 pr-6 text-body-m text-ink'>
                      {e.admissionFee ? formatNpr(e.admissionFee) : 'On request'}
                    </td>
                    <td className='tnum border-b-hair border-n-200 py-4 pr-6 text-body-m text-ink'>
                      {e.monthly ? formatNpr(e.monthly) : 'On request'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-24'>
            <FeeEstimator />
          </div>
        </Container>
      </Section>

      <Section testId='courses-results' className='bg-n-50'>
        <Container>
          <ResultsChart />
        </Container>
      </Section>

      <section className='w-full bg-brand py-24' aria-labelledby='courses-cta'>
        <Container>
          <div className='grid gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-7'>
              <Statement id='courses-cta' as='h2' lines={['CHOOSE THE', 'LEVEL. WE WILL', 'DO THE REST.']} tone='paper' />
            </div>
            <div className='flex flex-col gap-6 lg:col-span-5'>
              <p className='max-w-measure text-body-m text-paper/85'>
                Admission enquiries are answered by the admissions officer within two working days.
                Bring the last marksheet and a transfer certificate if the student is moving school.
              </p>
              <Button className='w-fit' testId='courses-cta-button'>
                Enquire about admission
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
