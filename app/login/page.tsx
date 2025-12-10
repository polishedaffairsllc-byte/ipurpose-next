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
        {/* Visual / branding side */}
        <div className={styles.visual}>
          <div className={styles.brand}>
            <div className={styles.logo}></div>
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>iPurpose</div>
              <div className={styles.brandTag}>Living with Intention</div>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Log in to access your dashboard and AI tools.</p>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email</label>
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
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className={styles.row}>
                <a href="#" className={styles.link}>Forgot password?</a>
                <a href="/signup" className={styles.secondary}>Create account</a>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        © 2025 iPurpose. All rights reserved.
      </footer>
    </div>
  );
}