"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirebaseAuth } from "../../lib/firebaseClient";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get('next') || '/dashboard';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Firebase client SDK
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ signInWithEmailAndPassword resolved");

      // Obtain the idToken from the signed-in user
      const idToken = await credential.user.getIdToken();
      console.log("✅ Got idToken");

      // Send idToken to the server so the server can create a secure HttpOnly session cookie
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      console.log("✅ API response:", res.status, res.ok);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Server responded with ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      console.log("✅ API response data:", data);

      // Wait a brief moment for cookies to be processed by the browser
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to requested destination (defaults to dashboard)
      console.log("✅ Redirecting to:", nextParam);
      router.push(nextParam);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        {/* Brand Visual - Left Column */}
        <div className={styles.visual}>
          <div className={styles.brand}>
            <div className={styles.logo} />
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>iPurpose</div>
              <div className={styles.brandTag}>Where Alignment Meets Action</div>
            </div>
          </div>
        </div>

        {/* Login Form - Right Column */}
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to access your dashboard</p>
            
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className={styles.error}>{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.submit}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className={styles.row}>
                <a href="/forgot-password" className={styles.link}>Forgot password?</a>
                <a href="/signup" className={styles.secondary}>Sign up</a>
              </div>
            </form>

            <div className={styles.footer}>
              © 2026 iPurpose. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}