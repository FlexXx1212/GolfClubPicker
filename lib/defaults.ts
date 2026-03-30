import { Club, ClubCategory } from './types';
import { v4 as uuidv4 } from 'uuid';

// A realistic default bag for first-time users
export const DEFAULT_CLUBS: Club[] = [
  { id: uuidv4(), name: 'Driver',   category: 'driver', carry: 220 },
  { id: uuidv4(), name: '3 Wood',   category: 'wood',   carry: 195 },
  { id: uuidv4(), name: '5 Wood',   category: 'wood',   carry: 175 },
  { id: uuidv4(), name: '4 Hybrid', category: 'hybrid', carry: 165 },
  { id: uuidv4(), name: '5 Iron',   category: 'iron',   carry: 155 },
  { id: uuidv4(), name: '6 Iron',   category: 'iron',   carry: 143 },
  { id: uuidv4(), name: '7 Iron',   category: 'iron',   carry: 130 },
  { id: uuidv4(), name: '8 Iron',   category: 'iron',   carry: 118 },
  { id: uuidv4(), name: '9 Iron',   category: 'iron',   carry: 105 },
  { id: uuidv4(), name: 'PW',       category: 'wedge',  carry: 92  },
  { id: uuidv4(), name: 'GW',       category: 'wedge',  carry: 78  },
  { id: uuidv4(), name: 'SW',       category: 'wedge',  carry: 62  },
  { id: uuidv4(), name: 'LW',       category: 'wedge',  carry: 48  },
];

// Preset club names by category for the ClubTypeSelector
export const PRESET_CLUBS: Record<ClubCategory, string[]> = {
  driver: ['Driver'],
  wood:   ['3 Wood', '5 Wood', '7 Wood'],
  hybrid: ['3 Hybrid', '4 Hybrid', '5 Hybrid', '6 Hybrid'],
  iron:   ['2 Iron', '3 Iron', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron'],
  wedge:  ['PW', 'GW', 'AW', 'SW', 'LW', '50°', '52°', '54°', '56°', '58°', '60°'],
};

export const CATEGORY_LABELS: Record<ClubCategory, string> = {
  driver: 'Driver',
  wood:   'Woods',
  hybrid: 'Hybrids',
  iron:   'Irons',
  wedge:  'Wedges',
};

export const CATEGORY_ORDER: ClubCategory[] = ['driver', 'wood', 'hybrid', 'iron', 'wedge'];
