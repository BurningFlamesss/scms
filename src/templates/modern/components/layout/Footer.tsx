import { Link } from '@tanstack/react-router';
import { school } from '#/content/school';
import { useKathmanduNow, toMinutes } from '#/lib/hooks';
import { Crest } from './Crest';
import { cn } from '#/lib/utils';

const crestTone = { line: 'var(--c-white)', solid: 'var(--c-yellow)', onSolid: 'var(--c-black)' };

export function useOpenState() {
  const now = useKathmanduNow();
  const today = school.hours.find((h) => h.weekday === now.weekday)!;
  const open =
    today.open !== null &&
    today.close !== null &&
    now.minutes >= toMinutes(today.open) &&
    now.minutes < toMinutes(today.close);
  return { now, today, open };
}

/** Never colour alone: the indicator always carries the words OPEN or CLOSED. */
export function OpenIndicator({ className, testId = 'open-indicator' }: { className?: string; testId?: string }) {
  const { now, today, open } = useOpenState();
  return (
    <p className={cn('u-label inline-flex items-center gap-2', className)} data-testid={testId}>
      <span
        aria-hidden='true'
        className={cn('inline-block h-2 w-2 rounded-pill', open ? 'bg-yellow' : 'bg-current opacity-40')}
      />
      <span>{open ? 'Open now' : 'Closed now'}</span>
      <span className='opacity-70'>
        · {today.open ? today.name + ' ' + today.open + '–' + today.close : today.name + ' closed'} · NPT{' '}
        {now.timeLabel}
      </span>
    </p>
  );
}

export function Footer() {
  const { open } = useOpenState();
  return (
    <footer className='w-full bg-black text-white' data-testid='footer'>
      <div className='u-container py-16'>
        <div className='grid gap-12 md:grid-cols-2 lg:grid-cols-4'>
          <div className='flex flex-col gap-4'>
            <Crest size={56} tone={crestTone} />
            <p className='u-ne text-body-m text-white'>{school.nameNe}</p>
            <p className='u-label text-white/80'>{school.nameEn}</p>
            <p className='u-label text-white/70'>
              {school.address.line1}, {school.address.line2}
              <br />
              {school.address.district} — {school.address.postal}
            </p>
          </div>

          <nav aria-label='Footer' className='flex flex-col gap-3'>
            <p className='u-label text-yellow'>Quick links</p>
            {[
              ['/about', 'About Everest'],
              ['/courses', 'Courses and fees'],
              ['/facilities', 'Facilities and transport'],
              ['/gallery', 'Gallery'],
              ['/calendar', 'Academic calendar'],
              ['/activate', 'Activate portal account'],
            ].map(([to, label]) => (
              <Link key={to} to={to === '/activate' ? '/login' : to} className='u-label w-fit text-white hover:text-yellow transition-colors'>
                {label}
              </Link>
            ))}
            <a
              href='#contact'
              className='u-label w-fit text-white hover:text-yellow transition-colors'
              data-testid='footer-contact-anchor'
            >
              Contact and enquiry
            </a>
          </nav>

          <div className='flex scroll-mt-24 flex-col gap-3' id='contact' data-testid='footer-contact'>
            <h2 className='u-label text-yellow'>Contact</h2>
            {school.phones.map((p) => (
              <a key={p.value} href={p.href} className='u-label w-fit text-white hover:text-yellow transition-colors'>
                {p.label} · {p.value}
              </a>
            ))}
            <a
              href={'mailto:' + school.email}
              className='u-label w-fit text-white hover:text-yellow transition-colors'
            >
              {school.email}
            </a>
            <a
              href={'mailto:' + school.admissionsEmail}
              className='u-label w-fit text-white hover:text-yellow transition-colors'
              data-testid='footer-admissions-email'
            >
              {school.admissionsEmail}
            </a>
            <p className='u-label text-white/70'>{school.admissions.windowLabel}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${school.geo.lat},${school.geo.lng}`}
              target='_blank'
              rel='noreferrer'
              className='u-label w-fit text-white hover:text-yellow transition-colors'
            >
              Get directions ↗
            </a>
          </div>

          <div className='flex flex-col gap-3'>
            <p className='u-label text-yellow'>School hours</p>
            <p className='u-label inline-flex items-center gap-2 text-white'>
              <span
                aria-hidden='true'
                className={cn('inline-block h-2 w-2 rounded-pill', open ? 'bg-yellow' : 'bg-white/40')}
              />
              {open ? 'Open now' : 'Closed now'}
            </p>
            <ul className='flex flex-col'>
              {school.hours.map((h) => (
                <li
                  key={h.name}
                  className='u-label flex justify-between gap-4 border-t border-white/20 py-2 text-white/80'
                >
                  <span>{h.name}</span>
                  <span className='tnum'>{h.open ? h.open + ' – ' + h.close : 'Closed'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-16 border-t border-white/20 pt-6'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <p className='u-label text-white/70'>{school.registrationNo}</p>
            <p className='u-label text-white/70'>
              Site content maintained by the school office · Est. {school.establishedBs} BS ·{' '}
              {school.establishedAd} AD
            </p>
            <p className='u-label text-white/70' data-testid='footer-language'>
              Language: English · <span className='u-ne'>नेपाली</span> coming soon
            </p>
          </div>
        </div>
      </div>

      <div className='border-t border-white/20 py-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <p className='u-label text-red' style={{fontFamily: 'var(--font-display)', fontSize: 'clamp(62px,7vw,110px)', lineHeight: '0.9'}}>
            With Everest
          </p>
        </div>
      </div>
    </footer>
  );
}