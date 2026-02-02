"use client";

import React, { useMemo, useEffect } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { WeeklyResetState, copyToClipboard } from "./calendarSyncTypes";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyResetStep({
  value,
  onChange,
  onComplete,
  copied,
  setCopied,
}: {
  value: WeeklyResetState;
  onChange: (next: WeeklyResetState) => void;
  onComplete: (isComplete: boolean) => void;
  copied: string | null;
  setCopied: (v: string | null) => void;
}) {
  useEffect(() => {
    console.log("[CALENDAR_SYNC_DEBUG] WeeklyResetStep (Step 4) MOUNTED");
    return () => console.log("[CALENDAR_SYNC_DEBUG] WeeklyResetStep (Step 4) UNMOUNTED");
  }, []);
  const weeklyResetDescription = useMemo(() => {
    return `Weekly Calendar Reset — ${value.day || "Choose day"} at ${value.time || "Choose time"} for ${value.duration || 45} minutes`;
  }, [value]);

  const eventTemplate = useMemo(() => {
    return [
      `${weeklyResetDescription}`,
      ``,
      `Agenda:`,
      `- Triage holds`,
      `- Confirm priorities`,
      `- Recommit focus blocks`,
      `- Publish availability`,
      ``,
      `Checklist:`,
      `- Archive canceled events`,
      `- Review booking rules`,
      `- Adjust next week's blocks`,
      ``,
      `Monthly audit: remove stale holds, rebalance themes.`,
    ].join("\n");
  }, [weeklyResetDescription]);

  function setScheduled(scheduled: boolean) {
    const next = { ...value, scheduled };
    onChange(next);
    onComplete(scheduled);
  }

  return (
    <div className="space-y-4" data-calendar-step="4">
      {/* DEBUG: Component visibility marker */}
      <div className="bg-blue-100 border-2 border-blue-400 rounded p-2 text-xs font-bold text-blue-900">
        ✅ Mounted: Step 4 (WeeklyResetStep)
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-warmCharcoal/85">Step 4: Schedule Your Weekly Reset</p>
        <p className="text-sm text-warmCharcoal/75 font-marcellus">Schedule a recurring weekly reset to keep your calendar honest.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-sm text-warmCharcoal/80">
        <label className="flex flex-col gap-1">
          Day of week
          <select
            value={value.day}
            onChange={(e) => onChange({ ...value, day: e.target.value })}
            className="rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm"
          >
            {daysOfWeek.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Time
          <input
            type="time"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            className="rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          Duration (minutes)
          <input
            type="number"
            value={value.duration}
            onChange={(e) => onChange({ ...value, duration: Number(e.target.value) })}
            className="rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <Card className="p-4 space-y-3 bg-indigoDeep/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Output</p>
            <h4 className="font-marcellus text-lg text-warmCharcoal">Calendar event template</h4>
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
        <div className="space-y-1 text-sm text-warmCharcoal/80">
          <p>
            <span className="font-semibold">Title:</span> Weekly Calendar Reset
          </p>
          <p>
            <span className="font-semibold">When:</span> {weeklyResetDescription}
          </p>
          <p className="font-semibold">Description:</p>
          <ul className="list-disc list-inside text-sm text-warmCharcoal/80 space-y-1">
            <li>Triage holds</li>
            <li>Confirm priorities</li>
            <li>Recommit focus blocks</li>
            <li>Publish availability</li>
          </ul>
          <div className="space-y-1 text-sm text-warmCharcoal/80">
            <p className="font-semibold">Checklist:</p>
            <div className="flex flex-col gap-1 text-[13px] text-warmCharcoal/80">
              <span>☐ Archive canceled events</span>
              <span>☐ Review booking rules</span>
              <span>☐ Adjust next week's blocks</span>
            </div>
          </div>
          <p className="text-xs text-warmCharcoal/60">Monthly audit: remove stale holds, rebalance themes.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-warmCharcoal/80">
          <input
            type="checkbox"
            checked={value.scheduled}
            onChange={(e) => setScheduled(e.target.checked)}
          />
          <span>I scheduled this event on my calendar</span>
        </label>
        {value.scheduled && <p className="text-xs text-emerald-700">✅ Weekly reset scheduled.</p>}
      </Card>
    </div>
  );
}
