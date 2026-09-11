import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { Segmented } from '../Segmented';
import { Eyebrow, WidgetCaption } from '../Text';
import { periods, routines } from '#/content/extras';
import { useKathmanduNow, toMinutes } from '#/lib/hooks';
import { WEEKDAYS_SHORT } from '#/lib/nepaliDate';
import { cn } from '#/lib/utils';

const DAYS = [0, 1, 2, 3, 4, 5];
const teaching = periods.filter((p) => p.kind === 'class');

/**
 * B6.1 - Class routine. The live period highlight is read from Asia/Kathmandu
 * time, which is the whole point; without it this is only a table.
 */
export function RoutineViewer() {
  const now = useKathmanduNow();
  const [id, setId] = useState(routines[0].id);
  const routine = routines.find((r) => r.id === id)!;

  const current = useMemo(() => {
    if (now.weekday === 6) return null;
    const p = periods.find(
      (x) => now.minutes >= toMinutes(x.start) && now.minutes < toMinutes(x.end),
    );
    if (!p) return null;
    return { period: p, dayIndex: now.weekday };
  }, [now]);

  const currentSubject =
    current && current.period.kind === 'class'
      ? routine.week[current.dayIndex]?.[teaching.findIndex((t) => t.id === current.period.id)]
      : null;

  return (
    <div className='flex flex-col gap-8' data-testid='routine-viewer'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Class routine</Eyebrow>
        <WidgetCaption>The period running right now is highlighted, in Nepal time.</WidgetCaption>
      </div>

      <Segmented
        label='Class and section'
        value={id}
        onChange={setId}
        testId='routine-class'
        size='sm'
        options={routines.map((r) => ({ value: r.id, label: r.grade + ' ' + r.section }))}
      />

      <p
        className='u-label inline-flex w-fit items-center gap-2 rounded-ui border-hair border-n-300 px-4 py-3 text-ink'
        data-testid='routine-now'
      >
        <Clock aria-hidden='true' size={14} className='text-accent' />
        {now.weekday === 6
          ? 'Saturday — school is closed. The week runs Sunday to Friday.'
          : current
            ? current.period.kind === 'break'
              ? `${current.period.label} now · ${current.period.start}–${current.period.end} NPT`
              : `Now: ${currentSubject ?? 'Free period'} · ${current.period.label} · ${current.period.start}–${current.period.end} NPT`
            : `No period in progress · ${now.timeLabel} NPT · classes run 07:00 to 14:25`}
      </p>

      <div
        className='overflow-x-auto u-edge-fade'
        tabIndex={0}
        role='region'
        aria-label='Weekly class routine, scrolls horizontally'
        data-testid='routine-table-scroll'
      >
        <table className='w-full min-w-[880px] border-collapse text-left'>
          <caption className='u-label pb-4 text-left text-n-600'>
            Weekly routine for {routine.grade} section {routine.section}, Sunday to Friday
          </caption>
          <thead>
            <tr>
              <th scope='col' className='u-label border-b-rule border-n-300 py-3 pr-4 text-n-600'>
                Day
              </th>
              {teaching.map((p) => (
                <th key={p.id} scope='col' className='u-label border-b-rule border-n-300 py-3 pr-4 text-n-600'>
                  {p.label}
                  <span className='block tnum font-normal'>{p.start}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d) => (
              <tr key={d}>
                <th scope='row' className='u-label border-b-hair border-n-200 py-3 pr-4 text-ink'>
                  {WEEKDAYS_SHORT[d]}
                </th>
                {routine.week[d].map((subject, pi) => {
                  const isNow =
                    current?.dayIndex === d && current.period.id === teaching[pi].id;
                  return (
                    <td
                      key={pi}
                      data-testid={isNow ? 'routine-current-cell' : undefined}
                      className={cn(
                        'border-b-hair border-n-200 py-3 pr-4 text-body-s',
                        isNow ? 'bg-action font-[600] text-ink' : 'text-n-600',
                      )}
                    >
                      {isNow ? <span className='sr-only'>Currently in progress: </span> : null}
                      {subject}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className='flex flex-wrap gap-x-6 gap-y-2'>
        {periods
          .filter((p) => p.kind === 'break')
          .map((p) => (
            <li key={p.id} className='u-label tnum text-n-600'>
              {p.label} {p.start}–{p.end}
            </li>
          ))}
      </ul>
    </div>
  );
}
