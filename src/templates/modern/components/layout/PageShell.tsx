import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { layout } from '../tokens';
import { SidebarNav } from './SidebarNav';
import { NoticeTicker } from './NoticeTicker';
import { Footer } from './Footer';
import { SkipLink } from './SkipLink';
import { cn } from '#/lib/utils';

type NavCtx = { collapsed: boolean; setCollapsed: (v: boolean) => void };
const Ctx = createContext<NavCtx>({ collapsed: false, setCollapsed: () => {} });
export const useNav = () => useContext(Ctx);

/**
 * The single page frame. `variant="overlay"` is used by the landing page, where
 * the hero bleeds the full width and the sidebar sits on top of it; the ticker
 * is then docked into the white sheet rather than rendered here.
 */
export function PageShell({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'overlay';
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-w',
      collapsed ? layout.navRail : layout.navWidth,
    );
  }, [collapsed]);

  return (
    <Ctx.Provider value={{ collapsed, setCollapsed }}>
      <SkipLink />
      <SidebarNav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn('min-h-svh pt-topbar lg:pt-0', variant === 'default' && 'lg:pl-[var(--nav-w)]')}>
        {variant === 'default' ? (
          <div className='u-container'>
            <NoticeTicker />
          </div>
        ) : null}
        <main id='main' tabIndex={-1} className='outline-none'>
          {children}
        </main>
        <Footer />
      </div>
    </Ctx.Provider>
  );
}

/** Standard content container. Reserves the fixed sidebar's width on desktop. */
export function Container({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'article';
}) {
  return <Tag className={'u-container ' + className}>{children}</Tag>;
}

/** Vertical rhythm between major sections: 80px mobile, 128px desktop. */
export function Section({
  children,
  className = '',
  id,
  labelledBy,
  testId,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  testId?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-testid={testId}
      className={'py-section lg:py-section-lg ' + className}
    >
      {children}
    </section>
  );
}
