/**
 * Responsive picture sources.
 * Photographs are served AVIF-first with a WebP fallback and a JPEG floor,
 * at 480 / 960 / 1440 / 1920, with explicit intrinsic dimensions so nothing
 * shifts while they load.
 */

export const IMAGE_WIDTHS = [480, 960, 1440, 1920] as const;

function withParams(src: string, w: number, fm: 'avif' | 'webp' | 'jpg', q = 68): string {
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${w}&q=${q}&fm=${fm}&fit=crop&auto=format`;
}

export function srcSet(src: string, fm: 'avif' | 'webp' | 'jpg'): string {
  return IMAGE_WIDTHS.map((w) => `${withParams(src, w, fm)} ${w}w`).join(', ');
}

export function fallbackSrc(src: string, w = 960): string {
  return withParams(src, w, 'jpg');
}

/** A single AVIF url, used for <link rel=preload> on the hero's first frame. */
export function preloadSrc(src: string, w = 1440): string {
  return withParams(src, w, 'avif');
}
