"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";

export default function AgencyLabPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/labs/agency");
        const json = await res.json();
        if (isActive) {
          setText(json?.data?.text || "");
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
      const res = await fetch("/api/labs/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
      const res = await fetch("/api/labs/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labKey: "agency" }),
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
      <h1 className="text-4xl font-semibold text-warmCharcoal">Agency Lab</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        Identify where you can act decisively and build momentum.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-warmCharcoal/60">Loading...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <textarea
            rows={8}
            className="w-full px-4 py-3 border border-ip-border rounded-xl text-sm text-warmCharcoal"
            placeholder="Where do you feel ready to take aligned action right now?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
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
