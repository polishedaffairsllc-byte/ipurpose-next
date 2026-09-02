import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { getCompanionProfile, updateVisualEnvironmentPreference } from '../lib/api';
import {
  DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE,
  normalizeVisualEnvironmentPreference,
  resolveVisualEnvironment,
  type VisualEnvironmentName,
  type VisualEnvironmentPreference,
} from '../lib/visualEnvironment';
import { visualEnvironments, type VisualEnvironmentTokens } from '../theme';
import { useAuth } from './AuthContext';

interface VisualEnvironmentContextValue {
  savedPreference: VisualEnvironmentPreference;
  activePreference: VisualEnvironmentPreference;
  resolvedEnvironment: VisualEnvironmentName;
  autoResolvedEnvironment: VisualEnvironmentName;
  tokens: VisualEnvironmentTokens;
  loading: boolean;
  previewPreference: (preference: VisualEnvironmentPreference) => void;
  cancelPreview: () => void;
  confirmPreference: (preference: VisualEnvironmentPreference) => Promise<void>;
}

const VisualEnvironmentContext = createContext<VisualEnvironmentContextValue | undefined>(
  undefined
);

export function VisualEnvironmentProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [savedPreference, setSavedPreference] = useState(
    DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE
  );
  const [previewedPreference, setPreviewedPreference] =
    useState<VisualEnvironmentPreference | null>(null);
  const [timezone, setTimezone] = useState<string | undefined>();
  const [clock, setClock] = useState(() => new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setClock(new Date());
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
      setPreviewedPreference(null);
      setTimezone(undefined);
      setLoading(false);
      return;
    }

    let active = true;
    setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
    setPreviewedPreference(null);
    setTimezone(undefined);
    setLoading(true);
    getCompanionProfile()
      .then((profile) => {
        if (!active) return;
        setSavedPreference(
          normalizeVisualEnvironmentPreference(profile.visualEnvironmentPreference)
        );
        setTimezone(profile.timezone);
      })
      .catch(() => {
        if (!active) return;
        setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
        setTimezone(undefined);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, userId]);

  const previewPreference = useCallback((preference: VisualEnvironmentPreference) => {
    setPreviewedPreference(normalizeVisualEnvironmentPreference(preference));
    setClock(new Date());
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewedPreference(null);
    setClock(new Date());
  }, []);

  const confirmPreference = useCallback(
    async (preference: VisualEnvironmentPreference) => {
      const normalized = normalizeVisualEnvironmentPreference(preference);
      const profile = await updateVisualEnvironmentPreference(normalized);
      setSavedPreference(
        normalizeVisualEnvironmentPreference(profile.visualEnvironmentPreference)
      );
      setTimezone(profile.timezone);
      setPreviewedPreference(null);
      setClock(new Date());
    },
    []
  );

  const activePreference = previewedPreference ?? savedPreference;
  const resolvedEnvironment = resolveVisualEnvironment(
    activePreference,
    clock,
    timezone
  );
  const autoResolvedEnvironment = resolveVisualEnvironment(
    { mode: 'auto', manualTheme: savedPreference.manualTheme },
    clock,
    timezone
  );

  const value = useMemo<VisualEnvironmentContextValue>(
    () => ({
      savedPreference,
      activePreference,
      resolvedEnvironment,
      autoResolvedEnvironment,
      tokens: visualEnvironments[resolvedEnvironment],
      loading,
      previewPreference,
      cancelPreview,
      confirmPreference,
    }),
    [
      activePreference,
      autoResolvedEnvironment,
      cancelPreview,
      confirmPreference,
      loading,
      previewPreference,
      resolvedEnvironment,
      savedPreference,
    ]
  );

  return (
    <VisualEnvironmentContext.Provider value={value}>
      {children}
    </VisualEnvironmentContext.Provider>
  );
}

export function useVisualEnvironment() {
  const context = useContext(VisualEnvironmentContext);
  if (!context) {
    throw new Error(
      'useVisualEnvironment must be used inside VisualEnvironmentProvider'
    );
  }
  return context;
}
