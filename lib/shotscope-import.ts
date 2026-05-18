'use client';

import { Club, TrackedShot } from './types';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShotScopeShot {
  Club: string;
  'Carry Distance (yds)': number;
  'Total Distance (yds)': number;
  [key: string]: unknown;
}

export interface ShotScopeExport {
  exportedAt?: string;
  session?: { dateAndShots?: string };
  shots: ShotScopeShot[];
}

export interface ImportGroup {
  sourceClub: string;
  shots: { carry: number; total: number }[];
  mappedClubId: string | null;
  suggestedClubId: string | null;
}

// ─── Yard → Meter ───────────────────────────────────────────────────────────

const YARD_TO_METER = 0.9144;

function yardsToMeters(yards: number): number {
  return Math.round(yards * YARD_TO_METER);
}

// ─── Club Name Mapping ──────────────────────────────────────────────────────

const SHOTSCOPE_ALIASES: Record<string, string[]> = {
  D:   ['Driver'],
  '3w': ['3 Wood'],
  '5w': ['5 Wood'],
  '7w': ['7 Wood'],
  H3:  ['3 Hybrid'],
  H4:  ['4 Hybrid'],
  H5:  ['5 Hybrid'],
  H6:  ['6 Hybrid'],
  '2i': ['2 Iron'],
  '3i': ['3 Iron'],
  '4i': ['4 Iron'],
  '5i': ['5 Iron'],
  '6i': ['6 Iron'],
  '7i': ['7 Iron'],
  '8i': ['8 Iron'],
  '9i': ['9 Iron'],
  Pw:  ['PW'],
  Gw:  ['GW'],
  Aw:  ['AW'],
  Sw:  ['SW'],
  Lw:  ['LW', '60°'],
};

/** Find the best matching club from the user's bag for a ShotScope club abbreviation */
function suggestClub(sourceClub: string, clubs: Club[]): string | null {
  const normalized = sourceClub.trim();

  // Try alias map (case-insensitive key lookup)
  const key = Object.keys(SHOTSCOPE_ALIASES).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );

  if (key) {
    const possibleNames = SHOTSCOPE_ALIASES[key];
    for (const name of possibleNames) {
      const match = clubs.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (match) return match.id;
    }
  }

  // Fuzzy: try substring match
  const lower = normalized.toLowerCase();
  const fuzzy = clubs.find(
    (c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  );
  if (fuzzy) return fuzzy.id;

  return null;
}

// ─── Parse & Group ──────────────────────────────────────────────────────────

export function parseShotScopeExport(json: ShotScopeExport, clubs: Club[]): ImportGroup[] {
  const groups = new Map<string, ImportGroup>();

  for (const shot of json.shots) {
    const sourceClub = shot.Club?.trim();
    if (!sourceClub) continue;

    const carry = yardsToMeters(shot['Carry Distance (yds)'] ?? 0);
    const total = yardsToMeters(shot['Total Distance (yds)'] ?? 0);
    if (carry <= 0) continue;

    if (!groups.has(sourceClub.toLowerCase())) {
      const suggested = suggestClub(sourceClub, clubs);
      groups.set(sourceClub.toLowerCase(), {
        sourceClub,
        shots: [],
        mappedClubId: suggested,
        suggestedClubId: suggested,
      });
    }

    groups.get(sourceClub.toLowerCase())!.shots.push({ carry, total });
  }

  return Array.from(groups.values());
}

/** Extract date from ShotScope export (format: "DD/MM/YYYY - N shots") */
export function extractDate(json: ShotScopeExport): string {
  const dateStr = json.session?.dateAndShots;
  if (dateStr) {
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }
  // Fallback to exportedAt
  if (json.exportedAt) {
    return json.exportedAt.slice(0, 10);
  }
  // Fallback to today
  return new Date().toISOString().slice(0, 10);
}

/** Convert import groups to TrackedShot arrays keyed by clubId */
export function buildImportSessions(groups: ImportGroup[]): Map<string, TrackedShot[]> {
  const result = new Map<string, TrackedShot[]>();

  for (const group of groups) {
    if (!group.mappedClubId) continue;

    const existing = result.get(group.mappedClubId) ?? [];
    for (const shot of group.shots) {
      existing.push({
        id: uuidv4(),
        carry: shot.carry,
        total: shot.total,
        timestamp: Date.now(),
      });
    }
    result.set(group.mappedClubId, existing);
  }

  return result;
}
