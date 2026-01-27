"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

type Progress = {
  currentStep?: string;
  completedSteps?: string[];
};

type LabData = { text?: string };

type Completion = {
  identity?: boolean;
  meaning?: boolean;
  agency?: boolean;
};

type Integration = {
  coreTruth?: string;
  primaryDirection?: string;
  internalShift?: string;
  sevenDayPlan?: string[];
};

const labKeys = ["identity", "meaning", "agency"] as const;

function getLabStatus(text?: string, completed?: boolean) {
  if (completed) return "Complete";
  if (text && text.trim().length > 0) return "In progress";
  return "Not started";
}

function isIntegrationComplete(data?: Integration | null) {
  if (!data) return false;
  const hasCore = data.coreTruth?.trim().length;
  const hasDirection = data.primaryDirection?.trim().length;
  const hasShift = data.internalShift?.trim().length;
  const hasPlan = Array.isArray(data.sevenDayPlan) && data.sevenDayPlan.some((item) => item?.trim().length);
  return Boolean(hasCore && hasDirection && hasShift && hasPlan);
}

export default function DashboardOrientationStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [labs, setLabs] = useState<Record<string, LabData>>({});
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [integration, setIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAll() {
      try {
        const [progressRes, identityRes, meaningRes, agencyRes, completionRes, integrationRes] = await Promise.all([
          fetch("/api/orientation/progress"),
          fetch("/api/labs/identity"),
          fetch("/api/labs/meaning"),
          fetch("/api/labs/agency"),
          fetch("/api/labs/complete", { method: "GET" }).catch(() => null),
          fetch("/api/integration"),
        ]);

        const progressJson = progressRes.ok ? await progressRes.json() : null;
        const identityJson = identityRes.ok ? await identityRes.json() : null;
        const meaningJson = meaningRes.ok ? await meaningRes.json() : null;
        const agencyJson = agencyRes.ok ? await agencyRes.json() : null;
        const completionJson = completionRes && completionRes.ok ? await completionRes.json() : null;
        const integrationJson = integrationRes.ok ? await integrationRes.json() : null;

        if (!isActive) return;

        setProgress(progressJson?.data ?? null);
        setLabs({
          identity: identityJson?.data ?? {},
          meaning: meaningJson?.data ?? {},
          agency: agencyJson?.data ?? {},
        });
        setCompletion(completionJson?.data ?? null);
        setIntegration(integrationJson?.data ?? null);
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
                  {getLabStatus(labs[labKey]?.text, completion?.[labKey])}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-warmCharcoal">Integration</h4>
          <p className="text-sm text-warmCharcoal/70">
            {isIntegrationComplete(integration) ? "Saved" : "Not started"}
          </p>
        </div>
      </div>
    </Card>
  );
}
