// /context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"; // Renamed signOut to firebaseSignOut to avoid conflict
import { doc, onSnapshot, DocumentData } from 'firebase/firestore'; 
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebaseClient";

// -----------------------------
// 1. TYPES
// -----------------------------

// Define the structure for the custom user data fetched from Firestore
interface UserData extends DocumentData {
  fullName?: string;
  role?: string;
  onboardingStep?: number;
  createdAt?: object; // Using 'object' as Timestamp is complex to export
  email?: string;
  entitlementTier?: string;
  tier?: string;
  isFounder?: boolean;
}

// Define the structure for the entire context value
interface AuthContextType {
  user: User | null | undefined; 
  userData: UserData | null | undefined; 
  loading: boolean;
  logout: () => Promise<void>;
}

// -----------------------------
// 2. Create Context
// -----------------------------
const AuthContext = createContext<AuthContextType | null>(null);

// -----------------------------
// 3. Provider Component 
// -----------------------------
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); 
  const [userData, setUserData] = useState<UserData | null | undefined>(undefined); 
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [nextAttemptIn, setNextAttemptIn] = useState(0);
  const maxPollAttempts = 5;
  const pollIntervalSec = 3;
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith("/orientation") || pathname?.startsWith("/ethics");

  // Logout Function
  const logout = async () => {
    try {
        // ⭐️ FIX: Explicitly set local state to null FIRST to signal immediate log out.
        setUser(null);
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
    } finally {
        // CRITICAL FIX: Explicitly clear the session cookie set by middleware
        document.cookie = 'FirebaseSession=; Max-Age=0; path=/;';
    }
  };

  // --- Effect 1: Firebase Authentication Listener (Sets 'user' and 'loading') ---
  useEffect(() => {
    // Setup a timeout so dev/compiler issues don't leave the app hanging
    const timer = setTimeout(() => {
      setTimedOut(true);
      // allow components to handle a timed-out state by clearing the loading flag
      setLoading(false);
    }, 8000); // 8s
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser); 
      setLoading(false);
      // clear timeout if auth resolves in time
      clearTimeout(timer);
      // NOTE: userData is handled in Effect 2
    });
    return () => unsubscribe();
  }, []);

  // --- Effect 2: Firestore User Data Listener (Sets 'userData') ---
  useEffect(() => {
    let unsubscribeFromFirestore: () => void;

    if (user) {
      const userDocRef = doc(getFirebaseFirestore(), 'users', user.uid);

      unsubscribeFromFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          // Document exists: set the data
          setUserData(docSnap.data() as UserData);
        } else {
          // Document does not exist yet (e.g., brand new sign up)
          setUserData({});
        }
      }, (error) => {
        console.error("Error listening to user data:", error);
        setUserData(null);
      });
    } else {
      // If no user is logged in, clear the Firestore data
      setUserData(null);
    }

    // Cleanup function: Unsubscribe from the Firestore listener
    return () => {
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, [user]); // Reruns whenever the Firebase 'user' state changes

  // --- Effect 3: Poll admin status when timed out or polling manually ---
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout | null = null;
    let attemptTimer: NodeJS.Timeout | null = null;
    let isActive = true;

    async function checkAdminStatus() {
      try {
        const res = await fetch('/api/admin/status');
        if (!isActive) return;
        if (res.ok) {
          const body = await res.json();
          if (body && body.adminInitialized) {
            // Server is ready — reload so auth can complete
            window.location.reload();
          }
        }
      } catch (err) {
        // ignore, we'll retry
        console.debug('admin status check failed:', err);
      }
    }

    function scheduleAttempt() {
      if (!isActive) return;
      setPollAttempts((a) => a + 1);
      // perform the check
      checkAdminStatus();
    }

    if (timedOut || polling) {
      // Start polling loop
      setPolling(true);
      setPollAttempts(0);
      setNextAttemptIn(pollIntervalSec);

      // countdown every second and run an attempt when it hits 0
      countdownTimer = setInterval(() => {
        setNextAttemptIn((n) => {
          if (n <= 1) {
            // trigger attempt
            scheduleAttempt();
            return pollIntervalSec;
          }
          return n - 1;
        });
      }, 1000);

      // stop polling when max attempts reached
      attemptTimer = setInterval(() => {
        setPollAttempts((a) => {
          if (a >= maxPollAttempts) {
            // end polling
            setPolling(false);
            if (countdownTimer) clearInterval(countdownTimer);
            if (attemptTimer) clearInterval(attemptTimer);
            return a;
          }
          return a;
        });
      }, 1000);
    }

    return () => {
      isActive = false;
      if (countdownTimer) clearInterval(countdownTimer);
      if (attemptTimer) clearInterval(attemptTimer);
    };
  }, [timedOut, polling]);

  if ((loading || user === undefined) && !isPublicRoute) {
      if (timedOut) {
        return (
          <main className="min-h-screen flex items-center justify-center bg-ip-surface text-ip-muted p-6">
            <div className="max-w-md text-center">
              <h3 className="text-lg font-semibold">Still checking your session</h3>
              <p className="mt-2 text-sm text-ip-muted">The dev server may be compiling or there may be a network issue. The app will poll the server and retry automatically.</p>
              <div className="mt-3 text-sm text-ip-muted">
                {pollAttempts > 0 ? (
                  <div>Retry attempt {pollAttempts} of {maxPollAttempts}. Next try in {nextAttemptIn}s.</div>
                ) : (
                  <div>Attempting automatic retries — up to {maxPollAttempts} times.</div>
                )}
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <button className="px-4 py-2 bg-ip-accent text-white rounded" onClick={() => window.location.reload()}>Force reload</button>
                <button
                  className="px-4 py-2 border border-ip-border rounded"
                  onClick={() => {
                    // Start manual check immediately
                    setPolling(true);
                    setPollAttempts(0);
                    setNextAttemptIn(0);
                  }}
                >
                  Try now
                </button>
                <button
                  className="px-4 py-2 border border-ip-border rounded"
                  onClick={() => {
                    // Stop automatic polling
                    setPolling(false);
                  }}
                >
                  Stop
                </button>
              </div>
            </div>
          </main>
        );
      }

      return <div className="p-8">Initializing Authentication...</div>;
  }

  const value: AuthContextType = {
    user: user ?? null,
    userData, // ⭐️ Exporting the new data
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------
// 4. Hook for easy usage
// -----------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthContextProvider>");
  }
  return context;
}