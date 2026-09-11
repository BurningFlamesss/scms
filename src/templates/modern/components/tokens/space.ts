/**
 * Space, radii, elevation and layout tokens.
 * The spacing scale is deliberately closed: 4, 8, 12, 16, 24, 32, 48, 64, 96,
 * 128, 192. Tailwind's default scale is replaced by exactly these steps so an
 * out-of-scale value cannot be written by accident.
 */

export const space = {
  0: '0px',
  px: '1px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
  24: '96px',
  32: '128px',
  48: '192px',
} as const;

/** The eleven authored steps, in order, for the /styleguide ruler. */
export const spaceSteps = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const;

export const radius = {
  none: '0px',
  ui: '12px',
  card: '20px',
  lip: '40px',
  pill: '999px',
} as const;

/** Exactly two shadows. Nothing else casts one. */
export const shadow = {
  low: '0 8px 28px -12px rgba(23, 18, 15, 0.22)',
  high: '0 -28px 72px -28px rgba(23, 18, 15, 0.30)',
} as const;

export const layout = {
  navWidth: '320px',
  navRail: '72px',
  topBar: '56px',
  pagePadDesktop: '88px',
  pagePadMobile: '20px',
  maxContent: '1200px',
  gutter: '24px',
  ticker: '44px',
  hairline: '1px',
  hairlineContrast: '2px',
  rule: '2px',
  tap: '44px',
  sectionDesktop: '128px',
  sectionMobile: '80px',
  /** Scroll runway, in vh, that the pinned hero holds while its frames advance. */
  heroRunwayVh: 200,
  /** Scroll runway, in vh, allotted to each card in a pinned stack. */
  cardStackVh: 85,
} as const;
