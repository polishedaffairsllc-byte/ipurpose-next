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
import { AppState } from 'react-native';
import {
  getCompanionProfile,
  updateCompanionTimezone,
  updateVisualEnvironmentPreference,
} from '../lib/api';
import { getDeviceTimezone, normalizeIanaTimezone } from '../lib/timezone';
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
  savedTimezone?: string;
  deviceTimezone: string;
  effectiveTimezone: string;
  loading: boolean;
  error: string | null;
  retryLoad: () => void;
  previewPreference: (preference: VisualEnvironmentPreference) => void;
  cancelPreview: () => void;
  confirmPreference: (preference: VisualEnvironmentPreference) => Promise<void>;
  confirmTimezone: (timezone: string) => Promise<void>;
}

const VisualEnvironmentContext = createContext<VisualEnvironmentContextValue | undefined>(
  undefined
);

export function VisualEnvironmentProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const currentUserId = useRef(userId);
  currentUserId.current = userId;
  const [savedPreference, setSavedPreference] = useState(
    DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE
  );
  const [previewedPreference, setPreviewedPreference] =
    useState<VisualEnvironmentPreference | null>(null);
  const [savedTimezone, setSavedTimezone] = useState<string | undefined>();
  const [deviceTimezone, setDeviceTimezone] = useState(getDeviceTimezone);
  const [clock, setClock] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const retryLoad = useCallback(() => setLoadAttempt((attempt) => attempt + 1), []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setClock(new Date());
        setDeviceTimezone(getDeviceTimezone());
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    setError(null);
    if (!userId) {
      setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
      setPreviewedPreference(null);
      setSavedTimezone(undefined);
      setLoading(false);
      return;
    }

    let active = true;
    setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
    setPreviewedPreference(null);
    setSavedTimezone(undefined);
    setLoading(true);
    getCompanionProfile()
      .then((profile) => {
        if (!active) return;
        setSavedPreference(
          normalizeVisualEnvironmentPreference(profile.visualEnvironmentPreference)
        );
        setSavedTimezone(normalizeIanaTimezone(profile.timezone) ?? undefined);
      })
      .catch(() => {
        if (!active) return;
        setSavedPreference(DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE);
        setSavedTimezone(undefined);
        setError('Your saved environment could not be loaded. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, userId, loadAttempt]);

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
      const savingUserId = currentUserId.current;
      const normalized = normalizeVisualEnvironmentPreference(preference);
      const profile = await updateVisualEnvironmentPreference(normalized);
      if (currentUserId.current !== savingUserId) return;
      setSavedPreference(
        normalizeVisualEnvironmentPreference(profile.visualEnvironmentPreference)
      );
      setPreviewedPreference(null);
      setClock(new Date());
    },
    []
  );

  const confirmTimezone = useCallback(async (timezone: string) => {
    const savingUserId = currentUserId.current;
    const normalized = normalizeIanaTimezone(timezone);
    if (!normalized) throw new Error('Choose a valid timezone.');

    const profile = await updateCompanionTimezone(normalized);
    if (currentUserId.current !== savingUserId) return;
    setSavedTimezone(normalizeIanaTimezone(profile.timezone) ?? normalized);
    setClock(new Date());
  }, []);

  const activePreference = previewedPreference ?? savedPreference;
  const effectiveTimezone = savedTimezone ?? deviceTimezone;
  const resolvedEnvironment = resolveVisualEnvironment(
    activePreference,
    clock,
    effectiveTimezone
  );
  const autoResolvedEnvironment = resolveVisualEnvironment(
    { mode: 'auto', manualTheme: savedPreference.manualTheme },
    clock,
    effectiveTimezone
  );

  const value = useMemo<VisualEnvironmentContextValue>(
    () => ({
      savedPreference,
      activePreference,
      resolvedEnvironment,
      autoResolvedEnvironment,
      tokens: visualEnvironments[resolvedEnvironment],
      savedTimezone,
      deviceTimezone,
      effectiveTimezone,
      loading,
      error,
      retryLoad,
      previewPreference,
      cancelPreview,
      confirmPreference,
      confirmTimezone,
    }),
    [
      activePreference,
      autoResolvedEnvironment,
      cancelPreview,
      confirmPreference,
      confirmTimezone,
      deviceTimezone,
      effectiveTimezone,
      loading,
      error,
      retryLoad,
      previewPreference,
      resolvedEnvironment,
      savedPreference,
      savedTimezone,
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
