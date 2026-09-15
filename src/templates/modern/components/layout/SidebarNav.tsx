import { useEffect, useRef, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Menu, X, LogIn } from 'lucide-react';
import { duration, easing } from '../tokens';
import { school } from '#/content/school';
import { useSchoolContent } from '#/packages/school/hook.tsx';
import { cn } from '#/lib/utils';
import { Crest } from './Crest';

type NavItem = {
  /** Either an in-app route (`to`) or an in-page anchor (`href`), never both. */
  to?: string;
  href?: string;
  label: string;
  index: string;
  children?: Array<{ to: string; hash?: string; label: string }>;
};

const NAV: NavItem[] = [
  {
    to: '/about',
    label: 'About Everest',
    index: '01',
    children: [
      { to: '/about', label: 'Our history' },
      { to: '/about', label: 'The crest' },
      { to: '/about', label: 'Leadership' },
      { to: '/about', label: 'Mission and values' },
    ],
  },
  { to: '/courses', label: 'Courses', index: '02' },
  { to: '/facilities', label: 'Facilities', index: '03' },
  { to: '/gallery', label: 'Gallery', index: '04' },
  { to: '/calendar', label: 'Calendar', index: '05' },
  // There is no contact page; this jumps to the footer contact block instead.
  { href: '#contact', label: 'Contact', index: '06' },
];

const crestTone = { line: 'var(--c-white)', solid: 'var(--c-yellow)', onSolid: 'var(--c-black)' };

function NavLinks({
  collapsed,
  onNavigate,
  pathname,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  pathname: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);
  const reduced = useReducedMotion();

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = (i + dir + NAV.length) % NAV.length;
    refs.current[next]?.focus();
  };

  return (
    <ul className='flex flex-col'>
      {NAV.map((item, i) => {
        const active = Boolean(item.to) && (pathname === item.to || pathname.startsWith(item.to + '/'));
        const expanded = open === item.label;
        const innerLabel = (
          <>
            <span className='u-label shrink-0 text-primary-foreground/75'>{item.index}</span>
            {collapsed ? (
              <span
                className='u-label whitespace-nowrap text-primary-foreground'
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {item.label}
              </span>
            ) : (
              <span className='relative inline-block text-body-l text-primary-foreground transition-transform duration-standard ease-state group-hover:translate-x-[6px]'>
                {item.label}
                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute -bottom-1 left-0 h-rule w-full origin-left bg-accent transition-transform duration-standard ease-state',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </span>
            )}
          </>
        );
        const linkCls = cn(
          'group flex flex-1 items-center gap-4 py-3 text-primary-foreground',
          collapsed ? 'justify-center px-2' : 'px-6',
        );
        const testId = 'nav-link-' + item.label.toLowerCase().replace(/\s+/g, '-');
        const captureRef = (el: HTMLAnchorElement | null) => {
          refs.current[i] = el;
        };

        return (
          <li key={item.label} className='flex flex-col'>
            <div className='flex items-stretch'>
              {item.href ? (
                <a
                  href={item.href}
                  ref={captureRef}
                  onClick={onNavigate}
                  onKeyDown={(e) => onKey(e, i)}
                  data-testid={testId}
                  className={linkCls}
                >
                  {innerLabel}
                </a>
              ) : (
                <Link
                  to={item.to}
                  ref={captureRef as never}
                  onClick={onNavigate}
                  onKeyDown={(e) => onKey(e, i)}
                  tabIndex={0}
                  aria-current={active ? 'page' : undefined}
                  data-testid={testId}
                  className={linkCls}
                >
                  {innerLabel}
                </Link>
              )}
              {item.children && !collapsed ? (
                <button
                  type='button'
                  onClick={() => setOpen(expanded ? null : item.label)}
                  aria-expanded={expanded}
                  aria-label={(expanded ? 'Collapse' : 'Expand') + ' the ' + item.label + ' submenu'}
                  data-testid='nav-submenu-toggle'
                  className='inline-flex w-tap items-center justify-center text-primary-foreground/70 hover:text-primary-foreground'
                >
                  <ChevronDown
                    aria-hidden='true'
                    size={16}
                    className={cn('transition-transform duration-standard ease-state', expanded && 'rotate-180')}
                  />
                </button>
              ) : null}
            </div>

            {/* Expands in place, pushing siblings down. Never an overlay flyout. */}
            <AnimatePresence initial={false}>
              {item.children && expanded && !collapsed ? (
                <motion.ul
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: duration.standard / 1000, ease: easing.state }}
                  className='overflow-hidden'
                  data-testid='nav-submenu'
                >
                  {item.children.map((c) => (
                    <li key={c.label}>
                      <Link
                        to={c.to}
                        onClick={onNavigate}
                        className='u-label block py-2 pl-16 pr-6 text-primary-foreground/70 hover:text-primary-foreground'
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

function Wordmark({ collapsed }: { collapsed: boolean }) {
  const { sidebar } = useSchoolContent();
  const logo = sidebar?.logo;
  return (
    <Link
      to='/'
      className={cn('flex min-w-0 items-center gap-4 py-6', collapsed ? 'justify-center px-2' : 'px-6')}
      data-testid='nav-home'
    >
      {logo ? (
        <img
          src={logo}
          alt=''
          className={cn(
            'shrink-0 rounded-r-ui bg-white object-contain p-1',
            collapsed ? 'h-10 w-10' : 'h-12 w-12',
          )}
        />
      ) : (
        <Crest size={collapsed ? 36 : 48} tone={crestTone} />
      )}
      {collapsed ? null : (
        <span className='flex min-w-0 flex-col leading-none'>
          {school.wordmark.map((w, i) => (
            <span
              key={w}
              className={cn('u-display whitespace-nowrap text-primary-foreground', i === 0 ? 'text-[22px]' : 'text-[11px] tracking-[0.08em]')}
            >
              {w}
            </span>
          ))}
          <span className='u-ne mt-2 text-[11px] text-primary-foreground/70'>माध्यमिक विद्यालय, पोखरा</span>
        </span>
      )}
    </Link>
  );
}

function TaglineStrip({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return <div className='h-2 bg-accent' aria-hidden='true' />;
  const { sidebar } = useSchoolContent();
  const tagline = sidebar?.tagline || school.tagline.placeholder;
  return (
    <div className='bg-accent px-6 py-3' data-testid='nav-tagline'>
      <p className='u-label truncate text-black'>{tagline}</p>
    </div>
  );
}

function PortalBlock({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to='/login'
      onClick={onNavigate}
      data-testid='nav-login'
      className={cn(
        'flex items-center gap-3 bg-accent text-black transition-colors duration-micro ease-state hover:bg-yellow-dark',
        collapsed ? 'justify-center px-2 py-4' : 'px-6 py-6',
      )}
    >
      <LogIn aria-hidden='true' size={16} />
      {collapsed ? (
        <span className='sr-only'>Activate your portal account</span>
      ) : (
        <span className='flex flex-col'>
          <span className='u-label'>Portal</span>
          <span className='text-body-m'>Activate your account</span>
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { sidebar } = useSchoolContent();
  const logo = sidebar?.logo;
  const [sheetOpen, setSheetOpen] = useState(false);
  // Two distinct triggers: one collapses the desktop rail, one opens the mobile
  // sheet. They must not share a ref or the second mount clobbers the first.
  const collapseRef = useRef<HTMLButtonElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false);
        sheetTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  return (
    <>
      {/* Desktop panel */}
      <nav
        aria-label='Main'
        id='sidebar-nav-desktop'
        data-testid='sidebar-nav'
        className='fixed inset-y-0 left-0 z-nav hidden w-nav flex-col overflow-hidden bg-primary transition-[width] duration-standard ease-state lg:flex'
      >
        <div className='flex w-full items-start justify-between gap-2'>
          <Wordmark collapsed={collapsed} />
          <button
            ref={collapseRef}
            type='button'
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-controls='sidebar-nav-desktop'
            aria-label={collapsed ? 'Open the navigation panel' : 'Close the navigation panel'}
            data-testid='nav-collapse-toggle'
            className='mr-3 mt-[18px] inline-flex h-tap w-tap shrink-0 items-center justify-center self-start rounded-ui text-primary-foreground/70 transition-colors duration-micro ease-state hover:bg-white/10 hover:text-primary-foreground'
          >
            {collapsed ? (
              <Menu aria-hidden='true' size={20} />
            ) : (
              <X aria-hidden='true' size={20} />
            )}
          </button>
        </div>
        <TaglineStrip collapsed={collapsed} />
        <div className='mt-6 flex-1 overflow-y-auto u-no-scrollbar'>
          <NavLinks collapsed={collapsed} pathname={pathname} />
        </div>
        <PortalBlock collapsed={collapsed} />
      </nav>

      {/* Mobile top bar */}
      <div className='fixed inset-x-0 top-0 z-nav flex h-topbar items-center justify-between bg-primary px-4 lg:hidden'>
        <Link to='/' className='flex min-w-0 items-center gap-3' data-testid='nav-home-mobile'>
          {logo ? (
            <img src={logo} alt='' className='h-8 w-8 shrink-0 rounded-md bg-white object-contain p-0.5' />
          ) : (
            <Crest size={28} tone={crestTone} />
          )}
          <span className='u-display truncate text-[15px] text-primary-foreground'>
            {school.shortEn ?? school.nameEn}
          </span>
        </Link>
        <button
          ref={sheetTriggerRef}
          type='button'
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls='sidebar-nav-panel'
          data-testid='nav-mobile-trigger'
          className='inline-flex h-tap w-tap items-center justify-center rounded-ui text-primary-foreground'
        >
          <Menu aria-hidden='true' size={20} />
          <span className='sr-only'>Open the main menu</span>
        </button>
      </div>

      {/* Mobile sheet: full height, bottom anchored, login always visible */}
      <AnimatePresence>
        {sheetOpen ? (
          <motion.div
            className='fixed inset-0 z-overlay lg:hidden'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.standard / 1000 }}
          >
            {/* Native button so the scrim is reachable by keyboard and screen readers. */}
            <button
              type='button'
              tabIndex={-1}
              aria-label='Close the main menu'
              data-testid='nav-mobile-scrim'
              className='absolute inset-0 bg-black/60'
              onClick={() => {
                setSheetOpen(false);
                sheetTriggerRef.current?.focus();
              }}
            />
            <motion.nav
              aria-label='Main'
              id='sidebar-nav-panel'
              data-testid='nav-mobile-sheet'
              className='absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-lip bg-primary'
              initial={reduced ? { opacity: 0 } : { y: '100%' }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: duration.sheet / 1000, ease: easing.entrance }}
            >
              <div className='flex items-center justify-between'>
                <Wordmark collapsed={false} />
                <button
                  type='button'
                  onClick={() => {
                    setSheetOpen(false);
                    sheetTriggerRef.current?.focus();
                  }}
                  data-testid='nav-mobile-close'
                  className='mr-4 inline-flex h-tap w-tap items-center justify-center rounded-ui text-primary-foreground'
                >
                  <X aria-hidden='true' size={20} />
                  <span className='sr-only'>Close the main menu</span>
                </button>
              </div>
              <TaglineStrip collapsed={false} />
              <div className='flex-1 overflow-y-auto py-6'>
                <NavLinks collapsed={false} pathname={pathname} onNavigate={() => setSheetOpen(false)} />
              </div>
              <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <PortalBlock collapsed={false} onNavigate={() => setSheetOpen(false)} />
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}