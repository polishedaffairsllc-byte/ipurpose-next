import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getOnboardingState } from '../lib/api';
import type { OnboardingState } from '../types/onboarding';
import { useAuth } from './AuthContext';

interface OnboardingContextValue {
  onboarding: OnboardingState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<OnboardingState | null>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [snapshot, setSnapshot] = useState<{ uid: string; onboarding: OnboardingState | null; error: string | null } | null>(null);
  const requestNumber = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestNumber.current;
    if (!userId) return null;

    try {
      const state = await getOnboardingState(userId);
      if (request !== requestNumber.current) return null;
      setSnapshot({ uid: userId, onboarding: state, error: null });
      return state;
    } catch (caught) {
      if (request === requestNumber.current) {
        setSnapshot({ uid: userId, onboarding: null, error: caught instanceof Error ? caught.message : 'Unable to load onboarding.' });
      }
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const current = snapshot?.uid === userId ? snapshot : null;
  const onboarding = current?.onboarding ?? null;
  const loading = authLoading || (!!userId && !current);
  const error = current?.error ?? null;
  const value = useMemo<OnboardingContextValue>(
    () => ({ onboarding, loading, error, refresh }),
    [error, loading, onboarding, refresh]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
