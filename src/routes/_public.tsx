import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { PageShell } from '#/templates/modern/components/layout/PageShell';

/**
 * The shared public layout. Every top-level public route (/, /about, /courses,
 * /facilities, /gallery, /calendar, /contact) nests under this pathless route
 * so the sidebar, notice ticker and footer are rendered once from here instead
 * of being imported per page.
 *
 * The landing page uses `variant="overlay"` — its hero bleeds the full width
 * and the sidebar floats on top — every other public page uses the default
 * frame, which offsets the content column by the sidebar's width.
 */
export const Route = createFileRoute('/_public')({
  component: PublicLayoutRoute,
});

function PublicLayoutRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <PageShell variant={pathname === '/' ? 'overlay' : 'default'}>
      <Outlet />
    </PageShell>
  );
}