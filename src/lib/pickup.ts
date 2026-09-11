import { areaAliases, busRoutes, stopArea } from '../content/facilities';
import type { BusRoute, Stop } from '../content/types';

export type PickupMatch = {
  route: BusRoute;
  stop: Stop;
  areaId: string;
  score: number;
  matchedOnStop: boolean;
};

function norm(s: string): string {
  return String(s).toLowerCase().replace(/[\s\-_.]/g, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function tokenScore(token: string, q: string): number {
  const na = norm(token);
  if (!na) return 0;
  if (na === q) return 1;
  if (na.startsWith(q) || q.startsWith(na)) return 0.9;
  if (na.includes(q)) return 0.75;
  const d = levenshtein(na, q);
  const tol = Math.max(1, Math.floor(Math.max(na.length, q.length) * 0.25));
  return d <= tol ? 0.6 : 0;
}

/**
 * Fuzzy match over ward numbers, area names and landmarks in both English and
 * Nepali. A stop's own name outranks a match on its wider area, so searching
 * “Bagar” surfaces the Bagar stop rather than the first stop on its route.
 * Returns [] for a genuine no-match — which is the most valuable state here.
 */
export function findPickup(query: string): PickupMatch[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const wardMatch = /^(?:ward)?(\d{1,2})$/.exec(q);

  const areaScores = new Map<string, number>();
  for (const a of areaAliases) {
    let best = wardMatch && a.ward === Number(wardMatch[1]) ? 1 : 0;
    for (const alias of a.aliases) best = Math.max(best, tokenScore(alias, q));
    if (best > 0) areaScores.set(a.areaId, best);
  }

  const out: PickupMatch[] = [];
  for (const route of busRoutes) {
    for (const stop of route.stops) {
      const areaId = stopArea[stop.id] ?? '';
      const own = Math.max(
        tokenScore(stop.name, q),
        tokenScore(stop.nameNe ?? '', q),
        tokenScore(stop.landmark, q),
      );
      const viaArea = (areaScores.get(areaId) ?? 0) * 0.95;
      const score = Math.max(own, viaArea);
      if (score > 0) out.push({ route, stop, areaId, score, matchedOnStop: own >= viaArea });
    }
  }
  return out.sort((a, b) => b.score - a.score || a.stop.order - b.stop.order);
}
