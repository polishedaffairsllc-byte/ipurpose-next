"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "../../lib/firebaseClient";

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

      // Redirect to dashboard
      console.log("✅ Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #FAF5FF 0%, #FFF5F0 50%, #FFFBF0 100%)'
    }}>
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-lavenderViolet/20 via-salmonPeach/20 to-softGold/20 rounded-3xl blur-xl opacity-75"></div>
          
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-lavenderViolet/10" style={{
            boxShadow: '0 20px 60px rgba(156, 136, 255, 0.15), 0 0 40px rgba(252, 196, 183, 0.1)'
          }}>
            <div className="text-center mb-8">
              <h1 className="font-italiana text-5xl bg-gradient-to-r from-lavenderViolet via-indigoDeep to-salmonPeach bg-clip-text text-transparent mb-3">
                Welcome to iPurpose
              </h1>
              <p className="font-marcellus text-warmCharcoal/70 text-base">
                Log in to access your dashboard and AI tools
              </p>
            </div>

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
                className="w-full px-4 py-3 border-2 border-lavenderViolet/20 rounded-xl bg-lavenderViolet/5 focus:border-lavenderViolet focus:outline-none focus:ring-4 focus:ring-lavenderViolet/10 focus:bg-white transition-all"
                style={{ boxShadow: '0 4px 12px rgba(156, 136, 255, 0.05)' }}
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
                className="w-full px-4 py-3 border-2 border-lavenderViolet/20 rounded-xl bg-lavenderViolet/5 focus:border-lavenderViolet focus:outline-none focus:ring-4 focus:ring-lavenderViolet/10 focus:bg-white transition-all"
                style={{ boxShadow: '0 4px 12px rgba(156, 136, 255, 0.05)' }}
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
              className="w-full py-3 px-6 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                boxShadow: '0 10px 30px rgba(156, 136, 255, 0.3), 0 0 20px rgba(156, 136, 255, 0.1)'
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

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
      </div>
    </div>
  );
}
