"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LabKey = "identity" | "meaning" | "agency";
type LabStatus = "not_started" | "in_progress" | "complete";

type LabsState = Record<LabKey, LabStatus>;

const labMeta = [
  {
    key: "identity" as const,
    title: "Identity",
    href: "/labs/identity",
    description: "Language for who you are and what anchors you.",
  },
  {
    key: "meaning" as const,
    title: "Meaning",
    href: "/labs/meaning",
    description: "Clarity on what matters and the impact you want.",
  },
  {
    key: "agency" as const,
    title: "Agency",
    href: "/labs/agency",
    description: "Focused actions you are ready to take now.",
  },
];

const orientationInfo = [
  {
    label: "What this is",
    value: "A guided plan to map Identity, Meaning, and Agency into something you can act on.",
  },
  {
    label: "How it works",
    value: "Move through three labs. Each save updates your dashboard and unlocks the next step.",
  },
  {
    label: "What you'll get",
    value: "Clear self-language, priorities, and a next-step micro plan.",
  },
  {
    label: "Time",
    value: "20–40 minutes per lab. Pause anytime—progress is saved.",
  },
];

const defaultState: LabsState = {
  identity: "not_started",
  meaning: "not_started",
  agency: "not_started",
};

function formatStatus(status: LabStatus) {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

export default function OrientationClient() {
  const [labs, setLabs] = useState<LabsState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load orientation status");
        }
        const json = await res.json();
        const data = json?.data as {
          identityStatus?: LabStatus;
          meaningStatus?: LabStatus;
          agencyStatus?: LabStatus;
        };
        if (!isActive) return;
        setLabs({
          identity: data?.identityStatus ?? "not_started",
          meaning: data?.meaningStatus ?? "not_started",
          agency: data?.agencyStatus ?? "not_started",
        });
      } catch (err) {
        if (!isActive) return;
        console.error("Orientation dashboard load failed", err);
        setError(err instanceof Error ? err.message : "Failed to load orientation status");
        setLabs(defaultState);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => {
      isActive = false;
    };
  }, []);

  const primaryLab = labMeta.find((lab) => labs[lab.key] !== "complete") ?? null;
  const allComplete = !primaryLab;

  const primaryCta = primaryLab
    ? {
        href: primaryLab.href,
        label: `Continue ${primaryLab.title} Lab`,
      }
    : {
        href: "/labs",
        label: "Review Labs",
      };

  const fallbackCtaLabel = "Continue Identity Lab";
  const progressPercent = useMemo(() => {
    const completed = labMeta.filter((lab) => labs[lab.key] === "complete").length;
    return Math.round((completed / labMeta.length) * 100);
  }, [labs]);

  const statusChip = (status: LabStatus) => {
    if (status === "complete") return "bg-emerald-100 text-emerald-700";
    if (status === "in_progress") return "bg-amber-100 text-amber-700";
    return "bg-warmCharcoal/5 text-warmCharcoal/70";
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/60">Orientation</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-warmCharcoal">Your Labs Launchpad</h1>
            <p className="text-base md:text-lg text-warmCharcoal/70 max-w-2xl">
              Orientation is the state-aware hub for moving through Identity → Meaning → Agency. We route you
              straight into the lab that needs your attention next.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-ip-accent text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
            >
              {primaryCta.label}
            </Link>
            <Link
              href="#orientation-details"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-warmCharcoal/15 text-sm text-warmCharcoal/80 hover:border-warmCharcoal/30"
            >
              Read Orientation details
            </Link>
            <Link
              href="/learning-path"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-warmCharcoal/15 text-sm text-warmCharcoal/70 hover:border-warmCharcoal/30"
            >
              View Learning Path
            </Link>
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error} — using safe defaults.</p>
          ) : loading ? (
            <p className="text-sm text-warmCharcoal/60">Checking your lab status...</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2" id="orientation-details">
            {orientationInfo.map((info) => (
              <div key={info.label} className="rounded-2xl border border-warmCharcoal/10 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-warmCharcoal/50">{info.label}</p>
                <p className="mt-2 text-sm text-warmCharcoal/80 leading-relaxed">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-warmCharcoal/10 bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/50">Lab Progress</p>
              <p className="text-3xl font-semibold text-warmCharcoal mt-1">{progressPercent}%</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${allComplete ? "bg-emerald-100 text-emerald-700" : "bg-warmCharcoal/5 text-warmCharcoal/70"}`}>
              {allComplete ? "Orientation complete" : "In progress"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-warmCharcoal/10 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ip-accent to-indigoDeep transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-3">
            {labMeta.map((lab) => (
              <Link
                key={lab.key}
                href={lab.href}
                className="block rounded-2xl border border-warmCharcoal/10 p-4 hover:border-warmCharcoal/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-warmCharcoal">{lab.title} Lab</p>
                    <p className="text-sm text-warmCharcoal/60">{lab.description}</p>
                  </div>
                  <span className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full ${statusChip(labs[lab.key])}`}>
                    {formatStatus(labs[lab.key])}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {allComplete ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Labs complete. Continue into Integration or Insights whenever you are ready.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-warmCharcoal/10 bg-white/80 p-6">
        <p className="text-sm text-warmCharcoal/70">
          {allComplete
            ? "Orientation remains available as a reference hub whenever you need to revisit your foundations."
            : "We keep Orientation focused: your next tap pushes you directly into the lab that still needs finishing."}
        </p>
        {!allComplete ? (
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-warmCharcoal/50">
            Primary action locked to {primaryLab?.title ?? "Identity"}
          </p>
        ) : null}
      </div>

      {!loading && error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Unable to verify progress right now. Using safe CTA: {fallbackCtaLabel}
        </div>
      )}
    </div>
  );
}
