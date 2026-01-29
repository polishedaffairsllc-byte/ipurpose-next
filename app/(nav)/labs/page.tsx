"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Labs</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Complete the Identity, Meaning, and Agency labs to unlock integration.
      </p>
      {message === "complete-labs" ? (
        <p className="mt-2 text-sm text-amber-700">Complete Labs to continue to Integration.</p>
      ) : null}

      {loading ? <p className="mt-6 text-sm text-warmCharcoal/70">Loading...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

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

      {labs.identity === "complete" && labs.meaning === "complete" && labs.agency === "complete" ? (
        <div className="mt-8">
          <Link
            href="/integration?from=labs"
            className="inline-flex px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
          >
            Continue to Integration
          </Link>
        </div>
      ) : null}
    </div>
  );
}
