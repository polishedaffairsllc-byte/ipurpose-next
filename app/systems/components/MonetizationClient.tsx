"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import GPTChat from "../../components/GPTChat";
import type { IncomeStream, PricingPlan, MonetizationSnapshot, StripeMetrics } from "@/lib/monetization/dashboard";

const streamStatuses: IncomeStream["status"][] = ["active", "building", "planned", "dormant", "experimental"];
const streamTypes: IncomeStream["type"][] = ["service", "product", "membership", "program", "license", "affiliate", "other"];
const triage: Array<"low" | "med" | "high"> = ["low", "med", "high"];
const stabilityOptions: Array<"low" | "med" | "high" | "unknown"> = ["low", "med", "high", "unknown"];
const frequencyOptions: IncomeStream["frequency"][] = ["one_time", "recurring", "mixed"];
const pricingModels: PricingPlan["model"][] = ["flat", "tiered", "subscription", "hybrid", "value_based"];

const fieldInput = "w-full rounded-lg border border-warmCharcoal/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigoDeep/30 focus:border-indigoDeep/40 transition";

interface Props {
  initialStreams: IncomeStream[];
  initialPricingPlans: PricingPlan[];
  metrics: StripeMetrics;
  computed: MonetizationSnapshot["computed"];
  currency: string;
  stripe: { connected: boolean; error?: string };
  snapshotDate: string | Date | null;
  history: MonetizationSnapshot[];
  systemSummary: string;
}

interface StreamDraft extends Partial<IncomeStream> {}

export default function MonetizationClient({
  initialStreams,
  initialPricingPlans,
  metrics,
  computed,
  currency,
  stripe,
  snapshotDate,
  history,
  systemSummary,
}: Props) {
  const [streams, setStreams] = useState<IncomeStream[]>(initialStreams || []);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(initialPricingPlans || []);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPricingPlans[0]?.id ?? null);
  const [planDraft, setPlanDraft] = useState<PricingPlan | null>(initialPricingPlans[0] || null);
  const [metricsState, setMetricsState] = useState<StripeMetrics>(metrics || {});
  const [computedState, setComputedState] = useState<MonetizationSnapshot["computed"]>(computed || {});
  const [historyState, setHistoryState] = useState<MonetizationSnapshot[]>(history || []);
  const [stripeState, setStripeState] = useState(stripe);
  const [snapshotDateState, setSnapshotDateState] = useState<Date | null>(snapshotDate ? new Date(snapshotDate) : null);
  const [streamDraft, setStreamDraft] = useState<StreamDraft | null>(null);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingAutoCreated, setPricingAutoCreated] = useState(false);
  const [showStripeDetails, setShowStripeDetails] = useState(false);

  useEffect(() => {
    if (selectedPlanId) {
      const found = pricingPlans.find((p) => p.id === selectedPlanId) || null;
      setPlanDraft(found);
    } else if (pricingPlans[0]) {
      setSelectedPlanId(pricingPlans[0].id);
      setPlanDraft(pricingPlans[0]);
    }
  }, [selectedPlanId, pricingPlans]);

  const streamsByStatus = useMemo(() => {
    const map: Record<string, IncomeStream[]> = {
      Active: [],
      Building: [],
      Planned: [],
      Dormant: [],
      Experimental: [],
    };
    streams.forEach((s) => {
      const label = s.status === "active"
        ? "Active"
        : s.status === "building"
          ? "Building"
          : s.status === "planned"
            ? "Planned"
            : s.status === "dormant"
              ? "Dormant"
              : "Experimental";
      map[label].push(s);
    });
    return map;
  }, [streams]);

  const streamsEmpty = streams.length === 0;

  const formatMoney = (value?: number | null) =>
    value == null
      ? "—"
      : new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase(), maximumFractionDigits: 0 }).format(value);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 1600);
  };

  const refreshDashboard = async () => {
    try {
      const res = await fetch("/api/systems/monetization/dashboard?stripe=false", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        setMetricsState(json.data.metrics || {});
        setComputedState(json.data.computed || {});
        setHistoryState(json.data.history || []);
        setStripeState((prev) => ({ ...prev, connected: json.data.stripe?.connected ?? prev.connected, error: json.data.stripe?.error ?? prev.error }));
        setSnapshotDateState(json.data.snapshotDate ? new Date(json.data.snapshotDate) : null);
      }
    } catch (err) {
      console.error("Refresh dashboard failed", err);
    }
  };

  const openCreateStream = () => {
    setStreamDraft({
      name: "",
      type: "service",
      status: "planned",
      frequency: "mixed",
      currency: currency || "usd",
      effort: null,
      automation: null,
      stability: "unknown",
      growth: null,
      alignment: null,
      energy: null,
      audience: null,
      entryPoint: null,
      delivery: null,
      priceDisplay: "",
      stripe: { productId: "", priceId: "" },
      notes: "",
    });
    setShowStreamForm(true);
  };

  const openEditStream = (stream: IncomeStream) => {
    setStreamDraft({ ...stream, stripe: stream.stripe || { productId: "", priceId: "" } });
    setShowStreamForm(true);
  };

  const closeStreamForm = () => {
    setStreamDraft(null);
    setShowStreamForm(false);
  };

  const saveStream = async () => {
    if (!streamDraft) return;
    try {
      setSaving(true);
      const payload = { ...streamDraft } as any;
      let updated: IncomeStream | null = null;
      if (streamDraft.id) {
        const res = await fetch(`/api/systems/monetization/streams/${streamDraft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        updated = json?.data;
        if (updated) {
          setStreams((prev) => prev.map((s) => (s.id === updated!.id ? { ...s, ...updated } : s)));
        }
        notify("Stream updated");
      } else {
        const res = await fetch(`/api/systems/monetization/streams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        updated = json?.data;
        if (updated) {
          setStreams((prev) => [updated!, ...prev]);
        }
        notify("Stream added");
      }
      closeStreamForm();
      refreshDashboard();
    } catch (err) {
      console.error("Save stream failed", err);
      notify("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteStream = async (id: string) => {
    const confirmDelete = window.confirm("Delete this stream?");
    if (!confirmDelete) return;
    try {
      setSaving(true);
      await fetch(`/api/systems/monetization/streams/${id}`, { method: "DELETE" });
      setStreams((prev) => prev.filter((s) => s.id !== id));
      notify("Stream deleted");
      refreshDashboard();
    } catch (err) {
      console.error("Delete stream failed", err);
      notify("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const onDragStart = (id: string) => (event: DragEvent) => {
    event.dataTransfer.setData("stream-id", id);
  };

  const onDragOver = (event: DragEvent) => event.preventDefault();

  const onDropStatus = (status: IncomeStream["status"]) => async (event: DragEvent) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("stream-id");
    if (!id) return;
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    try {
      await fetch(`/api/systems/monetization/streams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      notify("Status updated");
      refreshDashboard();
    } catch (err) {
      console.error("Drag update failed", err);
    }
  };

  const createPlan = async () => {
    const basePlan: Partial<PricingPlan> = {
      name: "New Pricing Plan",
      model: "flat",
      inputs: {
        costToDeliver: null,
        hoursToDeliver: null,
        energyLoad: "med",
        skillIntensity: "med",
        transformationDepth: "med",
        riskBufferPct: 15,
        accessibilityGuardrails: "",
      },
      tiers: [
        { name: "Starter", priceDisplay: "", scope: "", slas: "", proof: "", boundaries: "" },
        { name: "Core", priceDisplay: "", scope: "", slas: "", proof: "", boundaries: "" },
        { name: "Premium", priceDisplay: "", scope: "", slas: "", proof: "", boundaries: "" },
      ],
    };
    try {
      setSaving(true);
      const res = await fetch(`/api/systems/monetization/pricing-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePlan),
      });
      const json = await res.json();
      if (json?.data) {
        setPricingPlans((prev) => [json.data, ...prev]);
        setSelectedPlanId(json.data.id);
        notify("Plan created");
      }
    } catch (err) {
      console.error("Create plan failed", err);
      notify("Create plan failed");
    } finally {
      setSaving(false);
    }
  };

  const savePlan = async () => {
    if (!planDraft?.id) return;
    try {
      setSaving(true);
      const tiersClean = (planDraft.tiers || []).map((tier: any) => {
        const { __expanded, ...rest } = tier;
        return rest;
      });
      const sanitized: PricingPlan = { ...planDraft, tiers: tiersClean } as PricingPlan;

      await fetch(`/api/systems/monetization/pricing-plans/${planDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });
      setPricingPlans((prev) => prev.map((p) => (p.id === planDraft.id ? { ...sanitized } : p)));
      notify("Plan saved");
    } catch (err) {
      console.error("Save plan failed", err);
      notify("Save plan failed");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlan = pricingPlans.find((p) => p.id === selectedPlanId) || planDraft;

  useEffect(() => {
    if (pricingOpen && !pricingPlans.length && !pricingAutoCreated) {
      setPricingAutoCreated(true);
      createPlan();
    }
  }, [pricingOpen, pricingPlans.length, pricingAutoCreated]);

  const tileData = streamsEmpty
    ? [
        { label: "Monthly Revenue", value: "Will populate once a stream is active", note: "", muted: true },
        { label: "Predictability", value: "Will populate once a stream is active", note: "", muted: true },
        { label: "Volatility", value: "Will populate once a stream is active", note: "", muted: true },
        { label: "Cashflow Buffer", value: "Will populate once a stream is active", note: "", muted: true },
      ]
    : [
        { label: "Monthly Revenue", value: formatMoney(metricsState.rollingRevenue), note: stripeState.connected ? "Rolling 30d (Stripe)" : "Manual / last snapshot", muted: false },
        { label: "Predictability", value: computedState.predictabilityPct != null ? `${computedState.predictabilityPct}%` : "—", note: "Recurring vs total", muted: false },
        { label: "Volatility", value: computedState.volatilityLabel ? computedState.volatilityLabel : "—", note: "Recurring stability", muted: false },
        { label: "Cashflow Buffer", value: computedState.cashflowBufferWeeks != null ? `${computedState.cashflowBufferWeeks} weeks` : "—", note: "Runway", muted: false },
      ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm font-marcellus">
        <span className={`px-3 py-1 rounded-full border ${stripeState.connected ? "border-emerald-200 text-emerald-800 bg-emerald-50" : "border-amber-200 text-amber-800 bg-amber-50"}`}>
          {stripeState.connected ? "Stripe connected" : "Manual mode active (Stripe optional)"}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setShowStripeDetails((prev) => !prev)} className="text-indigoDeep">
          {showStripeDetails ? "Hide Stripe details" : "Connect Stripe"}
        </Button>
        {snapshotDateState && <span className="text-xs text-warmCharcoal/60">Last snapshot: {snapshotDateState.toLocaleString?.() || ""}</span>}
        {statusMessage && <span className="text-xs text-emerald-700">{statusMessage}</span>}
        {saving && <span className="text-xs text-warmCharcoal/60">Saving…</span>}
      </div>

      {showStripeDetails && (
        <Card className="p-4 bg-white border border-amber-200 text-sm font-marcellus space-y-2">
          <p className="font-semibold text-warmCharcoal">Manual mode active. Stripe can be connected later to automate metrics.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lavenderViolet/40 focus:ring-offset-2 px-4 py-2 text-xs text-indigoDeep hover:bg-lavenderViolet/10 hover:shadow-soft-sm">
              Open Stripe Dashboard
            </a>
            {stripeState.error && <span className="text-xs text-amber-700">{stripeState.error}</span>}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-4 gap-4 rounded-3xl bg-white/80 border border-lavenderViolet/15 p-4 shadow-soft-md">
        {tileData.map((item) => (
          <Card key={item.label} className={`p-4 bg-white/70 border border-warmCharcoal/5 ${item.muted ? "opacity-60" : ""}`}>
            <p className="text-xs uppercase tracking-[0.22em] text-warmCharcoal/55 mb-1 font-marcellus">{item.label}</p>
            <div className="text-2xl font-marcellus text-warmCharcoal leading-tight">{item.value}</div>
            {item.note && <p className="text-xs text-warmCharcoal/60 mt-1 font-marcellus">{item.note}</p>}
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="primary" size="sm" onClick={openCreateStream}>{streamsEmpty ? "Add your first revenue stream" : "+ Add Stream"}</Button>
        {!streamsEmpty && <Button variant="secondary" size="sm" onClick={() => setPricingOpen(true)}>Pricing Strategy</Button>}
        {!streamsEmpty && <div className="text-xs text-warmCharcoal/65 font-marcellus">Drag cards between columns to update status. Click to edit details.</div>}
      </div>

      <div className="grid lg:grid-cols-[1.25fr,0.95fr] gap-6 items-start">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-warmCharcoal/55 mb-1 font-marcellus">Step 1: Define how money enters the system</p>
              <h3 className="text-xl font-marcellus text-warmCharcoal">Income Streams</h3>
            </div>
            <span className="text-2xl">📊</span>
          </div>
          {streamsEmpty ? (
            <div className="space-y-3 text-sm font-marcellus text-warmCharcoal/75">
              <div className="rounded-xl border border-warmCharcoal/10 bg-white/80 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-warmCharcoal">Add your first revenue stream</p>
                  <p className="text-xs text-warmCharcoal/65">Start with a name and a status. Everything else can be added later.</p>
                </div>
                <Button variant="primary" size="sm" onClick={openCreateStream}>+ Add Stream</Button>
              </div>
              <div className="rounded-xl border border-dashed border-warmCharcoal/15 bg-warmCharcoal/3 p-4 text-xs text-warmCharcoal/65">
                Kanban will unlock once a stream exists. Active is shown first so you can keep focus tight.
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3 text-sm font-marcellus">
              {( ["Active","Building","Planned"] as const).map((col) => (
                <div key={col} className="rounded-xl border border-warmCharcoal/10 bg-white/80 p-3 space-y-2" onDragOver={onDragOver} onDrop={onDropStatus(col.toLowerCase() as IncomeStream["status"]) }>
                  <p className="text-xs uppercase tracking-[0.18em] text-warmCharcoal/55">{col}</p>
                  {streamsByStatus[col].length === 0 && (
                    <div className="text-xs text-warmCharcoal/60">No streams yet. Add one.</div>
                  )}
                  {streamsByStatus[col].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-warmCharcoal/10 bg-white/90 p-3 space-y-1 cursor-move"
                      draggable
                      onDragStart={onDragStart(item.id)}
                      onClick={() => openEditStream(item)}
                    >
                      <div className="flex items-center justify-between text-warmCharcoal text-sm font-semibold">
                        <span>{item.name}</span>
                        <span className="text-xs text-warmCharcoal/60">{item.priceDisplay || (item.priceValue ? formatMoney(item.priceValue) : "—")}</span>
                      </div>
                      <p className="text-xs text-warmCharcoal/60">Audience: {item.audience || "—"}</p>
                      <div className="text-[11px] text-warmCharcoal/60 flex flex-wrap gap-2">
                        <span>Effort: {item.effort || "—"}</span>
                        <span>Automation: {item.automation || "—"}</span>
                        <span>Stability: {item.stability || "—"}</span>
                        <span>Growth: {item.growth || "—"}</span>
                        <span>Alignment: {item.alignment || "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="md:col-span-3 grid md:grid-cols-2 gap-3">
                {( ["Dormant","Experimental"] as const).map((col) => (
                  <div key={col} className="rounded-xl border border-warmCharcoal/10 bg-white/80 p-3 space-y-2" onDragOver={onDragOver} onDrop={onDropStatus(col.toLowerCase() as IncomeStream["status"]) }>
                    <p className="text-xs uppercase tracking-[0.18em] text-warmCharcoal/55">{col}</p>
                    {streamsByStatus[col].length === 0 && (
                      <div className="text-xs text-warmCharcoal/60">No streams yet.</div>
                    )}
                    {streamsByStatus[col].map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-warmCharcoal/10 bg-white/90 p-3 space-y-1 cursor-move"
                        draggable
                        onDragStart={onDragStart(item.id)}
                        onClick={() => openEditStream(item)}
                      >
                        <div className="flex items-center justify-between text-warmCharcoal text-sm font-semibold">
                          <span>{item.name}</span>
                          <span className="text-xs text-warmCharcoal/60">{item.priceDisplay || (item.priceValue ? formatMoney(item.priceValue) : "—")}</span>
                        </div>
                        <div className="text-[11px] text-warmCharcoal/60 flex flex-wrap gap-2">
                          <span>Reliability: {item.stability || "—"}</span>
                          <span>Energy: {item.energy || "—"}</span>
                          <span>Alignment: {item.alignment || "—"}</span>
                          <span>Automation: {item.automation || "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs text-warmCharcoal/65 font-marcellus pt-1">Outputs: prioritization clarity, focus guidance, stream rationalization.</div>
        </Card>

        <Card className="p-5 space-y-3">
          <button className="w-full text-left" onClick={() => setPricingOpen((prev) => !prev)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-warmCharcoal/55 mb-1 font-marcellus">Step 2: Pricing Strategy</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Planner tools</h3>
              </div>
              <span className="text-sm text-indigoDeep">{pricingOpen ? "Collapse" : "Expand"}</span>
            </div>
          </button>

          {pricingOpen && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className={fieldInput + " max-w-xs"}
                  value={selectedPlanId ?? ""}
                  onChange={(e) => setSelectedPlanId(e.target.value || null)}
                >
                  {pricingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                  {!pricingPlans.length && <option value="">Creating starter plan…</option>}
                </select>
                <Button variant="ghost" size="sm" onClick={savePlan} disabled={!planDraft?.id}>Save Plan</Button>
              </div>

              {selectedPlan ? (
                <div className="space-y-3 text-sm font-marcellus text-warmCharcoal/80">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Plan name">
                      <input className={fieldInput} value={planDraft?.name || ""} onChange={(e) => setPlanDraft((prev) => prev ? { ...prev, name: e.target.value } : prev)} />
                    </Field>
                    <Field label="Model">
                      <select className={fieldInput} value={planDraft?.model || "flat"} onChange={(e) => setPlanDraft((prev) => prev ? { ...prev, model: e.target.value as PricingPlan["model"] } : prev)}>
                        {pricingModels.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </Field>
                    <Field label="Linked stream (id)">
                      <input className={fieldInput} value={planDraft?.offerRefStreamId || ""} onChange={(e) => setPlanDraft((prev) => prev ? { ...prev, offerRefStreamId: e.target.value } : prev)} placeholder="Optional" />
                    </Field>
                  </div>

                  <div className="space-y-3">
                    {(planDraft?.tiers || []).map((tier, idx) => (
                      <div key={idx} className="rounded-xl border border-warmCharcoal/10 bg-white/90 p-3 space-y-2">
                        <button className="w-full text-left" onClick={() => setPlanDraft((prev) => {
                          if (!prev) return prev;
                          const nextTiers = [...(prev.tiers || [])];
                          const current = nextTiers[idx] as any;
                          const expanded = current.__expanded ?? false;
                          nextTiers[idx] = { ...current, __expanded: !expanded };
                          return { ...prev, tiers: nextTiers } as any;
                        })}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-warmCharcoal">{tier.name || `Tier ${idx + 1}`}</span>
                            <span className="text-xs text-indigoDeep">{(tier as any).__expanded ? "Hide" : "Show"} details</span>
                          </div>
                          <p className="text-xs text-warmCharcoal/60">Price display: {tier.priceDisplay || "—"}</p>
                        </button>
                        {(tier as any).__expanded && (
                          <div className="space-y-2 pt-2 border-t border-warmCharcoal/10">
                            <Field label="Tier name">
                              <input className={fieldInput} value={tier.name || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, name: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                            <Field label="Price display">
                              <input className={fieldInput} value={tier.priceDisplay || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, priceDisplay: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                            <Field label="Scope">
                              <textarea className={fieldInput} rows={2} value={tier.scope || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, scope: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                            <Field label="SLAs">
                              <textarea className={fieldInput} rows={2} value={tier.slas || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, slas: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                            <Field label="Proof">
                              <textarea className={fieldInput} rows={2} value={tier.proof || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, proof: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                            <Field label="Boundaries">
                              <textarea className={fieldInput} rows={2} value={tier.boundaries || ""} onChange={(e) => setPlanDraft((prev) => {
                                if (!prev) return prev;
                                const nextTiers = [...(prev.tiers || [])];
                                nextTiers[idx] = { ...tier, boundaries: e.target.value } as any;
                                return { ...prev, tiers: nextTiers };
                              })} />
                            </Field>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-warmCharcoal/65 font-marcellus">Need more? Save core details first; add depth later.</div>
                </div>
              ) : (
                <div className="text-sm text-warmCharcoal/70">Creating starter plan…</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {showStreamForm && streamDraft && (
        <Card className="p-5 space-y-3 border-indigoDeep/20 bg-white shadow-soft-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-marcellus text-warmCharcoal">{streamDraft.id ? "Edit Stream" : "Add Stream"}</h3>
            <div className="flex gap-2">
              {streamDraft.id && <Button variant="ghost" size="sm" onClick={() => deleteStream(streamDraft.id!)}>Delete</Button>}
              <Button variant="ghost" size="sm" onClick={closeStreamForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveStream}>{streamDraft.id ? "Save" : "Create"}</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm font-marcellus text-warmCharcoal/80">
            <Field label="Name"><input className={fieldInput} value={streamDraft.name || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), name: e.target.value }))} /></Field>
            <Field label="Type">
              <select className={fieldInput} value={streamDraft.type || "service"} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), type: e.target.value as IncomeStream["type"] }))}>
                {streamTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={fieldInput} value={streamDraft.status || "planned"} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), status: e.target.value as IncomeStream["status"] }))}>
                {streamStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              {streamDraft.status === "active" && <p className="text-[11px] text-emerald-700/80 pt-1">Optional: link pricing or Stripe later; no blockers.</p>}
            </Field>
            <Field label="Price display"><input className={fieldInput} value={streamDraft.priceDisplay ?? ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), priceDisplay: e.target.value }))} placeholder="$2,500 / cohort" /></Field>
            <Field label="Audience"><input className={fieldInput} value={streamDraft.audience ?? ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), audience: e.target.value }))} /></Field>
            <Field label="Entry point"><input className={fieldInput} value={streamDraft.entryPoint ?? ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), entryPoint: e.target.value }))} /></Field>
            <Field label="Delivery"><input className={fieldInput} value={streamDraft.delivery ?? ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), delivery: e.target.value }))} /></Field>
            <Field label="Frequency">
              <select className={fieldInput} value={streamDraft.frequency || "mixed"} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), frequency: e.target.value as IncomeStream["frequency"] }))}>
                {frequencyOptions.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Effort">
              <select className={fieldInput} value={streamDraft.effort || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), effort: e.target.value as any }))}>
                <option value="">—</option>
                {triage.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Automation">
              <select className={fieldInput} value={streamDraft.automation || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), automation: e.target.value as any }))}>
                <option value="">—</option>
                {triage.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Stability">
              <select className={fieldInput} value={streamDraft.stability || "unknown"} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), stability: e.target.value as any }))}>
                {stabilityOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Growth">
              <select className={fieldInput} value={streamDraft.growth || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), growth: e.target.value as any }))}>
                <option value="">—</option>
                {triage.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Alignment">
              <select className={fieldInput} value={streamDraft.alignment || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), alignment: e.target.value as any }))}>
                <option value="">—</option>
                {triage.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Energy">
              <select className={fieldInput} value={streamDraft.energy || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), energy: e.target.value as any }))}>
                <option value="">—</option>
                {triage.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Stripe productId"><input className={fieldInput} value={streamDraft.stripe?.productId || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), stripe: { ...(prev?.stripe || {}), productId: e.target.value } }))} placeholder="Optional" /></Field>
            <Field label="Stripe priceId"><input className={fieldInput} value={streamDraft.stripe?.priceId || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), stripe: { ...(prev?.stripe || {}), priceId: e.target.value } }))} placeholder="Optional" /></Field>
            <Field label="Notes" className="md:col-span-2">
              <textarea className={fieldInput} rows={3} value={streamDraft.notes || ""} onChange={(e) => setStreamDraft((prev) => ({ ...(prev || {}), notes: e.target.value }))} />
            </Field>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.15fr,0.85fr] gap-6 items-start">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-warmCharcoal/55 mb-1 font-marcellus">Step 3: History</p>
              <h3 className="text-xl font-marcellus text-warmCharcoal">Snapshot log</h3>
            </div>
          </div>
          {historyState.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm font-marcellus text-warmCharcoal/80">
                <thead className="text-xs uppercase tracking-[0.14em] text-warmCharcoal/60">
                  <tr>
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Rolling Revenue</th>
                    <th className="text-left py-2 pr-4">Predictability</th>
                    <th className="text-left py-2 pr-4">Buffer</th>
                  </tr>
                </thead>
                <tbody>
                  {historyState.map((snap) => (
                    <tr key={snap.id} className="border-t border-warmCharcoal/10">
                      <td className="py-2 pr-4">{snap.createdAt ? new Date(snap.createdAt as any).toLocaleString?.() : "—"}</td>
                      <td className="py-2 pr-4">{formatMoney(snap.stripeMetrics?.rollingRevenue)}</td>
                      <td className="py-2 pr-4">{snap.computed?.predictabilityPct != null ? `${snap.computed.predictabilityPct}%` : "—"}</td>
                      <td className="py-2 pr-4">{snap.computed?.cashflowBufferWeeks != null ? `${snap.computed.cashflowBufferWeeks}w` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-warmCharcoal/60">No snapshots yet. Manual mode keeps running; add a stream first.</div>
          )}
        </Card>

        <Card className="p-4 space-y-2 border border-lavenderViolet/20 bg-white/90">
          <p className="text-xs uppercase tracking-[0.18em] text-warmCharcoal/55 font-marcellus">Get help with this step</p>
          <div className="space-y-1 text-sm text-warmCharcoal/75 font-marcellus">
            {streamsEmpty && <p>• Help me define my first revenue stream</p>}
            {!streamsEmpty && pricingOpen && <p>• Sanity-check this pricing</p>}
            {historyState.length > 0 && <p>• What patterns should I watch for?</p>}
            {!streamsEmpty && !pricingOpen && historyState.length === 0 && <p>• What should I focus on right now?</p>}
          </div>
          <div className="h-[240px]">
            <GPTChat
              domain="systems"
              title="Monetization Coach"
              placeholder={streamsEmpty ? "Help me define my first revenue stream" : pricingOpen ? "Sanity-check this pricing" : "What should I focus on next?"}
              systemContext={systemSummary}
              hideHeader
              hideUsageMeta
              className="h-full"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs uppercase tracking-[0.12em] text-warmCharcoal/60">{label}</span>
      {children}
    </label>
  );
}
