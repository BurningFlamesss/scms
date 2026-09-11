/**
 * Geography helpers for the transportation map.
 *
 * The demo school sits at a fixed, plausible campus coordinate. Stops are laid
 * out deterministically around it so the map always renders the same shape for
 * a given route without needing any geocoding service.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Northfield Academy main campus (demo coordinate). */
export const CAMPUS: LatLng = { lat: 42.6526, lng: -73.7562 };

const KM_PER_DEG_LAT = 110.574;

function kmPerDegLng(lat: number): number {
  return 111.32 * Math.cos((lat * Math.PI) / 180);
}

/** Offset a coordinate by a distance (km) along a bearing (radians). */
export function offsetKm(origin: LatLng, distanceKm: number, bearingRad: number): LatLng {
  return {
    lat: origin.lat + (distanceKm * Math.cos(bearingRad)) / KM_PER_DEG_LAT,
    lng: origin.lng + (distanceKm * Math.sin(bearingRad)) / kmPerDegLng(origin.lat),
  };
}

/**
 * Deterministic stop coordinate: each route fans out on its own bearing and
 * stops walk outward from campus with a gentle curve.
 */
export function stopCoordinate(routeIndex: number, stopIndex: number, stopCount: number): LatLng {
  const bearing = (routeIndex / 6) * Math.PI * 2 + 0.35;
  const curve = Math.sin((stopIndex / Math.max(1, stopCount - 1)) * Math.PI) * 0.42;
  const distance = 1.6 + stopIndex * 1.9;
  return offsetKm(CAMPUS, distance, bearing + curve);
}

/** Rough great-circle distance in km — good enough for a mock ETA readout. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = (a.lat - b.lat) * KM_PER_DEG_LAT;
  const dLng = (a.lng - b.lng) * kmPerDegLng((a.lat + b.lat) / 2);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export function boundsOf(points: LatLng[]): [[number, number], [number, number]] | null {
  if (!points.length) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}
