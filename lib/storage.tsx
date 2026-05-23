'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
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

/** Strip undefined/null fields that Firestore rejects */
function sanitizeBag(bag: Bag): Bag {
  return {
    clubs: bag.clubs.map(({ id, name, category, carry, total }) => {
      const c: Club = { id, name, category, carry };
      if (total != null) c.total = total;
      return c;
    }),
  };
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function BagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bag, dispatch] = useReducer(bagReducer, { clubs: [] });
  const [syncing, setSyncing] = useReducer((_prev: boolean, v: boolean) => v, false);

  // Track the current bag in a ref so persist functions always have latest
  const bagRef = useRef(bag);
  bagRef.current = bag;

  // Track the user in a ref for the same reason
  const userRef = useRef(user);
  userRef.current = user;

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
          setDoc(ref, sanitizeBag(local));
          dispatch({ type: 'LOAD_BAG', bag: local });
        }
        setSyncing(false);
      }, () => {
        // Firestore error fallback → localStorage
        dispatch({ type: 'LOAD_BAG', bag: getLocalBag() });
        setSyncing(false);
      });
      return unsubscribe;
    } else {
      // Not signed in → use localStorage
      dispatch({ type: 'LOAD_BAG', bag: getLocalBag() });
    }
  }, [user]);

  // ── Imperative persist: only called on explicit user mutations ──────────
  function persistBag(updatedBag: Bag) {
    const currentUser = userRef.current;
    if (currentUser) {
      setDoc(bagDocRef(currentUser.uid), sanitizeBag(updatedBag));
    } else {
      saveLocalBag(updatedBag);
    }
  }

  // Wrapper that dispatches and then persists the resulting state
  function addClub(club: Omit<Club, 'id'>) {
    const newClub = { ...club, id: uuidv4() };
    const updated: Bag = { clubs: [...bagRef.current.clubs, newClub] };
    dispatch({ type: 'LOAD_BAG', bag: updated });
    persistBag(updated);
  }

  function updateClub(club: Club) {
    const updated: Bag = {
      clubs: bagRef.current.clubs.map((c) => c.id === club.id ? club : c),
    };
    dispatch({ type: 'LOAD_BAG', bag: updated });
    persistBag(updated);
  }

  function removeClub(id: string) {
    const updated: Bag = {
      clubs: bagRef.current.clubs.filter((c) => c.id !== id),
    };
    dispatch({ type: 'LOAD_BAG', bag: updated });
    persistBag(updated);
  }

  return (
    <BagContext.Provider
      value={{
        bag,
        syncing: syncing as unknown as boolean,
        addClub,
        updateClub,
        removeClub,
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
