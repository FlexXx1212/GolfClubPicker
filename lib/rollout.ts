import { Club, ClubCategory } from './types';

// Conservative minimum rollout values by category (in meters)
// We use the minimum expected rollout — safe for course management
const ROLLOUT_BY_CATEGORY: Record<ClubCategory, number> = {
  wedge:  5,
  iron:   10,  // covers short irons (7–9); long/mid adjusted below
  hybrid: 20,
  wood:   25,
  driver: 30,
};

// Iron sub-categories by typical carry ranges
function getIronRollout(carry: number): number {
  if (carry <= 120) return 10;  // short irons (8i, 9i, PW range)
  if (carry <= 155) return 15;  // mid irons (5i, 6i, 7i)
  return 20;                    // long irons (3i, 4i)
}

/**
 * Returns the minimum expected rollout for a club.
 * Used as a conservative secondary adjustment — never rely on full rollout.
 */
export function getMinRollout(club: Club): number {
  if (club.category === 'iron') {
    return getIronRollout(club.carry);
  }
  return ROLLOUT_BY_CATEGORY[club.category];
}

/**
 * Returns carry + minimal rollout as the effective total distance.
 */
export function getEffectiveTotal(club: Club): number {
  return club.carry + getMinRollout(club);
}
