"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const profileRes = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      if (!profileRes.ok) {
        const text = await profileRes.text();
        throw new Error(text || "Failed to save profile");
      }

      const termsRes = await fetch("/api/onboarding/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedTermsVersion: "v1" }),
      });

      if (!termsRes.ok) {
        const text = await termsRes.text();
        throw new Error(text || "Failed to save acceptance");
      }

      router.push("/orientation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-ip-surface">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-warmCharcoal">You are entering a development space</h1>
        <p className="mt-3 text-sm text-warmCharcoal/70">
          Set your profile name and accept the terms to begin.
        </p>

        <div className="mt-6 space-y-4">
          <label className="text-sm text-warmCharcoal/80">
            Display name
            <input
              className="mt-2 w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label className="flex items-start gap-3 text-sm text-warmCharcoal/80">
            <input
              type="checkbox"
              className="mt-1"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I have read and agree to the <Link href="/terms" className="text-ip-accent underline">Terms</Link>.
            </span>
          </label>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            onClick={handleSubmit}
            disabled={!accepted || submitting}
            className="w-full rounded-full px-5 py-3 bg-ip-accent text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Begin Orientation Path"}
          </button>
        </div>
      </div>
    </div>
  );
}
