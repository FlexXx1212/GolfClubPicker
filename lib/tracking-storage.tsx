'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { TrackedShot, TrackingSession } from './types';
import { getSessionDate } from './tracking-stats';
import { v4 as uuidv4 } from 'uuid';

// ─── Actions ────────────────────────────────────────────────────────────────

type TrackingAction =
  | { type: 'SELECT_CLUB'; clubId: string }
  | { type: 'ADD_SHOT'; shot: TrackedShot }
  | { type: 'REMOVE_SHOT'; shotId: string }
  | { type: 'CLEAR' };

// ─── Reducer ────────────────────────────────────────────────────────────────

function trackingReducer(state: TrackingSession, action: TrackingAction): TrackingSession {
  switch (action.type) {
    case 'SELECT_CLUB':
      return { date: getSessionDate(), clubId: action.clubId, shots: [] };
    case 'ADD_SHOT':
      return { ...state, shots: [...state.shots, action.shot] };
    case 'REMOVE_SHOT':
      return { ...state, shots: state.shots.filter((s) => s.id !== action.shotId) };
    case 'CLEAR':
      return { ...state, shots: [] };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface TrackingContextValue {
  session: TrackingSession;
  selectClub: (clubId: string) => void;
  addShot: (carry: number, total: number) => void;
  removeShot: (shotId: string) => void;
  clearShots: () => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

function emptySession(): TrackingSession {
  return { date: getSessionDate(), clubId: '', shots: [] };
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(trackingReducer, emptySession());

  const selectClub = useCallback((clubId: string) => {
    dispatch({ type: 'SELECT_CLUB', clubId });
  }, []);

  const addShot = useCallback((carry: number, total: number) => {
    dispatch({
      type: 'ADD_SHOT',
      shot: { id: uuidv4(), carry, total, timestamp: Date.now() },
    });
  }, []);

  const removeShot = useCallback((shotId: string) => {
    dispatch({ type: 'REMOVE_SHOT', shotId });
  }, []);

  const clearShots = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <TrackingContext.Provider value={{ session, selectClub, addShot, removeShot, clearShots }}>
      {children}
    </TrackingContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within a TrackingProvider');
  return ctx;
}
