import { fallbackSrc, srcSet } from '#/lib/img';
import type { Img } from '#/content/types';

/**
 * AVIF first, WebP fallback, JPEG floor. Explicit intrinsic dimensions always,
 * so a photograph never causes layout shift while it loads.
 */
export function Picture({
  image,
  sizes = '100vw',
  className = '',
  imgClassName = 'h-full w-full object-cover',
  priority = false,
  decorative = false,
}: {
  image: Img;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  return (
    <picture className={className}>
      <source type='image/avif' srcSet={srcSet(image.src, 'avif')} sizes={sizes} />
      <source type='image/webp' srcSet={srcSet(image.src, 'webp')} sizes={sizes} />
      <img
        src={fallbackSrc(image.src, 960)}
        alt={decorative ? '' : image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={imgClassName}
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}
