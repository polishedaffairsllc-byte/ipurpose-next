import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { deleteIPurposeAccount, saveMarketingConsent } from '../lib/api';
import { logLaunchEvent } from '../lib/analyticsEvents';
import { logUserActivity } from '../lib/userActivity';
import { clearPurposeProgress } from '../lib/purposeStorage';
import { compassIntroStorageKey } from '../lib/introVideos';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  createAccount: (email: string, password: string, marketingOptIn?: boolean, displayName?: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export class SignupNameSaveError extends Error {
  constructor() {
    super('Your account was created. Try again to save your name and finish setup.');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const creatingAccount = useRef(false);
  const pendingSignup = useRef<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      if (!creatingAccount.current && (!pendingSignup.current || pendingSignup.current.uid !== nextUser?.uid)) {
        setUser(nextUser);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    createAccount: async (email, password, marketingOptIn = false, displayName) => {
      if (creatingAccount.current) return;
      creatingAccount.current = true;
      const normalizedEmail = email.trim();
      const normalizedName = displayName?.trim();
      try {
        const pending = pendingSignup.current;
        const account = pending && pending.uid === auth.currentUser?.uid
          && pending.email?.toLowerCase() === normalizedEmail.toLowerCase()
          ? pending : (await createUserWithEmailAndPassword(auth, normalizedEmail, password)).user;
        pendingSignup.current = account;
        if (normalizedName) {
          try { await updateProfile(account, { displayName: normalizedName }); }
          catch { throw new SignupNameSaveError(); }
        }
        pendingSignup.current = null;
        try { await sendEmailVerification(account); }
        catch { /* Account remains usable; Account offers resend/retry. */ }
        logLaunchEvent('sign_up');
        await logUserActivity({ type: 'account_created' });
        if (marketingOptIn) await saveMarketingConsent();
      } finally {
        creatingAccount.current = false;
        if (!pendingSignup.current) setUser(auth.currentUser);
      }
    },
    deleteAccount: async (password) => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('Please sign in again before deleting your account.');

      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      await deleteIPurposeAccount();
      await Promise.allSettled([
        clearPurposeProgress(currentUser.uid),
        AsyncStorage.removeItem(compassIntroStorageKey(currentUser.uid)),
      ]);
      await firebaseSignOut(auth);
    },
    signIn: async (email, password) => {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      pendingSignup.current = null;
      setUser(credential.user);
      await logUserActivity({ type: 'login' });
    },
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
