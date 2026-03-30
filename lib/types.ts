// Core domain types for GolfClubPicker

export type ClubCategory = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge';
export type Hazard = 'none' | 'front' | 'back';
export type Lie = 'good' | 'normal' | 'bad';

export interface Club {
  id: string;
  name: string;          // e.g. "7 Iron", "52° GW", "Driver"
  category: ClubCategory;
  carry: number;         // carry distance in meters
}

export interface Bag {
  clubs: Club[];
}

export interface ShotConditions {
  distance: number;   // target distance in meters
  hazard: Hazard;
  lie: Lie;
}

export interface DistanceRange {
  club: Club;
  minDist: number;
  maxDist: number;
  effectiveTotal: number; // carry + minimal rollout
}

export interface Recommendation {
  primary: Club;
  alternative: Club | null;
  adjustedTarget: number;
  explanation: string[];
}
