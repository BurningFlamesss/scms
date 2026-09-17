/**
 * Colour tokens — the ONLY place a hex value may appear in this codebase.
 * Red, Yellow, Black, White colour scheme.
 * Roles and restrictions are enforced by /styleguide, which measures every
 * ratio at runtime from these values rather than quoting them from a doc.
 */

export const color = {
  /** Red - Primary action color, errors, focus rings */
  red: '#DC2626',
  /** Darker red for hover states */
  redDark: '#B91C1C',
  /** Light red for backgrounds */
  redLight: '#FEF2F2',
  /** Yellow - Accent color, highlights, selection */
  yellow: '#EAB308',
  /** Darker yellow for hover states */
  yellowDark: '#F59E0B',
  /** Light yellow for backgrounds */
  yellowLight: '#FEFCE8',
  /** Black - Primary text, borders, high contrast elements */
  black: '#000000',
  /** White - Backgrounds, surfaces, text on dark */
  white: '#FFFFFF',

  /* Neutral gray ramp for borders, muted text, surfaces */
  /** Near-white surface */
  gray50: '#FAFAFA',
  /** Light surface */
  gray100: '#F5F5F5',
  /** Default border, subtle separators */
  gray200: '#E5E5E5',
  /** Stronger borders, input borders */
  gray300: '#D4D4D4',
  /** Disabled elements, placeholder text */
  gray400: '#A3A3A3',
  /** Muted text, secondary information */
  gray500: '#737373',
  /** Body text alternative */
  gray600: '#525252',
  /** Stronger text */
  gray700: '#404040',
  /** Near-black text */
  gray800: '#262626',
  /** Almost black */
  gray900: '#171717',
} as const;

export type ColorToken = keyof typeof color;

/** Declared role for each token, rendered on /styleguide beside the measured ratio. */
export const colorRoles: Record<ColorToken, string> = {
  red: 'Primary — buttons, links, focus rings, errors',
  redDark: 'Primary hover — buttons, links',
  redLight: 'Surface — error backgrounds, badges',
  yellow: 'Accent — highlights, selection, warnings',
  yellowDark: 'Accent hover — interactive elements',
  yellowLight: 'Surface — warning backgrounds, badges',
  black: 'Ink — primary text, headings, high contrast borders',
  white: 'Surface — backgrounds, cards, text on dark',
  gray50: 'Surface — page background, subtle cards',
  gray100: 'Surface — card backgrounds, hover states',
  gray200: 'Border — default borders, dividers, separators',
  gray300: 'Border — input borders, card outlines, stronger dividers',
  gray400: 'Muted — disabled text, placeholders, decorative marks',
  gray500: 'Muted — secondary text, metadata, captions',
  gray600: 'Text — body copy alternative, labels',
  gray700: 'Text — stronger body copy, form labels',
  gray800: 'Text — headings alternative, emphasis',
  gray900: 'Text — primary headings, maximum contrast',
};

/** Pairs the styleguide measures and grades. */
export const contrastPairs: Array<{ fg: ColorToken; bg: ColorToken; use: string; min: number }> = [
  { fg: 'white', bg: 'red', use: 'Primary button text', min: 4.5 },
  { fg: 'black', bg: 'yellow', use: 'Accent button text, warning badges', min: 4.5 },
  { fg: 'black', bg: 'white', use: 'Body copy on white', min: 4.5 },
  { fg: 'white', bg: 'black', use: 'Body copy on dark', min: 4.5 },
  { fg: 'gray700', bg: 'white', use: 'Muted text on white', min: 4.5 },
  { fg: 'gray300', bg: 'black', use: 'Muted text on dark', min: 4.5 },
  { fg: 'gray500', bg: 'white', use: 'Disabled text on white', min: 3 },
  { fg: 'gray400', bg: 'black', use: 'Disabled text on dark', min: 3 },
  { fg: 'gray300', bg: 'white', use: 'Input border on white', min: 3 },
  { fg: 'gray600', bg: 'black', use: 'Input border on dark', min: 3 },
  { fg: 'gray200', bg: 'white', use: 'Hairline divider on white', min: 1 },
  { fg: 'gray700', bg: 'black', use: 'Hairline divider on dark', min: 1 },
  { fg: 'black', bg: 'gray100', use: 'Text on card surface', min: 4.5 },
  { fg: 'white', bg: 'gray800', use: 'Text on dark card', min: 4.5 },
];
