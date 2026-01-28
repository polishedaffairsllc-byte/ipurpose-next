"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LearningPathResponse = {
  path: { key: string; title: string };
  progress: { currentStep: string | null; completedSteps: string[]; percentComplete: number };
};

const steps = [
  { key: "orientation_intro", title: "Orientation Intro", type: "read" },
  { key: "identity_lab", title: "Identity Lab", type: "lab", href: "/labs/identity" },
  { key: "meaning_lab", title: "Meaning Lab", type: "lab", href: "/labs/meaning" },
  { key: "agency_lab", title: "Agency Lab", type: "lab", href: "/labs/agency" },
  { key: "integration_reflection", title: "Integration Reflection", type: "write", href: "/integration" },
  { key: "community_reflection", title: "Community Reflection (Optional)", type: "community", href: "/community" },
];

export default function LearningPathPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LearningPathResponse | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/learning-path/orientation");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load learning path");
        }
        const json = await res.json();
        if (isActive) setData(json?.data ?? null);
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load learning path");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const completed = data?.progress?.completedSteps ?? [];
  const percent = data?.progress?.percentComplete ?? 0;

  const nextStep = steps.find((step) => !completed.includes(step.key));

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Learning Path</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">Follow the path to complete Orientation.</p>

      {loading ? <p className="mt-6 text-sm text-warmCharcoal/70">Loading...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6">
        <div className="h-2 rounded-full bg-ip-border/60">
          <div className="h-2 rounded-full bg-ip-accent" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-warmCharcoal/60">{percent}% complete</p>
      </div>

      <div className="mt-8 grid gap-4">
        {steps.map((step) => (
          <div key={step.key} className="rounded-2xl border border-ip-border bg-white/80 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-warmCharcoal">{step.title}</h3>
              <p className="text-xs text-warmCharcoal/60">
                {completed.includes(step.key) ? "Completed" : "Pending"}
              </p>
            </div>
            {step.href ? (
              <Link href={step.href} className="text-sm text-ip-accent underline">
                Open
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      {nextStep?.href ? (
        <Link href={nextStep.href} className="inline-flex mt-8 px-4 py-2 rounded-full bg-ip-accent text-white text-sm">
          Continue to next lab
        </Link>
      ) : null}
    </div>
  );
}
