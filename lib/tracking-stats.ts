import { TrackedShot } from './types';

/**
 * Returns today's date as "YYYY-MM-DD" (local time).
 */
export function getSessionDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Computes the median of a number array. Returns 0 for empty arrays.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/**
 * Identifies outlier shot IDs — shots whose carry OR total deviates
 * more than 20% from the median of all shots.
 */
function findOutliers(shots: TrackedShot[]): Set<string> {
  if (shots.length < 3) return new Set(); // too few to determine outliers

  const carries = shots.map((s) => s.carry);
  const totals = shots.map((s) => s.total);
  const medCarry = median(carries);
  const medTotal = median(totals);

  const outlierIds = new Set<string>();
  for (const shot of shots) {
    const carryDev = Math.abs(shot.carry - medCarry) / medCarry;
    const totalDev = Math.abs(shot.total - medTotal) / medTotal;
    if (carryDev > 0.2 || totalDev > 0.2) {
      outlierIds.add(shot.id);
    }
  }
  return outlierIds;
}

export interface TrackingStats {
  medianCarry: number;
  medianTotal: number;
  outlierIds: Set<string>;
  validCount: number;
}

/**
 * Computes stats for a list of shots, excluding outliers from the median.
 */
export function computeStats(shots: TrackedShot[]): TrackingStats {
  if (shots.length === 0) {
    return { medianCarry: 0, medianTotal: 0, outlierIds: new Set(), validCount: 0 };
  }

  const outlierIds = findOutliers(shots);
  const valid = shots.filter((s) => !outlierIds.has(s.id));

  return {
    medianCarry: median(valid.map((s) => s.carry)),
    medianTotal: median(valid.map((s) => s.total)),
    outlierIds,
    validCount: valid.length,
  };
}

/**
 * Computes stats from the last N shots (by timestamp, descending).
 * Excludes outliers as usual.
 */
export function computeStatsLastN(allShots: TrackedShot[], n: number = 5): TrackingStats {
  const sorted = [...allShots].sort((a, b) => b.timestamp - a.timestamp).slice(0, n);
  return computeStats(sorted);
}
