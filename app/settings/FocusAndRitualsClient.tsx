"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import Input from "../components/IPInput";

interface MembershipInfo {
  tier?: string | null;
  renewalDate?: string | null;
  status?: string | null;
  billingPortalUrl?: string | null;
  upgradeUrl?: string | null;
}

interface FocusAndRitualsClientProps {
  membership: MembershipInfo;
}

type PatternKey = "deep_work" | "client_day" | "recovery_day" | "custom";

type InitiativeMode = "ask" | "suggest" | "auto";

type AiSnapshot = {
  tone: number;
  detail: number;
  initiative: InitiativeMode;
  modules: Record<string, boolean>;
};

const PATTERNS: Array<{
  key: PatternKey;
  title: string;
  description: string;
  calendarPreview: string;
  notifications: string;
  aiPosture: string;
  quickTips: string[];
}> = [
  {
    key: "deep_work",
    title: "Deep Work Mode",
    description: "Protect blocks for strategy, writing, or creative output.",
    calendarPreview: "09:00–12:00 Deep Work • 13:00–14:00 Admin • 15:00–16:00 Buffer",
    notifications: "Quiet hours 08:30–12:30",
    aiPosture: "Keep me focused. Interrupt only for critical items.",
    quickTips: ["Hold boundaries", "Batch outreach", "Journal wins at 17:00"],
  },
  {
    key: "client_day",
    title: "Client-Facing Day",
    description: "Meetings, delivery, and high-touch communication.",
    calendarPreview: "10:00–13:00 Client Calls • 14:00–15:00 Follow Ups",
    notifications: "Smart summaries after each block",
    aiPosture: "Keep me warm & polished. Draft summaries automatically.",
    quickTips: ["Prep intent per call", "Capture decisions", "Send recap notes"],
  },
  {
    key: "recovery_day",
    title: "Recovery Day",
    description: "Integration, rest, and gentle review.",
    calendarPreview: "09:30 Reset Walk • 11:00 Integration Notes • 15:00 Visioning",
    notifications: "Soft reminders only",
    aiPosture: "Keep me gentle. Offer prompts to reflect, not produce.",
    quickTips: ["Hydrate ops list", "Close open loops", "Plan next sprint"],
  },
  {
    key: "custom",
    title: "Custom",
    description: "Start from your own recipe and reuse it as needed.",
    calendarPreview: "Build a bespoke cadence",
    notifications: "Choose per block",
    aiPosture: "Match the tone I set per module.",
    quickTips: ["Set intention", "Pair with playlist", "Publish summary"],
  },
];

const defaultAiSnapshot: AiSnapshot = {
  tone: 45,
  detail: 55,
  initiative: "suggest",
  modules: {
    calendarSync: true,
    workflowBuilder: true,
    reflections: false,
    labs: false,
  },
};

const toneValueToLabel = (value: number) => {
  if (value <= 33) return "supportive";
  if (value >= 67) return "direct";
  return "balanced";
};

const detailValueToLabel = (value: number) => {
  if (value <= 33) return "brief";
  if (value >= 67) return "thorough";
  return "balanced";
};

export default function FocusAndRitualsClient({ membership }: FocusAndRitualsClientProps) {
  const today = useMemo(() => new Date(), []);
  const isoDate = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [selectedPattern, setSelectedPattern] = useState<PatternKey>("deep_work");
  const [appliedPattern, setAppliedPattern] = useState<PatternKey | null>(null);
  const [aiSnapshot, setAiSnapshot] = useState<AiSnapshot>(defaultAiSnapshot);
  const [initialSnapshot, setInitialSnapshot] = useState<AiSnapshot | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    const hydratePreferences = async () => {
      try {
        const response = await fetch("/api/preferences");
        if (!response.ok || ignore) {
          return;
        }
        const payload = await response.json();
        if (ignore) return;
        const data = payload?.data;
        const rituals = data?.focusRituals || {};
        const savedPattern = rituals?.todayPattern?.key as PatternKey | undefined;
        if (savedPattern) {
          setSelectedPattern(savedPattern);
          setAppliedPattern(savedPattern);
        }
        const ai = rituals?.ai || {};
        const incomingSnapshot: AiSnapshot = {
          tone: typeof ai.tone === "number" ? ai.tone : defaultAiSnapshot.tone,
          detail: typeof ai.detail === "number" ? ai.detail : defaultAiSnapshot.detail,
          initiative: ai.initiative ?? defaultAiSnapshot.initiative,
          modules: {
            calendarSync: ai.modules?.calendarSync ?? defaultAiSnapshot.modules.calendarSync,
            workflowBuilder: ai.modules?.workflowBuilder ?? defaultAiSnapshot.modules.workflowBuilder,
            reflections: ai.modules?.reflections ?? defaultAiSnapshot.modules.reflections,
            labs: ai.modules?.labs ?? defaultAiSnapshot.modules.labs,
          },
        };
        setAiSnapshot(incomingSnapshot);
        setInitialSnapshot(incomingSnapshot);
      } catch (error) {
        console.warn("Failed to load preferences", error);
      } finally {
        if (!ignore) {
          setLoadingPreferences(false);
        }
      }
    };

    hydratePreferences();
    return () => {
      ignore = true;
    };
  }, []);

  const membershipTier = membership.tier || "DEEPENING";
  const renewalDisplay = useMemo(() => {
    if (!membership.renewalDate) return "—";
    const parsed = new Date(membership.renewalDate);
    return isNaN(parsed.getTime())
      ? membership.renewalDate
      : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, [membership.renewalDate]);

  const isDirty = useMemo(() => {
    const patternDirty = appliedPattern ? selectedPattern !== appliedPattern : true;
    if (!initialSnapshot) return patternDirty;
    const aiDirty =
      aiSnapshot.tone !== initialSnapshot.tone ||
      aiSnapshot.detail !== initialSnapshot.detail ||
      aiSnapshot.initiative !== initialSnapshot.initiative ||
      Object.keys(aiSnapshot.modules).some(
        key => aiSnapshot.modules[key] !== initialSnapshot.modules[key]
      );
    return patternDirty || aiDirty;
  }, [appliedPattern, selectedPattern, aiSnapshot, initialSnapshot]);

  const handleModuleToggle = (moduleKey: keyof AiSnapshot["modules"]) => {
    setAiSnapshot(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey],
      },
    }));
  };

  const handleApply = async () => {
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/focus/apply-pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternKey: selectedPattern,
          date: isoDate,
          aiPreferences: {
            tone: aiSnapshot.tone,
            detail: aiSnapshot.detail,
            initiative: aiSnapshot.initiative,
            modules: aiSnapshot.modules,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to apply pattern");
      }

      setAppliedPattern(selectedPattern);
      setInitialSnapshot({
        tone: aiSnapshot.tone,
        detail: aiSnapshot.detail,
        initiative: aiSnapshot.initiative,
        modules: { ...aiSnapshot.modules },
      });
      setStatusMessage({ type: "success", message: "Pattern applied. Calendar + nudges updated." });
    } catch (error: any) {
      setStatusMessage({ type: "error", message: error.message || "Something went wrong" });
    } finally {
      setIsApplying(false);
    }
  };

  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-warmCharcoal/80 to-salmonPeach/30 text-white p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm tracking-[0.4em] uppercase text-white/60">Focus & Rituals</p>
          <h1 className="heading-hero text-white">Set the tone for today</h1>
          <p className="text-white/80 font-marcellus text-base md:text-lg">
            Choose a pattern, update AI posture, and apply everything at once. Your calendar holds,
            notifications, and co-processor preferences stay in sync.
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-marcellus">
            <span className="px-4 py-1 rounded-full bg-white/15 border border-white/20">{todayLabel}</span>
            <span className="px-4 py-1 rounded-full bg-white border border-white/20 text-indigo-900">
              Today&apos;s Pattern: {appliedPattern ? PATTERNS.find(p => p.key === appliedPattern)?.title : "None"}
            </span>
            {loadingPreferences && (
              <span className="px-4 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                Loading saved preferences…
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-48 md:w-64 opacity-20 bg-gradient-to-b from-white to-transparent" />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <SectionHeading level="h2">Daily Patterns</SectionHeading>
            <p className="text-sm text-warmCharcoal/70 font-marcellus">Select one pattern per day. You can edit the recipe later.</p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/60">One active at a time</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {PATTERNS.map(pattern => {
            const isActive = selectedPattern === pattern.key;
            return (
              <button
                key={pattern.key}
                type="button"
                onClick={() => setSelectedPattern(pattern.key)}
                className={`text-left rounded-2xl border px-6 py-6 transition-all ${
                  isActive
                    ? "bg-white border-indigoDeep/30 shadow-soft-lg"
                    : "bg-white/70 border-warmCharcoal/10 hover:border-indigoDeep/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-marcellus text-2xl text-warmCharcoal">{pattern.title}</h3>
                  <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${isActive ? "text-indigoDeep" : "text-warmCharcoal/50"}`}>
                    {isActive ? "Selected" : "Tap to use"}
                  </span>
                </div>
                <p className="text-sm text-warmCharcoal/70 font-marcellus mb-4">{pattern.description}</p>
                <div className="space-y-2 text-sm font-mono text-warmCharcoal/80">
                  <p>📅 {pattern.calendarPreview}</p>
                  <p>🔔 {pattern.notifications}</p>
                  <p>🤖 {pattern.aiPosture}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-warmCharcoal/60">
                  {pattern.quickTips.map(tip => (
                    <span key={tip} className="px-3 py-1 rounded-full bg-warmCharcoal/5 font-marcellus">
                      {tip}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card accent="gold" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/50">Membership Status</p>
              <h3 className="font-marcellus text-2xl text-warmCharcoal">{membershipTier} Tier</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-softGold/30 text-warmCharcoal">
              {membership.status ?? "active"}
            </span>
          </div>
          <div className="grid gap-3 text-sm font-marcellus text-warmCharcoal/75">
            <div className="flex items-center justify-between">
              <span>Renewal</span>
              <strong>{renewalDisplay}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Access</span>
              <strong>Systems + Focus Suite</strong>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {membership.billingPortalUrl ? (
              <Button href={membership.billingPortalUrl} variant="ghost" size="sm" className="w-full justify-center">
                Manage Billing
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="w-full justify-center" disabled>
                Manage Billing
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              href={membership.upgradeUrl ?? "/enroll"}
            >
              Upgrade or Gift a Seat
            </Button>
          </div>
          <p className="text-xs text-warmCharcoal/60">
            Need help? <a className="underline" href="mailto:support@ipurpose.com">support@ipurpose.com</a>
          </p>
        </Card>

        <Card accent="lavender" className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/50">AI Co-Processor</p>
            <h3 className="font-marcellus text-2xl text-warmCharcoal">Tone & Initiative</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-warmCharcoal/70 mb-2">
                <span> Tone: Supportive ↔ Direct </span>
                <span className="font-mono text-warmCharcoal/60">{toneValueToLabel(aiSnapshot.tone)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={aiSnapshot.tone}
                onChange={event => setAiSnapshot(prev => ({ ...prev, tone: Number(event.target.value) }))}
                className="w-full accent-indigoDeep"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-warmCharcoal/70 mb-2">
                <span> Detail: Brief ↔ Thorough </span>
                <span className="font-mono text-warmCharcoal/60">{detailValueToLabel(aiSnapshot.detail)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={aiSnapshot.detail}
                onChange={event => setAiSnapshot(prev => ({ ...prev, detail: Number(event.target.value) }))}
                className="w-full accent-salmonPeach"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-warmCharcoal/70 mb-2">Initiative</p>
              <div className="flex flex-wrap gap-3">
                {[{ key: "ask", label: "Only when I ask" }, { key: "suggest", label: "Suggest when relevant" }, { key: "auto", label: "Auto-trigger in modules" }].map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setAiSnapshot(prev => ({ ...prev, initiative: option.key as InitiativeMode }))}
                    className={`px-4 py-2 rounded-full border text-xs font-marcellus transition ${
                      aiSnapshot.initiative === option.key
                        ? "border-indigoDeep bg-indigoDeep/10 text-indigoDeep"
                        : "border-warmCharcoal/15 text-warmCharcoal/70 hover:border-indigoDeep/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-warmCharcoal/70 mb-2">Modules</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(aiSnapshot.modules).map(([moduleKey, enabled]) => (
                  <button
                    key={moduleKey}
                    type="button"
                    onClick={() => handleModuleToggle(moduleKey as keyof AiSnapshot["modules"])}
                    className={`px-3 py-1 rounded-full text-xs font-marcellus border transition ${
                      enabled ? "border-indigoDeep bg-indigoDeep/10 text-indigoDeep" : "border-warmCharcoal/15 text-warmCharcoal/60"
                    }`}
                  >
                    {moduleKey.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading level="h2">Account Settings</SectionHeading>
          <span className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/60">Rarely used</span>
        </div>
        <details className="rounded-2xl border border-warmCharcoal/10 bg-white/80 px-6 py-5" open>
          <summary className="cursor-pointer font-marcellus text-lg text-warmCharcoal mb-4">
            Basic Profile & Export
          </summary>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-warmCharcoal/70 mb-1">Display Name</label>
              <Input placeholder="Enter your name" defaultValue="Soul Leader" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-warmCharcoal/70 mb-1">Email</label>
              <Input placeholder="you@email.com" defaultValue="soul@ipurpose.com" type="email" className="w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-warmCharcoal/70 mb-1">Bio</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-warmCharcoal/15 rounded-lg text-sm text-warmCharcoal font-marcellus focus:outline-none focus:ring-2 focus:ring-indigoDeep/20"
                placeholder="Share a bit about your flow"
                defaultValue="Purpose-driven entrepreneur helping others align their work with their soul."
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="primary" size="sm">Save Profile</Button>
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              Delete Account
            </Button>
            <Button variant="ghost" size="sm">Export Data</Button>
          </div>
        </details>
      </section>

      <div className="flex flex-col gap-4 items-end">
        {statusMessage && (
          <div
            className={`text-sm font-marcellus ${
              statusMessage.type === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {statusMessage.message}
          </div>
        )}
        <Button
          variant="primary"
          size="md"
          className="px-8"
          disabled={!isDirty || isApplying || loadingPreferences}
          onClick={handleApply}
        >
          {isApplying ? "Applying…" : isDirty ? "Apply Today’s Pattern" : "Applied"}
        </Button>
      </div>
    </div>
  );
}
