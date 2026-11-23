import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { emptyPurposeProgress, type PurposeProgress } from '../lib/purpose';
import { loadPurposeProgress, savePurposeProgress } from '../lib/purposeStorage';

interface PurposeContextValue {
  progress: PurposeProgress;
  loading: boolean;
  ready: boolean;
  saving: boolean;
  error: string | null;
  update: (patch: Partial<PurposeProgress>) => void;
  flush: () => Promise<void>;
  retry: () => void;
}
const PurposeContext = createContext<PurposeContextValue | undefined>(undefined);

// A keyed session immediately isolates in-memory reflections when accounts change.
export function PurposeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <PurposeSession key={user?.uid ?? 'signed-out'} userId={user?.uid}>{children}</PurposeSession>;
}

function PurposeSession({ userId, children }: { userId?: string; children: ReactNode }) {
  const [progress, setProgress] = useState(emptyPurposeProgress);
  const draft = useRef(progress);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const revision = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    if (!userId) { setLoading(false); return; }
    loadPurposeProgress(userId).then((saved) => {
      if (!active) return;
      draft.current = saved;
      setProgress(saved);
      setReady(true);
    }).catch(() => {
      if (active) setError('We couldn’t load your saved reflections. Try again before editing.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, attempt]);

  const persist = useCallback(async () => {
    if (!userId || !ready) throw new Error('Purpose progress is still loading.');
    const currentRevision = ++revision.current;
    setSaving(true);
    try {
      await savePurposeProgress(userId, draft.current);
      if (mounted.current && currentRevision === revision.current) setError(null);
    } catch (caught) {
      if (mounted.current && currentRevision === revision.current) setError('Your latest changes haven’t saved on this device. Try again.');
      throw caught;
    } finally {
      if (mounted.current && currentRevision === revision.current) setSaving(false);
    }
  }, [ready, userId]);

  const update = useCallback((patch: Partial<PurposeProgress>) => {
    if (!ready) return;
    draft.current = { ...draft.current, ...patch };
    setProgress(draft.current);
    void persist().catch(() => {});
  }, [persist, ready]);
  const retry = useCallback(() => {
    if (ready) void persist().catch(() => {});
    else setAttempt((value) => value + 1);
  }, [persist, ready]);
  const value = useMemo(() => ({ progress, loading, ready, saving, error, update, flush: persist, retry }), [progress, loading, ready, saving, error, update, persist, retry]);
  return <PurposeContext.Provider value={value}>{children}</PurposeContext.Provider>;
}

export function usePurpose() {
  const value = useContext(PurposeContext);
  if (!value) throw new Error('usePurpose must be used inside PurposeProvider');
  return value;
}
