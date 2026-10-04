import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getPurposeResults, putPurposeResults, deletePurposeResults } from '../lib/api';
import type { PurposePayload, PurposeProfile } from '../lib/purposeCheck';
import { purposeCopy } from '../lib/purposeCheckCopy';

interface Value {
  profile: PurposeProfile | null;
  identityType: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (body: PurposePayload) => Promise<void>;
  clear: () => Promise<void>;
}
const Context = createContext<Value | null>(null);

// Remount on UID changes: no previous account's results or draft survives.
export function PurposeCheckProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <PurposeAccountProvider key={user?.uid || 'signed-out'} uid={user?.uid}>{children}</PurposeAccountProvider>;
}

function PurposeAccountProvider({ children, uid }: { children: ReactNode; uid?: string }) {
  const [profile, setProfile] = useState<PurposeProfile | null>(null);
  const [identityType, setIdentity] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState<string | null>(null);
  const mutations = useRef<Promise<void>>(Promise.resolve());
  const generation = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!uid) return;
    const ticket = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      await mutations.current;
      if (!alive.current) return;
      const result = await getPurposeResults();
      if (alive.current && ticket === generation.current) {
        setProfile(result.purposeProfile);
        setIdentity(result.identityType);
      }
    } catch {
      if (alive.current && ticket === generation.current) setError(purposeCopy.unavailable);
    } finally {
      if (alive.current && ticket === generation.current) setLoading(false);
    }
  }, [uid]);
  useEffect(() => { void refresh(); }, [refresh]);

  const save = async (body: PurposePayload) => {
    const ticket = ++generation.current;
    try {
      const operation = mutations.current.then(() => {
        if (!alive.current) throw new Error(purposeCopy.saveError);
        return putPurposeResults(body);
      });
      mutations.current = operation.then(() => {}, () => {});
      const result = await operation;
      if (alive.current && ticket === generation.current) {
        setProfile(result);
        setError(null);
        setLoading(false);
      }
    } catch { throw new Error(purposeCopy.saveError); }
  };

  const clear = async () => {
    const ticket = ++generation.current;
    try {
      const operation = mutations.current.then(() => {
        if (!alive.current) throw new Error(purposeCopy.deleteError);
        return deletePurposeResults();
      });
      mutations.current = operation.then(() => {}, () => {});
      await operation;
      if (alive.current && ticket === generation.current) {
        setProfile(null);
        setError(null);
        setLoading(false);
      }
    } catch { throw new Error(purposeCopy.deleteError); }
  };
  return <Context.Provider value={{ profile, identityType, loading, error, refresh, save, clear }}>{children}</Context.Provider>;
}

export function usePurposeCheck() {
  const value = useContext(Context);
  if (!value) throw new Error('PurposeCheckProvider required');
  return value;
}
