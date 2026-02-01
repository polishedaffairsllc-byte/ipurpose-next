"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/Button";

interface BuildWorkflowFormProps {
  userId: string;
}

export default function BuildWorkflowForm({ userId }: BuildWorkflowFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workflow name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/systems/workflows/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), steps: steps.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save workflow.");
      }
      router.push("/systems/workflows");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-warmCharcoal">Workflow name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigoDeep/50"
          placeholder="e.g., Client onboarding, Content publishing"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-warmCharcoal">Steps (optional)</label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          className="w-full rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigoDeep/50 min-h-[120px]"
          placeholder="List the key steps or paste a quick outline"
        />
        <p className="text-xs text-warmCharcoal/60">Keep it lightweight—enough to unlock the deepen path.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" size="md" className="min-w-[160px]" disabled={saving}>
          {saving ? "Saving..." : "Save workflow"}
        </Button>
        <Button type="button" variant="ghost" size="md" href="/systems/workflows">
          Cancel
        </Button>
      </div>
    </form>
  );
}
