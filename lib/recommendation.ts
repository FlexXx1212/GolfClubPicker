import { Club, Hazard, Lie, Recommendation } from './types';
import { buildRanges, findRangeForDistance } from './ranges';
import { getEffectiveTotal } from './rollout';

const HAZARD_FRONT_BUFFER = 7;   // meters of safety carry over a front hazard
const LIE_NORMAL_BUFFER  = 3;   // slight buffer for normal lie
const LIE_BAD_CARRY_FACTOR = 0.9; // reduce expected carry by 10%
const LIE_BAD_BUFFER     = 10;  // extra target offset to compensate bad lie

/**
 * Adjusts the target distance based on lie conditions.
 * Returns { adjustedDistance, explanation }
 */
function applyLieAdjustment(
  distance: number,
  lie: Lie
): { adjusted: number; notes: string[] } {
  const notes: string[] = [];

  if (lie === 'good') {
    return { adjusted: distance, notes };
  }

  if (lie === 'normal') {
    notes.push(`Normal lie — added ${LIE_NORMAL_BUFFER}m safety buffer`);
    return { adjusted: distance + LIE_NORMAL_BUFFER, notes };
  }

  // bad lie: reduce expected carry, compensate with longer club
  notes.push(
    `Bad lie — carry reduced ~10%, targeting ${LIE_BAD_BUFFER}m extra`
  );
  return { adjusted: distance + LIE_BAD_BUFFER, notes };
}

/**
 * Selects the best club index from sorted clubs (desc) for a given target,
 * with hazard-specific logic.
 */
function selectClub(
  sorted: Club[],
  adjustedTarget: number,
  hazard: Hazard,
  notes: string[]
): { primaryIdx: number; altIdx: number | null } {
  const ranges = buildRanges(sorted);

  if (hazard === 'front') {
    // Must carry over the hazard — find first club whose carry >= adjustedTarget
    const idx = sorted.findIndex((c) => c.carry >= adjustedTarget);
    if (idx === -1) {
      // No club reaches — recommend the longest
      notes.push('Hazard ahead — no club can carry this distance; using longest');
      return { primaryIdx: 0, altIdx: null };
    }
    notes.push(
      `Front hazard — must carry ${adjustedTarget}m (rollout ignored)`
    );
    return {
      primaryIdx: idx,
      altIdx: idx > 0 ? idx - 1 : null, // offer slightly longer alternative
    };
  }

  if (hazard === 'back') {
    // Must NOT roll past the back hazard.
    // Find the longest club where carry + minimal rollout is still <= target.
    const idx = sorted.findIndex((c) => getEffectiveTotal(c) <= adjustedTarget);
    if (idx === -1) {
      // Every club overshoots even with minimum rollout — use shortest
      const last = sorted.length - 1;
      notes.push('Back hazard — all clubs may overshoot; using shortest');
      return { primaryIdx: last, altIdx: last - 1 >= 0 ? last - 1 : null };
    }
    const chosen = sorted[idx];
    notes.push(
      `Back hazard — carry + rollout (~${getEffectiveTotal(chosen)}m) stays under ${adjustedTarget}m`
    );
    return {
      primaryIdx: idx,
      altIdx: idx + 1 < sorted.length ? idx + 1 : null, // slightly shorter as safe alternative
    };
  }

  // No hazard — use effective total (carry + rollout)
  const match = findRangeForDistance(ranges, adjustedTarget);
  if (!match) return { primaryIdx: 0, altIdx: null };

  const primaryIdx = sorted.findIndex((c) => c.id === match.club.id);
  const effectiveForNext = primaryIdx + 1 < sorted.length
    ? getEffectiveTotal(sorted[primaryIdx + 1])
    : -Infinity;
  const effectiveForPrev = primaryIdx - 1 >= 0
    ? getEffectiveTotal(sorted[primaryIdx - 1])
    : Infinity;

  // Alternative: whichever neighbour is closer in effective distance
  let altIdx: number | null = null;
  const diffNext = Math.abs(effectiveForNext - adjustedTarget);
  const diffPrev = Math.abs(effectiveForPrev - adjustedTarget);
  if (primaryIdx + 1 < sorted.length && diffNext < diffPrev) {
    altIdx = primaryIdx + 1;
  } else if (primaryIdx - 1 >= 0) {
    altIdx = primaryIdx - 1;
  }

  return { primaryIdx, altIdx };
}

/**
 * Main recommendation function.
 * Returns primary club, optional alternative, and human-readable explanation.
 */
export function recommend(
  clubs: Club[],
  distance: number,
  hazard: Hazard,
  lie: Lie
): Recommendation | null {
  if (clubs.length === 0) return null;

  const sorted = [...clubs].sort((a, b) => b.carry - a.carry);
  const notes: string[] = [];

  const { adjusted, notes: lieNotes } = applyLieAdjustment(distance, lie);
  notes.push(...lieNotes);

  let adjustedTarget = adjusted;

  if (hazard === 'front') {
    adjustedTarget += HAZARD_FRONT_BUFFER;
  }

  const { primaryIdx, altIdx } = selectClub(sorted, adjustedTarget, hazard, notes);

  const primary = sorted[primaryIdx];
  const alternative = altIdx !== null ? sorted[altIdx] : null;

  if (notes.length === 0) {
    notes.push('Using carry + minimal rollout model');
  }

  return {
    primary,
    alternative,
    adjustedTarget,
    explanation: notes,
  };
}
