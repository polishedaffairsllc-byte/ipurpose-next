"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import SectionHeading from "../../components/SectionHeading";
import SystemAIPanel from "./SystemAIPanel";
import { TimeArchitectureStep } from "./TimeArchitectureStep";
import { BookingRulesStep } from "./BookingRulesStep";
import { FocusProtectionStep } from "./FocusProtectionStep";
import { WeeklyResetStep } from "./WeeklyResetStep";
import { CalendarWizardState, TimeCategory, AudienceSegment, SystemOfRecord } from "./calendarSyncTypes";

const defaultState: CalendarWizardState = {
  step: 1,
  timeArchitecture: {
    categories: {
      "Deep Work": true,
      Admin: true,
      Clients: true,
      Recovery: true,
    },
    days: {
      "Deep Work": ["Mon", "Wed", "Fri"],
      Admin: ["Tue"],
      Clients: ["Tue", "Thu"],
      Recovery: ["Sat", "Sun"],
    },
    hoursPerWeek: {
      "Deep Work": 12,
      Admin: 4,
      Clients: 8,
      Recovery: 5,
    },
    noMeetingsBefore: "09:00",
    confirmedAdded: false,
  },
  bookingRules: {
    audience: "Clients",
    bufferPre: 15,
    bufferPost: 15,
    cancellationWindow: 24,
    allowedDays: ["Tue", "Wed", "Thu"],
    timeRange: "10:00–16:00",
    reminderWindow: 24,
    applied: false,
  },
  focusProtection: {
    createdEvent: false,
    statusBusy: false,
    hideDetails: false,
    addBuffers: false,
  },
  weeklyReset: {
    day: "Fri",
    time: "16:00",
    duration: 45,
    scheduled: false,
  },
  systemOfRecord: "",
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const categories: TimeCategory[] = ["Deep Work", "Admin", "Clients", "Recovery"];

function persistableKey(userId?: string) {
  return userId ? `calendarOperationalV1_${userId}` : "calendarOperationalV1";
}

function mergeState(incoming?: Partial<CalendarWizardState> | null): CalendarWizardState {
  if (!incoming) return defaultState;
  return {
    ...defaultState,
    ...incoming,
    timeArchitecture: {
      ...defaultState.timeArchitecture,
      ...(incoming.timeArchitecture || {}),
      categories: {
        ...defaultState.timeArchitecture.categories,
        ...(incoming.timeArchitecture?.categories || {}),
      },
      days: {
        ...defaultState.timeArchitecture.days,
        ...(incoming.timeArchitecture?.days || {}),
      },
      hoursPerWeek: {
        ...defaultState.timeArchitecture.hoursPerWeek,
        ...(incoming.timeArchitecture?.hoursPerWeek || {}),
      },
    },
    bookingRules: {
      ...defaultState.bookingRules,
      ...(incoming.bookingRules || {}),
      allowedDays: incoming.bookingRules?.allowedDays?.length ? incoming.bookingRules.allowedDays : defaultState.bookingRules.allowedDays,
    },
    focusProtection: {
      ...defaultState.focusProtection,
      ...(incoming.focusProtection || {}),
    },
    weeklyReset: {
      ...defaultState.weeklyReset,
      ...(incoming.weeklyReset || {}),
    },
  };
}



export default function CalendarOperationalClient({ userId }: { userId?: string }) {
  const [state, setState] = useState<CalendarWizardState>(defaultState);
  const [copied, setCopied] = useState<string | null>(null);
  const remoteSyncTimer = useRef<NodeJS.Timeout | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const highlightTimer = useRef<NodeJS.Timeout | null>(null);

  // DEBUG: Log all state changes
  useEffect(() => {
    console.log("[CALENDAR_SYNC_DEBUG] State updated. Current step:", state.step);
  }, [state.step]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(persistableKey(userId)) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CalendarWizardState;
        console.log("[CALENDAR_SYNC_DEBUG] Loaded from localStorage, initial step:", parsed.step);
        setState((prev) => mergeState({ ...prev, ...parsed }));
      } catch (err) {
        console.error("Failed to parse calendar state", err);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const loadRemote = async () => {
      try {
        const res = await fetch("/api/systems/calendar/state");
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) {
          setState((prev) => {
            const merged = mergeState({ ...prev, ...json.data });
            if (typeof window !== "undefined") {
              window.localStorage.setItem(persistableKey(userId), JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch (err) {
        console.error("Calendar state load failed", err);
      }
    };
    loadRemote();
  }, [userId]);

  const persist = (next: CalendarWizardState) => {
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(persistableKey(userId), JSON.stringify(next));
    }
    if (userId) {
      if (remoteSyncTimer.current) clearTimeout(remoteSyncTimer.current);
      remoteSyncTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/systems/calendar/state", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
        } catch (err) {
          console.error("Calendar state save failed", err);
        }
      }, 400);
    }
  };

  const updateState = (patch: Partial<CalendarWizardState>) => {
    const next = { ...state, ...patch } as CalendarWizardState;
    persist(next);
  };

  const updateTimeArchitecture = (patch: Partial<CalendarWizardState["timeArchitecture"]>) => {
    updateState({ timeArchitecture: { ...state.timeArchitecture, ...patch } });
  };

  const updateBookingRules = (patch: Partial<CalendarWizardState["bookingRules"]>) => {
    updateState({ bookingRules: { ...state.bookingRules, ...patch } });
  };

  const updateFocusProtection = (patch: Partial<CalendarWizardState["focusProtection"]>) => {
    updateState({ focusProtection: { ...state.focusProtection, ...patch } });
  };

  const updateWeeklyReset = (patch: Partial<CalendarWizardState["weeklyReset"]>) => {
    updateState({ weeklyReset: { ...state.weeklyReset, ...patch } });
  };

  const goToStep = (step: number, key?: string) => {
    console.log("[CALENDAR_SYNC_DEBUG] goToStep called with step:", step, "current step:", state.step, "key:", key);
    updateState({ step });
    if (key) {
      setHighlightKey(key);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlightKey(null), 1200);
    }
  };

  const stepCompletion = {
    1: state.timeArchitecture.confirmedAdded,
    2: state.bookingRules.applied,
    3: state.focusProtection.createdEvent && state.focusProtection.statusBusy,
    4: state.weeklyReset.scheduled,
  } as const;

  const completedSteps = Object.values(stepCompletion).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 4) * 100);
  const canFinish = completedSteps === 4 && Boolean(state.systemOfRecord);

  const blockPlanLines = useMemo(() => {
    return categories
      .filter((c) => state.timeArchitecture.categories[c])
      .map((c) => {
        const days = state.timeArchitecture.days[c]?.length ? state.timeArchitecture.days[c].join("/") : "—";
        const hours = state.timeArchitecture.hoursPerWeek[c] ?? 0;
        const prefix = c === "Clients" ? "Client time" : c;
        return `${prefix}: ${days} (${hours}h/week)`;
      });
  }, [state.timeArchitecture]);

  const assistantContext = useMemo(() => {
    const system = state.systemOfRecord === "primary_calendar" ? "Primary calendar" : state.systemOfRecord === "booking_tool" ? "Booking tool" : "Unchosen";
    const completion = canFinish ? "Setup complete" : "Setup in progress";
    const bookingRulesSummary = `For ${state.bookingRules.audience.toLowerCase()}: allow bookings on ${state.bookingRules.allowedDays.join(", ") || "set days"} between ${state.bookingRules.timeRange || "set hours"}; require ${state.bookingRules.cancellationWindow}-hour notice; add ${state.bookingRules.bufferPre}/${state.bookingRules.bufferPost} minute buffers.`;
    return `Calendar Sync v1 context. ${completion}. Time architecture: ${blockPlanLines.join("; ")}. Booking rules: ${bookingRulesSummary}. System of record: ${system}. No API sync in v1; rely on copy/paste templates.`;
  }, [blockPlanLines, state.bookingRules, state.systemOfRecord, canFinish]);

  const quickPrompts = [
    "Rewrite my booking rules for clients",
    "Help me choose a system of record",
    "Troubleshoot double-booking conflicts",
    "Adapt the block plan for a 4-day week",
  ];

  const renderStepBadge = (index: number) => {
    const isActive = state.step === index;
    const isDone = stepCompletion[index as 1 | 2 | 3 | 4];
    const locked = index > 1 && !stepCompletion[(index - 1) as 1 | 2 | 3 | 4];
    return (
      <button
        data-step-nav={index}
        key={index}
        onClick={() => {
          console.log("[CALENDAR_SYNC_DEBUG] Step badge clicked. Index:", index, "Locked:", locked, "Current step:", state.step);
          !locked && goToStep(index);
        }}
        disabled={locked}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isActive ? "border-indigoDeep/50 bg-white shadow-soft-sm" : "border-warmCharcoal/15 bg-white/70"} ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className={`h-6 w-6 rounded-full text-xs font-semibold flex items-center justify-center ${isDone ? "bg-emerald-500 text-white" : "bg-warmCharcoal/10 text-warmCharcoal"}`}>
          {isDone ? "✓" : index}
        </span>
        <span className="text-warmCharcoal/80">Step {index}</span>
      </button>
    );
  };

  const missingItems: { label: string; step: number; key: string }[] = [];
  if (!stepCompletion[1]) missingItems.push({ label: "Add at least one focus block (Step 1 checkbox)", step: 1, key: "step1" });
  if (!stepCompletion[2]) missingItems.push({ label: "Apply a booking rule using presets (Step 2 checkbox)", step: 2, key: "step2" });
  if (!stepCompletion[3]) missingItems.push({ label: "Create a no-meeting block and set Busy (Step 3 first two checkboxes)", step: 3, key: "step3" });
  if (!stepCompletion[4]) missingItems.push({ label: "Schedule Weekly Reset (Step 4 checkbox)", step: 4, key: "step4" });
  if (!state.systemOfRecord) missingItems.push({ label: "Choose a system of record", step: state.step > 0 ? state.step : 1, key: "system" });

  return (
    <div className="grid lg:grid-cols-[1.35fr,0.65fr] gap-8 items-start">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-warmCharcoal/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Operational Mode</span>
            </div>
            <span className="text-warmCharcoal/40">•</span>
            <span>Step {state.step} of 4</span>
            <span className="text-warmCharcoal/40">•</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(renderStepBadge)}
          </div>
        </div>

        {/* DEBUG: On-screen step indicator */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 text-sm font-bold text-yellow-900">
          🔍 DEBUG: activeStep = {state.step} | Completion: 1={stepCompletion[1]}, 2={stepCompletion[2]}, 3={stepCompletion[3]}, 4={stepCompletion[4]}
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeading level="h3" className="!mb-0">Guided Setup</SectionHeading>
            <div className="flex items-center gap-2 text-xs text-warmCharcoal/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Operational outcomes over integrations. No API sync in v1.</span>
            </div>
          </div>

          <div className="grid gap-4">
            {state.step === 1 && (
              <div className={`space-y-4 ${highlightKey === "step1" ? "ring-2 ring-indigoDeep/40 rounded-xl p-1 -m-1" : ""}`}>
                <TimeArchitectureStep
                  value={state.timeArchitecture}
                  onChange={(ta) => updateTimeArchitecture(ta)}
                  onComplete={(isComplete) => {}}
                  copied={copied}
                  setCopied={setCopied}
                />
              </div>
            )}

            {state.step === 2 && (
              <div className={`space-y-4 ${highlightKey === "step2" ? "ring-2 ring-indigoDeep/40 rounded-xl p-1 -m-1" : ""}`}>
                <BookingRulesStep
                  value={state.bookingRules}
                  onChange={(br) => updateBookingRules(br)}
                  onComplete={(isComplete) => {}}
                  copied={copied}
                  setCopied={setCopied}
                />
              </div>
            )}

            {state.step === 3 && (
              <div className={`space-y-4 ${highlightKey === "step3" ? "ring-2 ring-indigoDeep/40 rounded-xl p-1 -m-1" : ""}`}>
                <FocusProtectionStep
                  value={state.focusProtection}
                  onChange={(fp) => updateFocusProtection(fp)}
                  onComplete={(isComplete) => {}}
                  copied={copied}
                  setCopied={setCopied}
                />
              </div>
            )}

            {state.step === 4 && (
              <div className={`space-y-4 ${highlightKey === "step4" ? "ring-2 ring-indigoDeep/40 rounded-xl p-1 -m-1" : ""}`}>
                <WeeklyResetStep
                  value={state.weeklyReset}
                  onChange={(wr) => updateWeeklyReset(wr)}
                  onComplete={(isComplete) => {}}
                  copied={copied}
                  setCopied={setCopied}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-warmCharcoal/60">{copied || ""}</div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateState({ step: Math.max(1, state.step - 1) })}
                disabled={state.step === 1}
              >
                Previous
              </Button>
              {state.step < 4 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateState({ step: Math.min(4, state.step + 1) })}
                  disabled={!stepCompletion[state.step as 1 | 2 | 3 | 4]}
                >
                  Next
                </Button>
              )}
              {state.step === 4 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateState({ step: 4 })}
                  disabled={!canFinish}
                >
                  Finish
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className={`p-5 space-y-3 ${highlightKey === "system" ? "ring-2 ring-indigoDeep/40" : ""}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">System of record (required)</p>
              <p className="text-sm text-warmCharcoal/75">If conflicts occur, which source wins?</p>
            </div>
            <div className="flex gap-2 text-xs text-warmCharcoal/60">
              <span>Availability sources & overrides should match this choice.</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-warmCharcoal/80">
            <label className="flex items-start gap-3 rounded-xl border border-warmCharcoal/15 bg-white/80 p-3">
              <input
                type="radio"
                name="systemOfRecord"
                checked={state.systemOfRecord === "primary_calendar"}
                onChange={() => updateState({ systemOfRecord: "primary_calendar" })}
              />
              <div>
                <p className="font-semibold">Primary calendar is system of record</p>
                <p className="text-xs text-warmCharcoal/60">Google / Outlook / Apple. Booking tools inherit rules from here.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-warmCharcoal/15 bg-white/80 p-3">
              <input
                type="radio"
                name="systemOfRecord"
                checked={state.systemOfRecord === "booking_tool"}
                onChange={() => updateState({ systemOfRecord: "booking_tool" })}
              />
              <div>
                <p className="font-semibold">Booking tool is system of record</p>
                <p className="text-xs text-warmCharcoal/60">Calendly / SavvyCal / TidyCal. Conflicts resolve using booking rules.</p>
              </div>
            </label>
          </div>
        </Card>

        <Card className={`p-5 space-y-3 ${canFinish ? "border-emerald-200 bg-emerald-50/70" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/60">Completion</p>
              <h4 className="text-lg font-marcellus text-warmCharcoal">Calendar Sync Operational Setup {canFinish ? "Complete ✅" : "In Progress"}</h4>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => updateState(defaultState)}>Restart</Button>
              <Button size="sm" variant="secondary" disabled={!canFinish} onClick={() => updateState({ step: 1 })}>Review my setup</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-warmCharcoal/80">
            {["Created at least one protected Focus Block", "Applied a booking rule via presets", "Scheduled Weekly Reset with checklist", "Chose system of record"].map((item, idx) => {
              const complete = [stepCompletion[1], stepCompletion[2], stepCompletion[4], Boolean(state.systemOfRecord)][idx];
              return (
                <div key={item} className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full ${complete ? "bg-emerald-500" : "bg-warmCharcoal/20"}`} />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
          {!canFinish && (
            <div className="rounded-lg border border-warmCharcoal/15 bg-white/80 p-3 text-sm text-warmCharcoal/80">
              <p className="font-semibold">Missing to finish:</p>
              <ul className="list-disc list-inside space-y-1 text-[13px] text-warmCharcoal/80">
                {missingItems.map((item) => (
                  <li key={item.label}>
                    <button
                      className="text-indigoDeep hover:underline"
                      onClick={() => goToStep(item.step, item.key)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-indigoDeep/70 uppercase">Ask AI About This System</p>
              <h3 className="text-lg font-marcellus text-warmCharcoal">Calendar Sync</h3>
              <p className="text-sm text-warmCharcoal/70">Ask for help adapting your time blocks, drafting booking rules, or troubleshooting conflicts.</p>
              <p className="text-[12px] text-warmCharcoal/60">Assistant responses are grounded in your Calendar Sync setup.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="rounded-full border border-indigoDeep/30 bg-indigoDeep/5 px-3 py-1 text-xs text-indigoDeep hover:bg-indigoDeep/10"
                onClick={() => copyToClipboard(prompt, setCopied)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-warmCharcoal/60">Chips copy prompts so you can paste into the assistant.</p>
        </Card>

        <SystemAIPanel
          systemName="Calendar Sync"
          context={assistantContext}
          placeholder="Ask for help adapting your time blocks, drafting booking rules, or troubleshooting conflicts."
          examples={quickPrompts}
          subtitle="Use the assistant if helpful — the setup works without integrations."
        />
      </div>
    </div>
  );
}