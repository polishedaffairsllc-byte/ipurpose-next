"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
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
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <aside className={styles.visual}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>iPurpose</span>
              <span className={styles.brandTag}>Focus your work. Amplify your impact.</span>
            </div>
          </div>
        </aside>

        <main className={styles.cardWrapper}>
          <section className={styles.card}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to access your dashboard and AI tools</p>

            <form onSubmit={handleLogin} className={styles.form} aria-describedby="login-error">
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <div id="login-error" className={styles.error} role="alert">
                  {error}
                </div>
              )}

              <button
                className={styles.submit}
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <div className={styles.row}>
                <a className={styles.link} href="/forgot-password">Forgot password?</a>
                <a className={styles.secondary} href="/signup">Create account</a>
              </div>
            </form>
          </section>
        </main>
      </div>

      <footer className={styles.footer}>
        <small>© {new Date().getFullYear()} iPurpose — Designed with care.</small>
      </footer>
    </div>
  );
}