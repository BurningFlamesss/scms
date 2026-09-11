import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../Button';
import { RailFill } from '../motion';
import { Eyebrow, WidgetCaption } from '../Text';
import { duration, easing } from '../tokens';
import { quizQuestions } from '#/content/courses';
import { scoreQuiz, STREAM_NAMES } from '#/lib/quiz';
import type { QuizStreamId } from '#/content/types';

/**
 * SIGNATURE INTERACTION - Courses
 * Stream chooser. Guidance, not a personality quiz: six plain questions, one at
 * a time, then a ranked result that shows WHICH answers pushed each stream up.
 * Answers live in component state and are never stored or transmitted.
 */
export function StreamChooser({
  onHandoff,
  onSeeAll,
}: {
  onHandoff: (top: [QuizStreamId, QuizStreamId]) => void;
  onSeeAll: () => void;
}) {
  const reduced = Boolean(useReducedMotion());
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionRefs = useRef<Array<HTMLInputElement | null>>([]);

  const q = quizQuestions[step];
  const result = scoreQuiz(answers);
  const progress = done ? 1 : step / quizQuestions.length;

  const advance = () => {
    if (step + 1 < quizQuestions.length) {
      setStep(step + 1);
      window.setTimeout(() => headingRef.current?.focus(), 60);
    } else {
      setDone(true);
    }
  };

  const anim = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  return (
    <div className='flex flex-col gap-8' data-testid='stream-chooser' id='stream-chooser'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Which stream</Eyebrow>
        <WidgetCaption>
          Six questions. The result shows all three streams and why each one ranked where it did.
        </WidgetCaption>
      </div>

      <div className='flex items-center gap-4 border-y border-border py-4'>
        <span className='u-label tnum shrink-0 text-accent' data-testid='chooser-progress-label'>
          {done ? 'RESULT' : String(step + 1).padStart(2, '0') + ' / ' + String(quizQuestions.length).padStart(2, '0')}
        </span>
        <RailFill
          progress={progress}
          orientation='horizontal'
          label={'Question ' + (step + 1) + ' of ' + quizQuestions.length}
        />
      </div>

      {!done ? (
        <AnimatePresence mode='wait'>
          <motion.fieldset
            key={q.id}
            {...anim}
            transition={{ duration: (reduced ? 120 : duration.standard) / 1000, ease: easing.state }}
            className='flex flex-col gap-6'
          >
            <legend className='contents'>
              <h3
                ref={headingRef}
                tabIndex={-1}
                className='u-display max-w-measure text-display-m text-foreground outline-none'
                data-testid='chooser-question'
              >
                {q.prompt}
              </h3>
            </legend>

            <div role='radiogroup' aria-label={q.prompt} className='flex flex-col'>
              {q.options.map((o, i) => {
                const checked = answers[q.id] === o.id;
                return (
                  <label
                    key={o.id}
                    className={
                      'flex cursor-pointer items-center gap-4 border-t border-border py-4 last:border-b ' +
                      (checked ? 'text-foreground' : 'text-muted-foreground')
                    }
                    data-testid={'chooser-option-' + o.id}
                  >
                    <input
                      ref={(el) => {
                        optionRefs.current[i] = el;
                      }}
                      type='radio'
                      name={q.id}
                      value={o.id}
                      checked={checked}
                      onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                          e.preventDefault();
                          const n = (i + 1) % q.options.length;
                          setAnswers({ ...answers, [q.id]: q.options[n].id });
                          optionRefs.current[n]?.focus();
                        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                          e.preventDefault();
                          const n = (i - 1 + q.options.length) % q.options.length;
                          setAnswers({ ...answers, [q.id]: q.options[n].id });
                          optionRefs.current[n]?.focus();
                        }
                      }}
                      className='h-4 w-4 shrink-0 accent-[var(--c-yellow)]'
                    />
                    <span className='u-label tnum w-6 shrink-0 text-accent'>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className='text-body-l'>{o.label}</span>
                  </label>
                );
              })}
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <Button
                variant='secondary'
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                testId='chooser-back'
              >
                <ArrowLeft aria-hidden='true' size={14} />
                Back
              </Button>
              <Button onClick={advance} disabled={!answers[q.id]} testId='chooser-next'>
                {step + 1 === quizQuestions.length ? 'See the result' : 'Next question'}
                <ArrowRight aria-hidden='true' size={14} />
              </Button>
              <Button variant='ghost' onClick={restart} testId='chooser-restart'>
                <RotateCcw aria-hidden='true' size={14} />
                Start again
              </Button>
            </div>
          </motion.fieldset>
        </AnimatePresence>
      ) : (
        <div className='flex flex-col gap-8' data-testid='chooser-result'>
          <h3 className='u-display max-w-measure text-display-m text-foreground'>
            All three, ranked — and the answers behind each one
          </h3>

          <ol className='flex flex-col'>
            {result.ranked.map((r, i) => (
              <li key={r.streamId} className='border-t border-border py-6 last:border-b'>
                <div className='flex flex-wrap items-baseline gap-4'>
                  <span className='u-label tnum text-accent'>{String(i + 1).padStart(2, '0')}</span>
                  <h4 className='u-display text-display-m text-foreground'>{STREAM_NAMES[r.streamId]}</h4>
                  <span className='u-label tnum text-muted-foreground' data-testid={'chooser-score-' + r.streamId}>
                    {r.score} points · {r.share}%
                  </span>
                </div>
                <div className='mt-3 h-2 w-full bg-muted'>
                  <div
                    className={i === 0 ? 'h-2 bg-accent' : 'h-2 bg-border'}
                    style={{ width: Math.max(2, r.share) + '%' }}
                    aria-hidden='true'
                  />
                </div>
                {r.reasons.length ? (
                  <ul className='mt-4 flex flex-col gap-2'>
                    {r.reasons.slice(0, 3).map((why) => (
                      <li key={why.questionId} className='max-w-measure text-body-s text-muted-foreground'>
                        <span className='u-label text-muted-foreground'>+{why.weight}</span> {why.answer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='mt-4 text-body-s text-muted-foreground'>
                    None of your answers pointed here.
                  </p>
                )}
              </li>
            ))}
          </ol>

          <div className='flex flex-wrap items-center gap-3'>
            <Button
              onClick={() => onHandoff([result.ranked[0].streamId, result.ranked[1].streamId])}
              testId='chooser-handoff'
            >
              Compare {STREAM_NAMES[result.ranked[0].streamId]} and{' '}
              {STREAM_NAMES[result.ranked[1].streamId]}
              <ArrowRight aria-hidden='true' size={14} />
            </Button>
            <Button variant='secondary' onClick={onSeeAll} testId='chooser-see-all'>
              See all three streams in full
            </Button>
            <Button variant='ghost' onClick={restart} testId='chooser-restart-result'>
              <RotateCcw aria-hidden='true' size={14} />
              Start again
            </Button>
          </div>
        </div>
      )}

      <p className='u-label text-muted-foreground' data-testid='chooser-privacy'>
        Your answers stay in this browser tab. Nothing is saved or sent anywhere.
      </p>
    </div>
  );
}