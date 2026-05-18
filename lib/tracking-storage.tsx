'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { doc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { TrackedShot, TrackingSession } from './types';
import { getSessionDate } from './tracking-stats';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_KEY_PREFIX = 'golf_tracking_';

// ─── Actions ────────────────────────────────────────────────────────────────

type TrackingAction =
  | { type: 'LOAD_SESSION'; session: TrackingSession }
  | { type: 'ADD_SHOT'; shot: TrackedShot }
  | { type: 'REMOVE_SHOT'; shotId: string }
  | { type: 'CLEAR' };

// ─── Reducer ────────────────────────────────────────────────────────────────

function trackingReducer(state: TrackingSession, action: TrackingAction): TrackingSession {
  switch (action.type) {
    case 'LOAD_SESSION':
      return action.session;
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
  loading: boolean;
  selectClub: (clubId: string) => void;
  addShot: (carry: number, total: number) => void;
  removeShot: (shotId: string) => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

// ─── Helpers ────────────────────────────────────────────────────────────────

function trackingDocRef(uid: string, clubId: string, date: string) {
  return doc(db, 'users', uid, 'tracking', `${clubId}__${date}`);
}

function localKey(clubId: string, date: string) {
  return `${LOCAL_KEY_PREFIX}${clubId}__${date}`;
}

function emptySession(clubId: string): TrackingSession {
  return { date: getSessionDate(), clubId, shots: [] };
}

function getLocalSession(clubId: string, date: string): TrackingSession {
  try {
    const raw = localStorage.getItem(localKey(clubId, date));
    if (raw) return JSON.parse(raw) as TrackingSession;
  } catch { /* ignore */ }
  return emptySession(clubId);
}

function saveLocalSession(session: TrackingSession) {
  localStorage.setItem(localKey(session.clubId, session.date), JSON.stringify(session));
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, dispatch] = useReducer(trackingReducer, emptySession(''));
  const [loading, setLoading] = useReducer((_: boolean, v: boolean) => v, false);
  const [loaded, setLoaded] = useReducer((_: boolean, v: boolean) => v, false);
  const [activeClubId, setActiveClubId] = useReducer((_: string, v: string) => v, '');

  const selectClub = useCallback((clubId: string) => {
    setActiveClubId(clubId);
  }, []);

  // Load session when club or user changes
  useEffect(() => {
    if (!activeClubId) return;
    const date = getSessionDate();

    if (user) {
      setLoading(true);
      const ref = trackingDocRef(user.uid, activeClubId, date);
      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          dispatch({ type: 'LOAD_SESSION', session: snap.data() as TrackingSession });
        } else {
          const local = getLocalSession(activeClubId, date);
          dispatch({ type: 'LOAD_SESSION', session: local });
        }
        setLoading(false);
        setLoaded(true);
      }, () => {
        dispatch({ type: 'LOAD_SESSION', session: getLocalSession(activeClubId, date) });
        setLoading(false);
        setLoaded(true);
      });
      return unsubscribe;
    } else {
      dispatch({ type: 'LOAD_SESSION', session: getLocalSession(activeClubId, date) });
      setLoaded(true);
    }
  }, [activeClubId, user]);

  // Persist changes
  useEffect(() => {
    if (!loaded || !activeClubId || session.clubId !== activeClubId) return;

    if (user) {
      const timer = setTimeout(() => {
        const ref = trackingDocRef(user.uid, session.clubId, session.date);
        setDoc(ref, session);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      saveLocalSession(session);
    }
  }, [session, user, loaded, activeClubId]);

  const addShot = useCallback((carry: number, total: number) => {
    dispatch({
      type: 'ADD_SHOT',
      shot: { id: uuidv4(), carry, total, timestamp: Date.now() },
    });
  }, []);

  const removeShot = useCallback((shotId: string) => {
    dispatch({ type: 'REMOVE_SHOT', shotId });
  }, []);

  return (
    <TrackingContext.Provider value={{ session, loading, selectClub, addShot, removeShot }}>
      {children}
    </TrackingContext.Provider>
  );
}

// ─── Bulk Import ─────────────────────────────────────────────────────────────

export async function importShotsForClubs(
  uid: string | null,
  sessions: Map<string, TrackedShot[]>,
  date: string
) {
  const entries = Array.from(sessions.entries());
  for (const [clubId, newShots] of entries) {
    if (uid) {
      const ref = trackingDocRef(uid, clubId, date);
      await runTransaction(db, async (txn) => {
        const snap = await txn.get(ref);
        const existing: TrackingSession = snap.exists()
          ? (snap.data() as TrackingSession)
          : { date, clubId, shots: [] };
        existing.shots = [...existing.shots, ...newShots];
        txn.set(ref, existing);
      });
    } else {
      const key = localKey(clubId, date);
      let existing: TrackingSession;
      try {
        const raw = localStorage.getItem(key);
        existing = raw ? (JSON.parse(raw) as TrackingSession) : { date, clubId, shots: [] };
      } catch {
        existing = { date, clubId, shots: [] };
      }
      existing.shots = [...existing.shots, ...newShots];
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within a TrackingProvider');
  return ctx;
}
