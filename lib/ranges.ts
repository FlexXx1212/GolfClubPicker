import { Club, DistanceRange } from './types';
import { getEffectiveTotal } from './rollout';

/**
 * Builds a sorted distance range table from the bag's clubs.
 * Boundaries are set at midpoints between adjacent club carry distances.
 * Returns ranges sorted by carry descending.
 */
export function buildRanges(clubs: Club[]): DistanceRange[] {
  if (clubs.length === 0) return [];

  const sorted = [...clubs].sort((a, b) => b.carry - a.carry);

  return sorted.map((club, i) => {
    const prev = sorted[i - 1]; // longer club
    const next = sorted[i + 1]; // shorter club

    const maxDist = prev
      ? Math.floor((club.carry + prev.carry) / 2)
      : club.carry + 30; // top cap above the longest club

    const minDist = next
      ? Math.floor((club.carry + next.carry) / 2) + 1
      : 0; // bottom of range reaches 0

    return {
      club,
      minDist,
      maxDist,
      effectiveTotal: getEffectiveTotal(club),
    };
  });
}

/**
 * Finds the best matching range for a target distance.
 */
export function findRangeForDistance(
  ranges: DistanceRange[],
  targetDistance: number
): DistanceRange | null {
  if (ranges.length === 0) return null;

  // Exact range match
  const exact = ranges.find(
    (r) => targetDistance >= r.minDist && targetDistance <= r.maxDist
  );
  if (exact) return exact;

  // Closest carry match as fallback
  return ranges.reduce((best, r) =>
    Math.abs(r.club.carry - targetDistance) <
    Math.abs(best.club.carry - targetDistance)
      ? r
      : best
  );
}
