/**
 * Motion tokens. Seven primitives, four durations, three easings.
 * Anything animating in this codebase reads its numbers from here.
 */

export const duration = {
  micro: 120,
  standard: 240,
  entrance: 420,
  sheet: 640,
  /** Notice ticker: hold then slide. */
  tickerHold: 5000,
  tickerSlide: 400,
  /** ledgerCount one-shot count-up. */
  ledger: 900,
  /** ledgerCount tween mode, used by the fee estimator. */
  ledgerTween: 250,
  /** Memory game tile flip and mismatch hold. */
  flip: 240,
  mismatch: 700,
  /** Confirmatory bus-route line draw. */
  routeDraw: 640,
} as const;

export const easing = {
  /** Entrances and sheets. */
  entrance: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** State changes. */
  state: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const;

export const easingCss = {
  entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
  state: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
} as const;

/** The only spring in the codebase. magneticHover, and nothing else. */
export const magneticSpring = { stiffness: 220, damping: 26, mass: 0.6 } as const;

/** Magnitudes referenced by the seven primitives. */
export const motionScale = {
  /** frameSequence: each frame scales across its own active window. */
  frameZoomFrom: 1,
  frameZoomTo: 1.04,
  /** sheetRise: pinned backdrop scale and the dimming overlay's peak opacity. */
  backdropZoomTo: 1.06,
  backdropDim: 0.18,
  /** cardStack. */
  stackOffset: 24,
  stackScale: 0.96,
  stackOpacity: 0.45,
  /** revealUp. */
  revealY: 24,
  revealStagger: 60,
  revealMaxSteps: 5,
  revealThreshold: 0.2,
  /** railFill stroke. */
  railWidth: 2,
  /** magneticHover travel, in px. */
  magnetic: 4,
  /** Campus-plan block lift, in px. */
  planLift: 6,
  /** Sidebar label shift on hover, in px. */
  labelShift: 6,
  /** Tertiary-link arrow shift, in px. */
  arrowShift: 3,
  /** Primary button active scale. */
  press: 0.98,
} as const;

export const motionPrimitives = [
  'frameSequence',
  'sheetRise',
  'cardStack',
  'revealUp',
  'railFill',
  'ledgerCount',
  'magneticHover',
] as const;

export type MotionPrimitive = (typeof motionPrimitives)[number];
