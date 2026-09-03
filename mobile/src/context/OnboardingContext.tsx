import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setOnboarding(null);
      setError(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const state = await getOnboardingState();
      setOnboarding(state);
      return state;
    } catch (caught) {
      setOnboarding(null);
      setError(caught instanceof Error ? caught.message : 'Unable to load onboarding.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

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
