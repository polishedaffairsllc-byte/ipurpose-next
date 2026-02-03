"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import VideoBackground from "@/app/components/VideoBackground";

type LabStatus = "not_started" | "in_progress" | "complete";

type DashboardData = {
  identityStatus?: LabStatus;
  meaningStatus?: LabStatus;
  agencyStatus?: LabStatus;
};

const labMeta = [
  { key: "identity", title: "Identity", href: "/labs/identity" },
  { key: "meaning", title: "Meaning", href: "/labs/meaning" },
  { key: "agency", title: "Agency", href: "/labs/agency" },
] as const;

function getButtonLabel(status?: LabStatus) {
  if (status === "complete") return "Review";
  if (status === "in_progress") return "Continue";
  return "Start";
}

export default function LabsHubPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<Record<string, LabStatus>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load lab status");
        }
        const json = (await res.json()) as { data?: DashboardData };
        if (isActive) {
          setLabs({
            identity: json?.data?.identityStatus || "not_started",
            meaning: json?.data?.meaningStatus || "not_started",
            agency: json?.data?.agencyStatus || "not_started",
          });
        }
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load lab status");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const allLabsComplete = labs.identity === "complete" && labs.meaning === "complete" && labs.agency === "complete";

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <div className="relative h-[48vh] flex items-center justify-center overflow-hidden mb-8 rounded-3xl">
        <VideoBackground src="/videos/water-reflection.mp4" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="heading-hero mb-4 text-white drop-shadow-2xl">Labs</h1>
          <p className="text-xl md:text-2xl text-white/85 font-marcellus drop-shadow-lg">
            Complete the Identity, Meaning, and Agency labs to unlock integration.
          </p>
        </div>
      </div>

      {/* Orientation anchor */}
      <p className="text-sm text-warmCharcoal/70 italic mb-6">
        Labs turn insight into readiness. Complete all three to unlock Integration.
      </p>

      {message === "complete-labs" ? (
        <p className="mt-2 mb-6 text-sm text-amber-700">Complete Labs to continue to Integration.</p>
      ) : null}

      {loading ? <p className="mt-6 text-sm text-warmCharcoal/70">Loading...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {/* Labs grid: Identity, Meaning, Agency */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {labMeta.map((lab) => (
          <div key={lab.key} className="rounded-2xl border border-ip-border bg-white/80 p-6">
            <h2 className="text-xl font-semibold text-warmCharcoal">{lab.title}</h2>
            <p className="mt-2 text-sm text-warmCharcoal/70">
              Status: {labs[lab.key] || "not_started"}
            </p>
            <Link
              href={lab.href}
              className="inline-flex mt-5 px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
            >
              {getButtonLabel(labs[lab.key])}
            </Link>
          </div>
        ))}
      </div>

      {/* Integration preview card */}
      <div className="mt-8">
        {allLabsComplete ? (
          <Link
            href="/integration?from=labs"
            className="block rounded-2xl border border-ip-border bg-gradient-to-br from-ip-accent/10 to-ip-accent/5 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-warmCharcoal">Integration</h3>
                <p className="mt-2 text-sm text-warmCharcoal/70">
                  Synthesize your labs into a clear direction and 7-day plan.
                </p>
              </div>
              <div className="ml-4 px-3 py-1 rounded-full bg-ip-accent text-white text-xs font-semibold">
                Ready
              </div>
            </div>
            <div className="mt-4 inline-flex px-4 py-2 rounded-full bg-ip-accent text-white text-sm">
              Continue to Integration →
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-ip-border/40 bg-white/40 p-6 opacity-60">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-warmCharcoal/60">🔒 Integration</h3>
                <p className="mt-2 text-sm text-warmCharcoal/50">
                  Complete Identity, Meaning, and Agency to unlock Integration.
                </p>
              </div>
              <div className="ml-4 px-3 py-1 rounded-full bg-warmCharcoal/20 text-warmCharcoal/60 text-xs font-semibold">
                Locked
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
