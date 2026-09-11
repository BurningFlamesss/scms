/**
 * Typography tokens. Three Latin faces: Inter, Manrope, Playfair Display.
 * Weights: Regular (400) and Medium (500) only.
 * Every clamp() below is computed for a 360px → 1440px range.
 */

export const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  label: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
} as const;

type Step = {
  size: string;
  leading: string;
  tracking: string;
  face: keyof typeof font;
  weight: keyof typeof fontWeight;
  min: number;
  max: number;
};

export const typeScale = {
  'display-xl': {
    size: 'clamp(38px, 6.667px + 8.704vw, 132px)',
    leading: '0.92',
    tracking: '-0.02em',
    face: 'display',
    weight: 'medium',
    min: 38,
    max: 132,
  },
  'display-l': {
    size: 'clamp(32px, 17.333px + 4.074vw, 76px)',
    leading: '0.94',
    tracking: '-0.02em',
    face: 'display',
    weight: 'medium',
    min: 32,
    max: 76,
  },
  'display-m': {
    size: 'clamp(24px, 18.667px + 1.481vw, 40px)',
    leading: '1',
    tracking: '-0.015em',
    face: 'display',
    weight: 'medium',
    min: 24,
    max: 40,
  },
  'body-l': {
    size: 'clamp(17px, 16px + 0.278vw, 20px)',
    leading: '1.6',
    tracking: '0em',
    face: 'body',
    weight: 'regular',
    min: 17,
    max: 20,
  },
  'body-m': {
    size: 'clamp(16px, 15.667px + 0.093vw, 17px)',
    leading: '1.6',
    tracking: '0em',
    face: 'body',
    weight: 'regular',
    min: 16,
    max: 17,
  },
  'body-s': {
    size: '14px',
    leading: '1.5',
    tracking: '0em',
    face: 'body',
    weight: 'regular',
    min: 14,
    max: 14,
  },
  label: {
    size: 'clamp(11px, 10.667px + 0.093vw, 12px)',
    leading: '1.2',
    tracking: '0.12em',
    face: 'label',
    weight: 'medium',
    min: 11,
    max: 12,
  },
} satisfies Record<string, Step>;

export type TypeStep = keyof typeof typeScale;

/** Body copy never exceeds this measure. */
export const measure = { max: '68ch', narrow: '46ch' } as const;
