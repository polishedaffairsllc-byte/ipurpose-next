"use client";

import React, { useEffect } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { FocusProtectionState, copyToClipboard } from "./calendarSyncTypes";

export function FocusProtectionStep({
  value,
  onChange,
  onComplete,
  copied,
  setCopied,
}: {
  value: FocusProtectionState;
  onChange: (next: FocusProtectionState) => void;
  onComplete: (isComplete: boolean) => void;
  copied: string | null;
  setCopied: (v: string | null) => void;
}) {
  useEffect(() => {
    console.log("[CALENDAR_SYNC_DEBUG] FocusProtectionStep (Step 3) MOUNTED");
    return () => console.log("[CALENDAR_SYNC_DEBUG] FocusProtectionStep (Step 3) UNMOUNTED");
  }, []);
  const isComplete = value.createdEvent && value.statusBusy;

  function update(next: FocusProtectionState) {
    onChange(next);
    onComplete(next.createdEvent && next.statusBusy);
  }

  const eventTemplate = "No Meetings — Focus\nProtected focus block. Do not book.";

  return (
    <div className="space-y-4" data-calendar-step="3">
      {/* DEBUG: Component visibility marker */}
      <div className="bg-blue-100 border-2 border-blue-400 rounded p-2 text-xs font-bold text-blue-900">
        ✅ Mounted: Step 3 (FocusProtectionStep)
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-warmCharcoal/85">Step 3: Protect Focus Time</p>
        <p className="text-sm text-warmCharcoal/75 font-marcellus">Protect focus time with explicit no-meeting blocks.</p>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-warmCharcoal/80">
          {[
            { key: "createdEvent", label: "Create recurring \"No Meetings — Focus\" event" },
            { key: "statusBusy", label: "Set status to Busy" },
            { key: "hideDetails", label: "Hide event details (optional)" },
            { key: "addBuffers", label: "Add buffers (optional)" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value[item.key as keyof FocusProtectionState] as boolean}
                onChange={(e) => update({ ...value, [item.key]: e.target.checked })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        {value.createdEvent && <p className="text-xs text-emerald-700">✅ Focus block created.</p>}
        {value.statusBusy && <p className="text-xs text-emerald-700">✅ Status set to Busy.</p>}
        {!isComplete && <p className="text-xs text-warmCharcoal/60">Complete the first two items to continue.</p>}
      </Card>

      <Card className="p-4 space-y-3 bg-indigoDeep/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Output</p>
            <h4 className="font-marcellus text-lg text-warmCharcoal">Event template</h4>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              copyToClipboard(eventTemplate);
              setCopied("Copied");
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            Copy event details
          </Button>
        </div>
        <div className="space-y-2 text-sm text-warmCharcoal/80">
          <p>
            <span className="font-semibold">Title:</span> No Meetings — Focus
          </p>
          <p>
            <span className="font-semibold">Description:</span> Protected focus block. Do not book.
          </p>
        </div>
        <p className="text-xs text-warmCharcoal/60">Completion requires first two items checked.</p>
      </Card>
    </div>
  );
}
