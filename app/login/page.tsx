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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-lavenderViolet/10 px-2 py-8">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <div className="ipurpose-glow-container w-full">
          <div className="relative ipurpose-card px-6 py-8 md:px-8 md:py-10 flex flex-col items-center">
            <div className="text-center mb-6 w-full">
              <h1 className="heading-hero mb-2">Welcome to iPurpose</h1>
              <p className="font-marcellus text-warmCharcoal/70 text-base md:text-lg">Log in to access your dashboard and AI tools</p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-warmCharcoal mb-1">Email</label>
                <input id="email" type="email" className="ipurpose-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-warmCharcoal mb-1">Password</label>
                <input id="password" type="password" className="ipurpose-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">{error}</div>
              )}
              <button type="submit" disabled={loading} className="ipurpose-button-gradient w-full">{loading ? "Logging in..." : "Login"}</button>
            </form>
            <div className="mt-5 text-center w-full">
              <p className="text-sm text-warmCharcoal/60">Don't have an account?{' '}
                <a href="/signup" className="text-lavenderViolet font-semibold hover:text-indigoDeep transition-colors">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
