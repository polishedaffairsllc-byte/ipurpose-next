"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

type Progress = {
  currentStep?: string | null;
};

type DashboardData = {
  identityStatus?: "not_started" | "in_progress" | "complete";
  meaningStatus?: "not_started" | "in_progress" | "complete";
  agencyStatus?: "not_started" | "in_progress" | "complete";
};

const labKeys = ["identity", "meaning", "agency"] as const;

function formatStatus(status?: string) {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

export default function DashboardOrientationStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [labs, setLabs] = useState<DashboardData | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAll() {
      try {
        const [progressRes, dashboardRes] = await Promise.all([
          fetch("/api/learning-path/orientation"),
          fetch("/api/dashboard"),
        ]);

        const progressJson = progressRes.ok ? await progressRes.json() : null;
        const dashboardJson = dashboardRes.ok ? await dashboardRes.json() : null;

        if (!isActive) return;

        setProgress(progressJson?.data ?? null);
        setLabs(dashboardJson?.data ?? null);
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load status");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadAll();

    return () => {
      isActive = false;
    };
  }, []);

  const orientationSummary = progress?.currentStep
    ? `Current: ${progress.currentStep}`
    : "Progress not started";

  return (
    <Card accent="lavender">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-warmCharcoal">Orientation Progress</h3>
          {loading ? (
            <p className="text-sm text-warmCharcoal/70">Loading status...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-warmCharcoal/70">{orientationSummary}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-warmCharcoal">Lab Status</h4>
          <div className="mt-3 grid gap-2">
            {labKeys.map((labKey) => (
              <div key={labKey} className="flex items-center justify-between text-sm">
                <span className="capitalize text-warmCharcoal">{labKey}</span>
                <span className="text-warmCharcoal/70">
                  {formatStatus(labs?.[`${labKey}Status` as keyof DashboardData] as string | undefined)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
