"use client";

import React, { useMemo, useEffect } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { TimeArchitectureState, copyToClipboard } from "./calendarSyncTypes";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const categories = ["Deep Work", "Admin", "Clients", "Recovery"] as const;

export function TimeArchitectureStep({
  value,
  onChange,
  onComplete,
  copied,
  setCopied,
}: {
  value: TimeArchitectureState;
  onChange: (next: TimeArchitectureState) => void;
  onComplete: (isComplete: boolean) => void;
  copied: string | null;
  setCopied: (v: string | null) => void;
}) {
  useEffect(() => {
    console.log("[CALENDAR_SYNC_DEBUG] TimeArchitectureStep (Step 1) MOUNTED");
    return () => console.log("[CALENDAR_SYNC_DEBUG] TimeArchitectureStep (Step 1) UNMOUNTED");
  }, []);
  const blockPlanLines = useMemo(() => {
    return categories
      .filter((c) => value.categories[c])
      .map((c) => {
        const days = value.days[c]?.length ? value.days[c].join("/") : "—";
        const hours = value.hoursPerWeek[c] ?? 0;
        const prefix = c === "Clients" ? "Client time" : c;
        return `${prefix}: ${days} (${hours}h/week)`;
      });
  }, [value]);

  return (
    <div className="space-y-4" data-calendar-step="1">
      {/* DEBUG: Component visibility marker */}
      <div className="bg-blue-100 border-2 border-blue-400 rounded p-2 text-xs font-bold text-blue-900">
        ✅ Mounted: Step 1 (TimeArchitectureStep)
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-warmCharcoal/85">Step 1: Time Architecture</p>
        <p className="text-sm text-warmCharcoal/75 font-marcellus">Design your week by category. Keep it realistic and protect the mornings if needed.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Categories</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-warmCharcoal/80">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.categories[cat]}
                  onChange={(e) => onChange({ ...value, categories: { ...value.categories, [cat]: e.target.checked } })}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Optional guardrail</p>
          <label className="flex items-center gap-2 text-sm text-warmCharcoal/80">
            <span>No meetings before</span>
            <input
              type="time"
              value={value.noMeetingsBefore}
              onChange={(e) => onChange({ ...value, noMeetingsBefore: e.target.value })}
              className="rounded-lg border border-warmCharcoal/20 px-2 py-1 text-sm"
            />
          </label>
          <p className="text-xs text-warmCharcoal/60">Use this to defend your best focus window.</p>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2 border border-warmCharcoal/10 rounded-xl p-3 bg-white/70">
              <div className="flex items-center justify-between text-sm font-semibold text-warmCharcoal">
                <span>{cat}</span>
                <input
                  type="number"
                  min={0}
                  value={value.hoursPerWeek[cat] ?? 0}
                  onChange={(e) => onChange({ ...value, hoursPerWeek: { ...value.hoursPerWeek, [cat]: Number(e.target.value) } })}
                  className="w-20 rounded-lg border border-warmCharcoal/20 px-2 py-1 text-sm"
                />
              </div>
              <p className="text-[12px] text-warmCharcoal/60">Hours per week</p>
              <div className="flex flex-wrap gap-2 text-xs text-warmCharcoal/80">
                {daysOfWeek.map((day) => {
                  const selected = value.days[cat]?.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        const current = value.days[cat] || [];
                        const nextDays = selected ? current.filter((d) => d !== day) : [...current, day];
                        onChange({ ...value, days: { ...value.days, [cat]: nextDays } });
                      }}
                      className={`rounded-lg border px-2 py-1 transition ${selected ? "border-indigoDeep/50 bg-indigoDeep/5" : "border-warmCharcoal/15"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[12px] text-warmCharcoal/55">Preferred days</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3 bg-indigoDeep/5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Output</p>
            <h4 className="font-marcellus text-lg text-warmCharcoal">Recommended block plan</h4>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              copyToClipboard(blockPlanLines.join("\n"));
              setCopied("Copied");
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            Copy block plan
          </Button>
        </div>
        <div className="space-y-2 text-sm text-warmCharcoal/80">
          {blockPlanLines.map((line) => (
            <div key={line} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigoDeep/60" />
              <span>{line}</span>
            </div>
          ))}
          <p className="text-xs text-warmCharcoal/60">Add at least one block to your real calendar, then mark complete.</p>
          <label className="flex items-center gap-2 text-sm text-warmCharcoal/80">
            <input
              type="checkbox"
              checked={value.confirmedAdded}
              onChange={(e) => {
                onChange({ ...value, confirmedAdded: e.target.checked });
                onComplete(e.target.checked);
              }}
            />
            <span>I added at least one of these blocks to my calendar</span>
          </label>
          {value.confirmedAdded && <p className="text-xs text-emerald-700">✅ Focus block protected.</p>}
        </div>
      </Card>
    </div>
  );
}
