import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { advanceNativeFirstRun, getNativeFirstRun, markIntroCompleted } from '../lib/api';
import type { FirstRunState } from '../lib/firstRun';

interface FirstRunValue {
  state: FirstRunState | null;
  error: boolean;
  retry: () => void;
  advance: (next: FirstRunState) => Promise<void>;
}

const FirstRunContext = createContext<FirstRunValue | null>(null);

/** Mounted under the signup admission gate and keyed by the admitted UID. */
export function FirstRunProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [state, setState] = useState<FirstRunState | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const active = useRef(false);
  const saving = useRef(false);

  useEffect(() => {
    let current = true;
    active.current = true;
    setError(false);
    void getNativeFirstRun(uid).then(async value => {
      if (value.stage === 'welcome' && current) {
        // Migrate the released app's per-user Welcome flag before routing.
        const legacy = await AsyncStorage.getItem(`ipurpose:welcome:v1:${uid}`).catch(() => null);
        if (legacy === 'true' && current) {
          await markIntroCompleted('welcome', uid);
          value = await getNativeFirstRun(uid);
        }
      }
      if (current) setState(value);
    }).catch(() => {
      if (current) setError(true);
    });
    return () => { current = false; active.current = false; };
  }, [uid, attempt]);

  const advance = useCallback(async (next: FirstRunState) => {
    if (!active.current || saving.current) throw new Error('Account setup is still saving. Please try again.');
    saving.current = true;
    try {
      const value = await advanceNativeFirstRun(next, uid).catch(async caught => {
        const recovered = await getNativeFirstRun(uid).catch(() => null);
        if (recovered?.stage === next.stage && recovered.choice === next.choice) return recovered;
        throw caught;
      });
      if (active.current) setState(value);
    } finally {
      saving.current = false;
    }
  }, [uid]);

  return <FirstRunContext.Provider value={{ state, error, retry: () => setAttempt(value => value + 1), advance }}>
    {children}
  </FirstRunContext.Provider>;
}

export function useFirstRun() {
  const value = useContext(FirstRunContext);
  if (!value) throw new Error('FirstRunProvider is required');
  return value;
}
