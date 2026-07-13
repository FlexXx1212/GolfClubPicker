'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { TrackedShot, TrackingSession } from './types';
import { getSessionDate, computeStatsLastN } from './tracking-stats';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { useAuth } from './auth';
import { useBag } from './storage';

const LOCAL_KEY = 'golf_club_picker_tracking_local';

interface TrackingStore {
  historyByClub: Record<string, TrackedShot[]>;
}

interface TrackingState {
  session: TrackingSession;
  historyByClub: Record<string, TrackedShot[]>;
}

function trackingDocRef(uid: string) {
  return doc(db, 'users', uid, 'tracking', 'main');
}

function sanitizeHistory(historyByClub: Record<string, TrackedShot[]>): Record<string, TrackedShot[]> {
  const sanitized: Record<string, TrackedShot[]> = {};
  for (const [clubId, shots] of Object.entries(historyByClub)) {
    sanitized[clubId] = shots
      .filter((shot) =>
        typeof shot.id === 'string' &&
        Number.isFinite(shot.carry) &&
        Number.isFinite(shot.total) &&
        Number.isFinite(shot.timestamp)
      )
      .map((shot) => ({
        id: shot.id,
        carry: Math.round(shot.carry),
        total: Math.round(shot.total),
        timestamp: Math.round(shot.timestamp),
      }));
  }
  return sanitized;
}

function getLocalStore(): TrackingStore {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TrackingStore;
      return { historyByClub: sanitizeHistory(parsed.historyByClub ?? {}) };
    }
  } catch {
    // ignore invalid local data
  }
  return { historyByClub: {} };
}

function saveLocalStore(store: TrackingStore) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
}

// ─── Context ────────────────────────────────────────────────────────────────

interface TrackingContextValue {
  session: TrackingSession;
  selectClub: (clubId: string) => void;
  addShot: (carry: number, total: number) => void;
  removeShot: (shotId: string) => void;
  getShotsForClub: (clubId: string) => TrackedShot[];
  addImportedShots: (clubId: string, shots: Array<{ carry: number; total: number }>) => void;
  removeShotFromClub: (clubId: string, shotId: string) => void;
  clearShots: () => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

function emptySession(): TrackingSession {
  return { date: getSessionDate(), clubId: '', shots: [] };
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { bag, updateClub } = useBag();
  const [state, setState] = useState<TrackingState>({
    session: emptySession(),
    historyByClub: {},
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const userRef = useRef(user);
  userRef.current = user;
  const bagRef = useRef(bag);
  bagRef.current = bag;
  const updateClubRef = useRef(updateClub);
  updateClubRef.current = updateClub;

  function persistHistory(historyByClub: Record<string, TrackedShot[]>) {
    const sanitized = sanitizeHistory(historyByClub);
    const currentUser = userRef.current;
    if (currentUser) {
      setDoc(trackingDocRef(currentUser.uid), { historyByClub: sanitized });
    } else {
      saveLocalStore({ historyByClub: sanitized });
    }
  }

  // Recomputes the club's carry/total from its most recent shots and
  // persists it via BagProvider — keeps the club distance continuously
  // up to date without requiring a manual "Save" action.
  function applyRollingAverage(clubId: string, clubShots: TrackedShot[]) {
    const club = bagRef.current.clubs.find((c) => c.id === clubId);
    if (!club) return;
    const stats = computeStatsLastN(clubShots);
    if (stats.validCount >= 1) {
      updateClubRef.current({ ...club, carry: stats.medianCarry, total: stats.medianTotal });
    }
  }

  useEffect(() => {
    if (user) {
      const ref = trackingDocRef(user.uid);
      return onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as TrackingStore;
          const nextHistory = sanitizeHistory(data.historyByClub ?? {});
          const updated = { ...stateRef.current, historyByClub: nextHistory };
          stateRef.current = updated;
          setState(updated);
        } else {
          const local = getLocalStore();
          const nextHistory = sanitizeHistory(local.historyByClub);
          const updated = { ...stateRef.current, historyByClub: nextHistory };
          stateRef.current = updated;
          setState(updated);
          setDoc(ref, { historyByClub: nextHistory });
        }
      }, () => {
        const local = getLocalStore();
        const nextHistory = sanitizeHistory(local.historyByClub);
        const updated = { ...stateRef.current, historyByClub: nextHistory };
        stateRef.current = updated;
        setState(updated);
      });
    }

    const local = getLocalStore();
    const updated = {
      ...stateRef.current,
      historyByClub: sanitizeHistory(local.historyByClub),
    };
    stateRef.current = updated;
    setState(updated);
  }, [user]);

  const selectClub = useCallback((clubId: string) => {
    const updated: TrackingState = {
      ...stateRef.current,
      session: { date: getSessionDate(), clubId, shots: [] },
    };
    stateRef.current = updated;
    setState(updated);
  }, []);

  const addShot = useCallback((carry: number, total: number) => {
    const clubId = stateRef.current.session.clubId;
    if (!clubId) return;
    const shot: TrackedShot = {
      id: uuidv4(),
      carry: Math.round(carry),
      total: Math.round(total),
      timestamp: Date.now(),
    };
    const currentClubShots = stateRef.current.historyByClub[clubId] ?? [];
    const nextClubShots = [...currentClubShots, shot];
    const nextHistory = {
      ...stateRef.current.historyByClub,
      [clubId]: nextClubShots,
    };
    const updated: TrackingState = {
      session: { ...stateRef.current.session, shots: [...stateRef.current.session.shots, shot] },
      historyByClub: nextHistory,
    };
    stateRef.current = updated;
    setState(updated);
    persistHistory(nextHistory);
    applyRollingAverage(clubId, nextClubShots);
  }, []);

  const removeShot = useCallback((shotId: string) => {
    const clubId = stateRef.current.session.clubId;
    if (!clubId) return;
    const nextSessionShots = stateRef.current.session.shots.filter((s) => s.id !== shotId);
    const currentClubShots = stateRef.current.historyByClub[clubId] ?? [];
    const nextClubShots = currentClubShots.filter((s) => s.id !== shotId);
    const nextHistory = {
      ...stateRef.current.historyByClub,
      [clubId]: nextClubShots,
    };
    const updated: TrackingState = {
      session: { ...stateRef.current.session, shots: nextSessionShots },
      historyByClub: nextHistory,
    };
    stateRef.current = updated;
    setState(updated);
    persistHistory(nextHistory);
    applyRollingAverage(clubId, nextClubShots);
  }, []);

  const getShotsForClub = useCallback((clubId: string) => {
    return stateRef.current.historyByClub[clubId] ?? [];
  }, []);

  const addImportedShots = useCallback((clubId: string, shots: Array<{ carry: number; total: number }>) => {
    if (!clubId || shots.length === 0) return;
    const base = Date.now();
    const imported: TrackedShot[] = shots.map((shot, i) => ({
      id: uuidv4(),
      carry: Math.round(shot.carry),
      total: Math.round(shot.total),
      timestamp: base + i,
    }));
    const currentClubShots = stateRef.current.historyByClub[clubId] ?? [];
    const nextClubShots = [...currentClubShots, ...imported];
    const nextHistory = {
      ...stateRef.current.historyByClub,
      [clubId]: nextClubShots,
    };
    const updated: TrackingState = {
      ...stateRef.current,
      historyByClub: nextHistory,
    };
    stateRef.current = updated;
    setState(updated);
    persistHistory(nextHistory);
    applyRollingAverage(clubId, nextClubShots);
  }, []);

  const removeShotFromClub = useCallback((clubId: string, shotId: string) => {
    const currentClubShots = stateRef.current.historyByClub[clubId] ?? [];
    const nextClubShots = currentClubShots.filter((shot) => shot.id !== shotId);
    const nextHistory = {
      ...stateRef.current.historyByClub,
      [clubId]: nextClubShots,
    };
    const nextSession = (
      stateRef.current.session.clubId === clubId
        ? { ...stateRef.current.session, shots: stateRef.current.session.shots.filter((s) => s.id !== shotId) }
        : stateRef.current.session
    );
    const updated: TrackingState = {
      session: nextSession,
      historyByClub: nextHistory,
    };
    stateRef.current = updated;
    setState(updated);
    persistHistory(nextHistory);
    applyRollingAverage(clubId, nextClubShots);
  }, []);

  const clearShots = useCallback(() => {
    const updated: TrackingState = {
      ...stateRef.current,
      session: { ...stateRef.current.session, shots: [] },
    };
    stateRef.current = updated;
    setState(updated);
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        session: state.session,
        selectClub,
        addShot,
        removeShot,
        getShotsForClub,
        addImportedShots,
        removeShotFromClub,
        clearShots,
      }}
    >
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
