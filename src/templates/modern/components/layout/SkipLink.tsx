export function SkipLink() {
  return (
    <a
      href='#main'
      data-testid='skip-link'
      className='sr-only rounded-ui bg-action px-6 py-3 font-label text-label uppercase tracking-[0.12em] text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-overlay'
    >
      Skip to content
    </a>
  );
}
