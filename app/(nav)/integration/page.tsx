"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

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

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Integration</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Synthesize your labs into a clear direction and 7-day plan.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-warmCharcoal/60">Loading...</p>
      ) : (
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
      )}
    </div>
  );
}
