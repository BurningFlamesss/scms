// Deterministic pseudo-random helpers so the mock dataset is stable across reloads.
export function createRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export type Rng = () => number;

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function pickMany<T>(rng: Rng, list: readonly T[], count: number): T[] {
  const pool = [...list];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

export function intBetween(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
