import { busRoutes } from '../content/facilities';
import { feeBands, hostelFees, hostelNotes, transportLabels } from '../content/courses';
import { ACCOUNTS_TEL } from '../content/school';
import type { FeeLine, HostelOption, StreamId, TransportBand } from '../content/types';

export type EstimateInput = {
  levelId: string;
  streamId?: StreamId;
  transport: TransportBand;
  hostel: HostelOption;
};

export type Estimate =
  | {
      priced: true;
      lines: FeeLine[];
      perMonth: number;
      perYear: number;
      termly: number;
      once: number;
    }
  | {
      priced: false;
      reason: 'unpriced-combination';
      contactTel: string;
      lines: [];
      perMonth: null;
      perYear: null;
    };

/**
 * The single source of a transport fare. The bus finder and the fee estimator
 * both call this, so the two can never show different numbers.
 */
export function transportFareForBand(band: TransportBand): number | null {
  if (band === 'none') return 0;
  const route = busRoutes.find((r) => r.band === band);
  return route ? route.monthlyFare : null;
}

export function routeForBand(band: TransportBand) {
  if (band === 'none') return null;
  return busRoutes.find((r) => r.band === band) ?? null;
}

export function estimate({ levelId, streamId, transport, hostel }: EstimateInput): Estimate {
  const band = feeBands.find(
    (b) => b.levelId === levelId && (b.streamId ?? null) === (streamId ?? null),
  );
  const fare = transportFareForBand(transport);
  if (!band || fare === null) {
    return {
      priced: false,
      reason: 'unpriced-combination',
      contactTel: ACCOUNTS_TEL,
      lines: [],
      perMonth: null,
      perYear: null,
    };
  }

  const lines: FeeLine[] = band.lines.map((l) => ({ ...l }));

  if (transport !== 'none') {
    const route = routeForBand(transport)!;
    lines.push({
      id: 'trn',
      label: 'Transport',
      note: `${route.name} · ${transportLabels[transport].toLowerCase()} band`,
      amount: route.monthlyFare,
      cadence: 'monthly',
      sourceRouteId: route.id,
    });
  }

  if (hostel !== 'none') {
    lines.push({
      id: 'hst',
      label: 'Hostel',
      note: hostelNotes[hostel],
      amount: hostelFees[hostel],
      cadence: 'monthly',
    });
  }

  const monthly = lines.filter((l) => l.cadence === 'monthly').reduce((a, l) => a + l.amount, 0);
  const termly = lines.filter((l) => l.cadence === 'termly').reduce((a, l) => a + l.amount, 0);
  const once = lines.filter((l) => l.cadence === 'once').reduce((a, l) => a + l.amount, 0);

  return { priced: true, lines, perMonth: monthly, perYear: monthly * 12 + termly * 3 + once, termly, once };
}

const npr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Nepali convention: lakh grouping, e.g. NPR 1,23,456. */
export function formatNpr(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return `NPR ${npr.format(n)}`;
}

export function formatNprBare(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return npr.format(n);
}

/** One short sentence for the polite live region. Never the whole breakdown. */
export function announceEstimate(e: Estimate): string {
  if (!e.priced) {
    return 'No published fee for this combination. The accounts department number is shown instead.';
  }
  return `Estimated monthly fee, ${npr.format(e.perMonth)} rupees`;
}

export function estimateAsText(e: Estimate, heading: string): string {
  if (!e.priced) {
    return `${heading}\nNo published fee for this combination. Please call accounts on ${e.contactTel}.`;
  }
  const rows = e.lines.map((l) => {
    const cadence = l.cadence === 'once' ? 'one time' : l.cadence === 'termly' ? 'per term' : 'per month';
    return `  ${l.label} (${cadence}): ${formatNpr(l.amount)}`;
  });
  return [
    heading,
    ...rows,
    '',
    `  Per month: ${formatNpr(e.perMonth)}`,
    `  Per year:  ${formatNpr(e.perYear)}`,
    '',
    'Indicative only. Confirmed at admission.',
  ].join('\n');
}
