"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";

export default function IdentityLabPage() {
  const [selfPerceptionMap, setSelfPerceptionMap] = useState("");
  const [selfConceptMap, setSelfConceptMap] = useState("");
  const [selfNarrativeMap, setSelfNarrativeMap] = useState("");
  const [completeEnough, setCompleteEnough] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/labs/identity/active");
        const json = await res.json();
        if (isActive) {
          const map = json?.data?.map;
          setSelfPerceptionMap(map?.selfPerceptionMap || "");
          setSelfConceptMap(map?.selfConceptMap || "");
          setSelfNarrativeMap(map?.selfNarrativeMap || "");
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
      const res = await fetch("/api/labs/identity/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfPerceptionMap,
          selfConceptMap,
          selfNarrativeMap,
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
      const res = await fetch("/api/labs/identity/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const textRes = await res.text();
        throw new Error(textRes || "Failed to mark complete");
      }
      setStatus("Marked complete");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Completion failed");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Identity Lab</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Define the core aspects of who you are and what you stand for.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-warmCharcoal/60">Loading...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Self-Perception Map</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="How do you experience yourself when no one is listening?"
              value={selfPerceptionMap}
              onChange={(e) => setSelfPerceptionMap(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Self-Concept Map</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="What do you believe about who you are?"
              value={selfConceptMap}
              onChange={(e) => setSelfConceptMap(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-warmCharcoal">Self-Narrative Map</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
              placeholder="What story do you tell about your life so far?"
              value={selfNarrativeMap}
              onChange={(e) => setSelfNarrativeMap(e.target.value)}
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
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
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
