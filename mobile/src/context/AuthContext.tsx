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
import { acknowledgeSignupDisclosure, deleteIPurposeAccount, saveMarketingConsent } from '../lib/api';
import { logLaunchEvent } from '../lib/analyticsEvents';
import { logUserActivity } from '../lib/userActivity';
import { clearPurposeProgress } from '../lib/purposeStorage';
import { compassIntroStorageKey } from '../lib/introVideos';
import { formatSignupName, parseSignupName, type SignupName } from '../lib/profileIdentity';

interface SignupOptions extends SignupName {
  disclosureAcknowledged: boolean;
  marketingOptIn: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  createAccount: (email: string, password: string, options: SignupOptions) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export class SignupSetupError extends Error {}

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
    createAccount: async (email, password, { disclosureAcknowledged, marketingOptIn, firstName, lastName }) => {
      if (!disclosureAcknowledged) throw new Error('Review the AI-powered features disclosure to continue.');
      const name = parseSignupName(firstName, lastName);
      if (!name) throw new Error('Enter your first and last name to continue.');
      if (creatingAccount.current) return;
      creatingAccount.current = true;
      const normalizedEmail = email.trim();
      const displayName = formatSignupName(name);
      try {
        const pending = pendingSignup.current;
        const account = pending && pending.uid === auth.currentUser?.uid
          && pending.email?.toLowerCase() === normalizedEmail.toLowerCase()
          ? pending : (await createUserWithEmailAndPassword(auth, normalizedEmail, password)).user;
        pendingSignup.current = account;
        if (account.displayName !== displayName) {
          try { await updateProfile(account, { displayName }); }
          catch { throw new SignupSetupError('Your account was created. Try again to save your name and finish setup.'); }
        }
        try { await acknowledgeSignupDisclosure(account.uid, name); }
        catch { throw new SignupSetupError('Your account was created. Try again to save your acknowledgment and finish setup.'); }
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
