"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedTermsVersion: "v1" }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save acceptance");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-ip-surface">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-warmCharcoal">Welcome to iPurpose</h1>
        <p className="mt-3 text-sm text-warmCharcoal/70">
          Before you begin, please review and accept our terms.
        </p>

        <div className="mt-6 space-y-4">
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

          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={!accepted || submitting}
            className="w-full rounded-full px-5 py-3 bg-ip-accent text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Accept & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
