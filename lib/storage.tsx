'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { Bag, Club } from './types';
import { DEFAULT_CLUBS } from './defaults';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_KEY = 'golf_club_picker_bag_local';

// ─── Actions ────────────────────────────────────────────────────────────────

type BagAction =
  | { type: 'ADD_CLUB';    club: Omit<Club, 'id'> }
  | { type: 'UPDATE_CLUB'; club: Club }
  | { type: 'REMOVE_CLUB'; id: string }
  | { type: 'LOAD_BAG';    bag: Bag };

// ─── Reducer ────────────────────────────────────────────────────────────────

function bagReducer(state: Bag, action: BagAction): Bag {
  switch (action.type) {
    case 'LOAD_BAG':
      return action.bag;

    case 'ADD_CLUB':
      return {
        ...state,
        clubs: [...state.clubs, { ...action.club, id: uuidv4() }],
      };

    case 'UPDATE_CLUB':
      return {
        ...state,
        clubs: state.clubs.map((c) =>
          c.id === action.club.id ? action.club : c
        ),
      };

    case 'REMOVE_CLUB':
      return {
        ...state,
        clubs: state.clubs.filter((c) => c.id !== action.id),
      };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface BagContextValue {
  bag:       Bag;
  syncing:   boolean;
  addClub:    (club: Omit<Club, 'id'>) => void;
  updateClub: (club: Club)             => void;
  removeClub: (id: string)             => void;
}

const BagContext = createContext<BagContextValue | null>(null);

// ─── Helpers ────────────────────────────────────────────────────────────────

function bagDocRef(uid: string) {
  return doc(db, 'users', uid, 'bag', 'main');
}

function getLocalBag(): Bag {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as Bag;
  } catch { /* ignore */ }
  return { clubs: DEFAULT_CLUBS };
}

function saveLocalBag(bag: Bag) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bag));
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function BagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bag,     dispatch]  = useReducer(bagReducer, { clubs: [] });
  const [syncing, setSyncing] = useReducer((_prev: boolean, v: boolean) => v, false);
  // Track whether we've loaded data (to avoid overwriting on first render)
  const [loaded,  setLoaded]  = useReducer((_prev: boolean, v: boolean) => v, false);

  // ── Auth change: subscribe to Firestore or fall back to localStorage ────
  useEffect(() => {
    if (user) {
      setSyncing(true);
      const ref = bagDocRef(user.uid);
      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          dispatch({ type: 'LOAD_BAG', bag: snap.data() as Bag });
        } else {
          // First login: push local bag to Firestore
          const local = getLocalBag();
          setDoc(ref, local);
          dispatch({ type: 'LOAD_BAG', bag: local });
        }
        setSyncing(false);
        setLoaded(true);
      }, () => {
        // Firestore error fallback → localStorage
        dispatch({ type: 'LOAD_BAG', bag: getLocalBag() });
        setSyncing(false);
        setLoaded(true);
      });
      return unsubscribe;
    } else {
      // Not signed in → use localStorage
      dispatch({ type: 'LOAD_BAG', bag: getLocalBag() });
      setLoaded(true);
    }
  }, [user]);

  // ── Persist bag changes ────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || bag.clubs.length === 0) return;

    if (user) {
      // Debounced Firestore write
      const timer = setTimeout(() => {
        setDoc(bagDocRef(user.uid), bag);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      saveLocalBag(bag);
    }
  }, [bag, user, loaded]);

  return (
    <BagContext.Provider
      value={{
        bag,
        syncing: syncing as unknown as boolean,
        addClub:    (club) => dispatch({ type: 'ADD_CLUB',    club }),
        updateClub: (club) => dispatch({ type: 'UPDATE_CLUB', club }),
        removeClub: (id)   => dispatch({ type: 'REMOVE_CLUB', id }),
      }}
    >
      {children}
    </BagContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used within a BagProvider');
  return ctx;
}
