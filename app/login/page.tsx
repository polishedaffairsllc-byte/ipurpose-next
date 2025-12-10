"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // send idToken to server to create HttpOnly session cookie
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Server returned ${res.status}`);
      }

      router.push("/dashboard");
    } catch (err) {
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
        <div className={styles.visual}>
          <div className={styles.brand}>
            <div className={styles.logo}></div>
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>iPurpose</div>
              <div className={styles.brandTag}>Focus your work. Amplify your impact.</div>
            </div>
          </div>
        </div>

        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to continue to your dashboard</p>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" disabled={loading} className={styles.submit}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className={styles.row}>
                <Link href="/signup" className={styles.link}>
                  Create an account
                </Link>
                <Link href="/forgot-password" className={styles.secondary}>
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>© 2024 iPurpose. All rights reserved.</footer>
    </div>
  );
}