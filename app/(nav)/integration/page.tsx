"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type LabStatus = "not_started" | "in_progress" | "complete";

type LabData = { text?: string };

type IntegrationData = {
  coreTruth: string;
  primaryDirection: string;
  internalShift: string;
  sevenDayPlan: string[];
};

const emptyIntegration: IntegrationData = {
  coreTruth: "",
  primaryDirection: "",
  internalShift: "",
  sevenDayPlan: ["", "", "", "", "", "", ""],
};

async function startCheckout() {
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "accelerator" }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = await res.json();
    const url = json?.url;
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("Checkout URL missing");
    }
  } catch (err) {
    console.error("Checkout error", err);
    // As a fallback, send to enrollment-required
    window.location.href = "/enrollment-required";
  }
}

export default function IntegrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLabs = searchParams.get("from") === "labs";
  const [identity, setIdentity] = useState<LabData | null>(null);
  const [meaning, setMeaning] = useState<LabData | null>(null);
  const [agency, setAgency] = useState<LabData | null>(null);
  const [identityStatus, setIdentityStatus] = useState<LabStatus>("not_started");
  const [meaningStatus, setMeaningStatus] = useState<LabStatus>("not_started");
  const [agencyStatus, setAgencyStatus] = useState<LabStatus>("not_started");
  const [integration, setIntegration] = useState<IntegrationData>(emptyIntegration);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const [identityRes, meaningRes, agencyRes, integrationRes] = await Promise.all([
          fetch("/api/labs/identity"),
          fetch("/api/labs/meaning"),
          fetch("/api/labs/agency"),
          fetch("/api/integration"),
        ]);

        // Gate: if integration API says unauth or forbidden, trigger the right next step
        if (integrationRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (integrationRes.status === 403) {
          if (fromLabs) {
            await startCheckout();
          } else {
            router.replace("/labs?message=complete-labs");
          }
          return;
        }

        const [identityJson, meaningJson, agencyJson, integrationJson] = await Promise.all([
          identityRes.json(),
          meaningRes.json(),
          agencyRes.json(),
          integrationRes.json(),
        ]);

        if (!isActive) return;

        // Get lab statuses from dashboard API
        try {
          const dashboardRes = await fetch("/api/dashboard", { cache: "no-store" });
          if (dashboardRes.ok) {
            const dashboardJson = await dashboardRes.json();
            const data = dashboardJson?.data;
            if (data) {
              setIdentityStatus(data?.identityStatus ?? "not_started");
              setMeaningStatus(data?.meaningStatus ?? "not_started");
              setAgencyStatus(data?.agencyStatus ?? "not_started");
            }
          }
        } catch (err) {
          console.error("Failed to load lab statuses", err);
        }

        setIdentity(identityJson?.data ?? null);
        setMeaning(meaningJson?.data ?? null);
        setAgency(agencyJson?.data ?? null);

        if (integrationJson?.data) {
          setIntegration({
            coreTruth: integrationJson.data.coreTruth || "",
            primaryDirection: integrationJson.data.primaryDirection || "",
            internalShift: integrationJson.data.internalShift || "",
            sevenDayPlan: Array.isArray(integrationJson.data.sevenDayPlan)
              ? integrationJson.data.sevenDayPlan
              : ["", "", "", "", "", "", ""],
          });
        }
      } catch {
        if (isActive) setStatus("Failed to load integration data");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const updatePlan = (index: number, value: string) => {
    setIntegration((prev) => {
      const nextPlan = [...prev.sevenDayPlan];
      nextPlan[index] = value;
      return { ...prev, sevenDayPlan: nextPlan };
    });
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(integration),
      });

      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to save");
      }

      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const allLabsComplete =
    identityStatus === "complete" && meaningStatus === "complete" && agencyStatus === "complete";

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
        <p className="text-sm text-warmCharcoal/60">Loading...</p>
      </div>
    );
  }

  // Locked state: if labs are not complete, show instructional state
  if (!allLabsComplete) {
    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13 16H7V4h6v12zm-6-14a1 1 0 00-1 1v14a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H7z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-semibold text-amber-900">Integration Locked</h1>
              </div>
              <p className="text-sm text-amber-800">
                Complete all three labs before you can synthesize your integration.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-900">Lab Completion Checklist</h2>
              <div className="space-y-2">
                {[
                  { label: "Identity Lab", status: identityStatus },
                  { label: "Meaning Lab", status: meaningStatus },
                  { label: "Agency Lab", status: agencyStatus },
                ].map((lab) => (
                  <div key={lab.label} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        lab.status === "complete"
                          ? "bg-emerald-500 border-emerald-600"
                          : "border-amber-300 bg-amber-100"
                      }`}
                    >
                      {lab.status === "complete" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${lab.status === "complete" ? "text-emerald-700" : "text-amber-800"}`}>
                        {lab.label}
                      </p>
                      {lab.status !== "complete" && (
                        <p className="text-xs text-amber-700">
                          {lab.status === "in_progress" ? "In progress" : "Not started"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>Why this matters:</strong> Integration depends on having clarity from all three labs. This ensures your synthesis is grounded in identity, meaning, and agency.
              </p>
            </div>

            {/* CTA */}
            <Link href="/labs">
              <Button className="w-full">
                Continue to Labs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked state: render the full form
  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Integration</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Synthesize your labs into a clear direction and 7-day plan.
      </p>

      <div className="mt-8 grid gap-8">
        <section className="rounded-2xl border border-ip-border bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-warmCharcoal">Lab Inputs</h2>
          <div className="mt-4 space-y-3 text-sm text-warmCharcoal/70">
            <div>
              <strong>Identity:</strong> {identity?.text || "Not yet completed"}
            </div>
            <div>
              <strong>Meaning:</strong> {meaning?.text || "Not yet completed"}
            </div>
            <div>
              <strong>Agency:</strong> {agency?.text || "Not yet completed"}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ip-border bg-white/80 p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-warmCharcoal">Core Truth</label>
            <textarea
              rows={3}
              className="mt-2 w-full px-4 py-3 border border-ip-border rounded-xl text-sm"
              value={integration.coreTruth}
              onChange={(e) => setIntegration({ ...integration, coreTruth: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-warmCharcoal">Primary Direction</label>
            <textarea
              rows={3}
              className="mt-2 w-full px-4 py-3 border border-ip-border rounded-xl text-sm"
              value={integration.primaryDirection}
              onChange={(e) => setIntegration({ ...integration, primaryDirection: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-warmCharcoal">Internal Shift</label>
            <textarea
              rows={3}
              className="mt-2 w-full px-4 py-3 border border-ip-border rounded-xl text-sm"
              value={integration.internalShift}
              onChange={(e) => setIntegration({ ...integration, internalShift: e.target.value })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ip-border bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-warmCharcoal">7-Day Plan</h2>
          <div className="mt-4 grid gap-3">
            {integration.sevenDayPlan.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-xs text-warmCharcoal/60">Day {index + 1}</div>
                <input
                  className="flex-1 px-3 py-2 border border-ip-border rounded-lg text-sm"
                  value={day}
                  onChange={(e) => updatePlan(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {status ? <div className="text-sm text-warmCharcoal/70">{status}</div> : null}
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save integration"}
        </Button>
      </div>
    </div>
  );
}
