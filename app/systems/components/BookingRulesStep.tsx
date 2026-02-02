"use client";

import React, { useMemo, useEffect } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { BookingRulesState, AudienceSegment, copyToClipboard } from "./calendarSyncTypes";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatAudienceLabel(audience: AudienceSegment) {
  return audience === "Clients" ? "Clients" : audience === "Partners" ? "Partners" : "Internal";
}

export function BookingRulesStep({
  value,
  onChange,
  onComplete,
  copied,
  setCopied,
}: {
  value: BookingRulesState;
  onChange: (next: BookingRulesState) => void;
  onComplete: (isComplete: boolean) => void;
  copied: string | null;
  setCopied: (v: string | null) => void;
}) {
  useEffect(() => {
    console.log("[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) MOUNTED");
    return () => console.log("[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) UNMOUNTED");
  }, []);
  const bookingPresets = useMemo(() => {
    const { audience, bufferPre, bufferPost, cancellationWindow, allowedDays, timeRange, reminderWindow } = value;
    const allowed = allowedDays.length ? allowedDays.join(", ") : "Set at least two days";
    return {
      settings: [
        "Calendly / SavvyCal settings",
        `• Available days: ${allowed}`,
        `• Hours: ${timeRange || "Set daily window"}`,
        `• Buffer: ${bufferPre} min before / ${bufferPost} min after`,
        `• Minimum notice: ${cancellationWindow} hours`,
        `• Cancellation window: ${cancellationWindow} hours`,
        `• Reminders: ${reminderWindow} hours before`,
      ].join("\n"),
      copy: `I book meetings ${allowed.toLowerCase()} between ${timeRange || "set hours"}. Please book at least ${cancellationWindow} hours in advance. All meetings include buffers (${bufferPre}/${bufferPost} minutes) to protect focus.`,
      summary: `For ${audience.toLowerCase()}: allow bookings on ${allowed} between ${timeRange || "set hours"}; require ${cancellationWindow}-hour notice and cancellation window; add ${bufferPre}/${bufferPost} minute buffers; reminders ${reminderWindow} hours before.`,
    };
  }, [value]);

  return (
    <div className="space-y-4" data-calendar-step="2">
      {/* DEBUG: Component visibility marker */}
      <div className="bg-blue-100 border-2 border-blue-400 rounded p-2 text-xs font-bold text-blue-900">
        ✅ Mounted: Step 2 (BookingRulesStep)
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-warmCharcoal/85">Step 2: Booking Rules</p>
        <p className="text-sm text-warmCharcoal/70">Apply at least one rule using copy/paste presets. You do not need to finish all rules to continue.</p>
        <p className="text-sm text-warmCharcoal/75 font-marcellus">Codify booking rules so requests respect your time and buffers.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-4 space-y-3">
          <label className="text-sm text-warmCharcoal/80 flex flex-col gap-1">
            Audience segment
            <select
              value={value.audience}
              onChange={(e) => onChange({ ...value, audience: e.target.value as AudienceSegment })}
              className="rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm"
            >
              {(["Clients", "Partners", "Internal"] as AudienceSegment[]).map((seg) => (
                <option key={seg}>{seg}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm text-warmCharcoal/80">
            <label className="flex flex-col gap-1">
              Buffer — pre (min)
              <input
                type="number"
                className="rounded-lg border border-warmCharcoal/20 px-2 py-1"
                value={value.bufferPre}
                onChange={(e) => onChange({ ...value, bufferPre: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              Buffer — post (min)
              <input
                type="number"
                className="rounded-lg border border-warmCharcoal/20 px-2 py-1"
                value={value.bufferPost}
                onChange={(e) => onChange({ ...value, bufferPost: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              Cancellation window (hours)
              <input
                type="number"
                className="rounded-lg border border-warmCharcoal/20 px-2 py-1"
                value={value.cancellationWindow}
                onChange={(e) => onChange({ ...value, cancellationWindow: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              Reminder window (hours)
              <input
                type="number"
                className="rounded-lg border border-warmCharcoal/20 px-2 py-1"
                value={value.reminderWindow}
                onChange={(e) => onChange({ ...value, reminderWindow: Number(e.target.value) })}
              />
            </label>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-warmCharcoal/80">
            {daysOfWeek.map((day) => {
              const selected = value.allowedDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => {
                    const next = selected ? value.allowedDays.filter((d) => d !== day) : [...value.allowedDays, day];
                    onChange({ ...value, allowedDays: next });
                  }}
                  className={`rounded-lg border px-2 py-1 transition ${selected ? "border-indigoDeep/50 bg-indigoDeep/5" : "border-warmCharcoal/15"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <label className="text-sm text-warmCharcoal/80 flex flex-col gap-1">
            Allowed time range
            <input
              type="text"
              value={value.timeRange}
              onChange={(e) => onChange({ ...value, timeRange: e.target.value })}
              placeholder="e.g., 10:00–16:00"
              className="rounded-lg border border-warmCharcoal/20 px-3 py-2 text-sm"
            />
          </label>
          <p className="text-xs text-warmCharcoal/60">Define clear guardrails you can paste into your booking tool.</p>
        </Card>
      </div>

      <Card className="p-4 space-y-4 bg-indigoDeep/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Output</p>
            <h4 className="font-marcellus text-lg text-warmCharcoal">Booking Rule Presets (Copy & Paste)</h4>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              copyToClipboard(`${bookingPresets.settings}\n\n${bookingPresets.copy}\n\n${bookingPresets.summary}`);
              setCopied("Copied");
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            Copy booking presets
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm text-warmCharcoal/80">
          <div className="rounded-lg border border-warmCharcoal/10 bg-white/80 p-3 space-y-1">
            <p className="text-xs text-warmCharcoal/60">Booking tool settings</p>
            <pre className="whitespace-pre-wrap text-[12px] leading-relaxed">{bookingPresets.settings}</pre>
          </div>
          <div className="rounded-lg border border-warmCharcoal/10 bg-white/80 p-3 space-y-1">
            <p className="text-xs text-warmCharcoal/60">Booking page copy</p>
            <p className="text-[12px] leading-relaxed">{bookingPresets.copy}</p>
          </div>
          <div className="rounded-lg border border-warmCharcoal/10 bg-white/80 p-3 space-y-1">
            <p className="text-xs text-warmCharcoal/60">Rules summary</p>
            <p className="text-[12px] leading-relaxed">{bookingPresets.summary}</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-warmCharcoal/80">
          <input
            type="checkbox"
            checked={value.applied}
            onChange={(e) => {
              onChange({ ...value, applied: e.target.checked });
              onComplete(e.target.checked);
            }}
          />
          <span>I applied at least one booking rule</span>
        </label>
        {value.applied && <p className="text-xs text-emerald-700">✅ Booking rule applied.</p>}
      </Card>
    </div>
  );
}
