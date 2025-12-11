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
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Login failed. Please try again.");
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
              <div className={styles.brandTag}>Your AI-powered life design platform</div>
            </div>
          </div>
        </div>

        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Log in to access your dashboard and AI tools</p>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
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
                <label className={styles.label} htmlFor="password">Password</label>
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
                <a href="/signup" className={styles.link}>Don't have an account?</a>
                <a href="/signup" className={styles.secondary}>Sign up</a>
              </div>
            </form>
    <div className="min-h-screen bg-offWhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-warmCharcoal/5">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-italiana text-4xl text-indigoDeep mb-2">
              Welcome to iPurpose
            </h1>
            <p className="font-marcellus text-warmCharcoal/70 text-sm">
              Log in to access your dashboard and AI tools
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-warmCharcoal mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border-2 border-lavenderViolet/30 rounded-lg focus:border-lavenderViolet focus:outline-none focus:ring-2 focus:ring-lavenderViolet/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-warmCharcoal mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border-2 border-lavenderViolet/30 rounded-lg focus:border-lavenderViolet focus:outline-none focus:ring-2 focus:ring-lavenderViolet/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigoDeep text-offWhite py-3 px-6 rounded-lg font-semibold hover:bg-softGold hover:text-warmCharcoal transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-warmCharcoal/60">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-lavenderViolet font-semibold hover:text-indigoDeep transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} iPurpose. All rights reserved.
      </footer>
    </div>
  );
}