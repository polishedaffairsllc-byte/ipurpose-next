"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";

export default function AgencyLabPage() {
  const router = useRouter();
  const [awarenessPatterns, setAwarenessPatterns] = useState("");
  const [decisionPatterns, setDecisionPatterns] = useState("");
  const [actionPatterns, setActionPatterns] = useState("");
  const [completeEnough, setCompleteEnough] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/labs/agency/active");
        const json = await res.json();
        if (isActive) {
          const map = json?.data?.map;
          setAwarenessPatterns(map?.awarenessPatterns || "");
          setDecisionPatterns(map?.decisionPatterns || "");
          setActionPatterns(map?.actionPatterns || "");
          setCompleteEnough(Boolean(map?.completeEnough));
        }
      } catch {
        if (isActive) setStatus("Failed to load lab");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/labs/agency/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awarenessPatterns,
          decisionPatterns,
          actionPatterns,
          completeEnough,
        }),
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

  const markComplete = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/labs/agency/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to mark complete");
      }
      setStatus("Marked complete");
      // Navigate back to Labs hub (all labs complete)
      router.push("/labs");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Completion failed");
    }
  };

  const integrate = async () => {
    setStatus(null);
    try {
      const summary = `Agency Lab snapshot: Awareness (${awarenessPatterns.length} chars), Decision (${decisionPatterns.length} chars), Action (${actionPatterns.length} chars)`;
      const res = await fetch("/api/labs/agency/integrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          fields: {
            awarenessPatterns,
            decisionPatterns,
            actionPatterns,
          },
        }),
      });
      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to integrate");
      }
      const data = await res.json();
      setStatus(data.message || "Integrated");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Integration failed");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Agency Lab</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Identify where you can act decisively and build momentum.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-warmCharcoal/60">Loading...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Awareness Patterns</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="When do you notice yourself reacting or becoming alert?"
              value={awarenessPatterns}
              onChange={(e) => setAwarenessPatterns(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Decision Patterns</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="How do you make decisions when it matters?"
              value={decisionPatterns}
              onChange={(e) => setDecisionPatterns(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Action Patterns</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="How do you follow through once you decide?"
              value={actionPatterns}
              onChange={(e) => setActionPatterns(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-warmCharcoal/70">
            <input
              type="checkbox"
              checked={completeEnough}
              onChange={(e) => setCompleteEnough(e.target.checked)}
            />
            This is complete enough for now.
          </label>
          {status ? <div className="text-sm text-warmCharcoal/70">{status}</div> : null}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={integrate}>
              Integrate
            </Button>
            <Button variant="secondary" onClick={markComplete}>
              Mark complete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
