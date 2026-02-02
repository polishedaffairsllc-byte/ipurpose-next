"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import SectionHeading from "../../components/SectionHeading";
import SystemAIPanel from "./SystemAIPanel";

import type { OfferDocument, OfferStateDoc, OfferTier, Delivery, Frequency, Rating, OfferStatus } from "@/lib/offer-architecture";

const baseTiers: OfferTier[] = ["entry", "core", "premium", "experimental"] as OfferTier[];
const deliveries: Delivery[] = ["live", "async", "hybrid", "automated"];
const frequencies: Frequency[] = ["one_time", "recurring"];
const rating: Rating[] = ["low", "med", "high", null];
const statuses: OfferStatus[] = ["building", "active", "planned", "retiring", "experimental"];

interface Props {
  initialOffers: OfferDocument[];
  initialState: OfferStateDoc;
  currency: string;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function OfferArchitectureClient({ initialOffers, initialState, currency }: Props) {
  const [offers, setOffers] = useState<OfferDocument[]>(initialOffers);
  const [stateDoc, setStateDoc] = useState<OfferStateDoc>(initialState || {});
  const [selectedId, setSelectedId] = useState<string | null>(initialOffers[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const selected = useMemo(() => offers.find((o) => o.id === selectedId) || offers[0], [offers, selectedId]);

  useEffect(() => {
    if (!selected && offers[0]) setSelectedId(offers[0].id);
  }, [offers, selected]);

  const fieldInput = "w-full rounded-lg border border-warmCharcoal/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigoDeep/30 focus:border-indigoDeep/40 transition";

  const notifySaved = () => {
    setSaving(false);
    setStatusMessage("Saved");
    setTimeout(() => setStatusMessage(null), 1400);
  };

  const patchOffer = debounce(async (id: string, patch: Partial<OfferDocument>) => {
    setSaving(true);
    await fetch(`/api/systems/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date() } : o)));
    notifySaved();
  });

  const patchState = debounce(async (patch: Partial<OfferStateDoc>) => {
    setSaving(true);
    await fetch(`/api/systems/offers/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setStateDoc((prev) => ({ ...prev, ...patch, updatedAt: new Date() }));
    notifySaved();
  });

  const createOfferBase = async (payload: { name: string; tier: OfferTier; delivery: Delivery; frequency: Frequency }) => {
    setSaving(true);
    setCreateError(null);
    try {
      const inferredEnergy: Rating = payload.delivery === "live" ? "high" : payload.delivery === "hybrid" ? "med" : "low";
      const inferredReliability: Rating = payload.delivery === "live" ? "med" : "high";
      const res = await fetch(`/api/systems/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          tier: payload.tier,
          delivery: payload.delivery,
          frequency: payload.frequency,
          status: "building",
          energy: inferredEnergy,
          reliability: inferredReliability,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        throw new Error(json?.error || "Failed to create offer");
      }
      setOffers((prev) => [json.data, ...prev]);
      setSelectedId(json.data.id);
      notifySaved();
    } catch (err: any) {
      setCreateError(err?.message || "Could not create offer.");
      setSaving(false);
    }
  };

  const updateSelected = (patch: Partial<OfferDocument>) => {
    if (!selected) return;
    setOffers((prev) => prev.map((o) => (o.id === selected.id ? { ...o, ...patch } : o)));
    patchOffer(selected.id, patch);
  };

  const updateCanvas = (patch: Partial<NonNullable<OfferDocument["canvas"]>>) => {
    if (!selected) return;
    const nextCanvas = { ...(selected.canvas || {}), ...patch };
    updateSelected({ canvas: nextCanvas });
  };

  const updateLadder = (field: keyof NonNullable<OfferDocument["ladder"]>, value: string | null) => {
    if (!selected) return;
    const nextLadder = { ...(selected.ladder || {}), [field]: value };
    updateSelected({ ladder: nextLadder });
  };

  const updatePricingInputs = (patch: Partial<NonNullable<OfferStateDoc["pricing"]>["inputs"]>) => {
    patchState({ pricing: { ...(stateDoc.pricing || {}), inputs: { ...(stateDoc.pricing?.inputs || {}), ...patch } } });
  };

  const formatMoney = (value?: number | null) =>
    value == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: currency?.toUpperCase?.() || "USD", maximumFractionDigits: 0 }).format(value);

  const selectedReady = Boolean(selected?.name && selected?.tier && selected?.delivery && selected?.frequency);
  const scopeDefined = Boolean(selected?.canvas?.scope?.trim());
  const deliveryUnlocked = selected ? selected.status === "active" || selected.delivery !== "automated" : false;
  const hasTwoOffers = offers.length >= 2;

  const boardByStatus = useMemo(() => {
    const map: Record<OfferStatus, OfferDocument[]> = {
      active: [],
      building: [],
      planned: [],
      retiring: [],
      experimental: [],
    };
    offers.forEach((o) => map[o.status]?.push(o));
    return map;
  }, [offers]);

  const warnings = useMemo(() => {
    if (!selected) return [] as string[];
    const list: string[] = [];
    if (selected.delivery === "live" && (offers.filter((o) => o.delivery === "live").length > 2)) list.push("Over-commitment risk: many live offers running.");
    if (selected.frequency === "recurring" && selected.energy === "high") list.push("Recurring + high energy may be unsustainable.");
    return list;
  }, [offers, selected]);

  const readinessHint = selectedReady ? "Next: Define scope to unlock pricing." : "Step 1: create or select an offer.";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading level="h2" className="!mb-0">Offer Architecture</SectionHeading>
        {statusMessage && <span className="text-xs text-emerald-700">{statusMessage}</span>}
        {saving && <span className="text-xs text-warmCharcoal/60">Saving…</span>}
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Create Offer (Step 1)</p>
            <h3 className="text-xl font-marcellus text-warmCharcoal">Single entry point</h3>
            <p className="text-sm text-warmCharcoal/70">Name it, set tier, delivery mode, and frequency. Status defaults to building.</p>
          </div>
          <span className="text-2xl">🟢</span>
        </div>
        <CreateOfferForm onCreate={createOfferBase} error={createError} fieldInput={fieldInput} />
        <p className="text-xs text-warmCharcoal/60">One primary action: create. Advanced modules stay locked until this step is complete.</p>
      </Card>

      <div className="grid lg:grid-cols-[1.1fr,1fr] gap-6 items-start">
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Offer Canvas Builder</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Scope, inclusions, notes</h3>
                <p className="text-xs text-warmCharcoal/60">Source of truth: scope, inclusions, exclusions, notes, status.</p>
              </div>
              <span className="text-2xl">🎨</span>
            </div>
            {!selectedReady && <LockedMessage label={readinessHint} />}
            {selectedReady && selected && (
              <div className="grid md:grid-cols-2 gap-3 text-sm font-marcellus text-warmCharcoal/80">
                <Field label="Scope" full>
                  <textarea className={fieldInput} value={selected.canvas?.scope ?? ""} onChange={(e) => updateCanvas({ scope: e.target.value })} />
                </Field>
                <Field label="Inclusions" full>
                  <textarea className={fieldInput} value={selected.canvas?.inclusions ?? ""} onChange={(e) => updateCanvas({ inclusions: e.target.value })} />
                </Field>
                <Field label="Exclusions" full>
                  <textarea className={fieldInput} value={selected.canvas?.exclusions ?? ""} onChange={(e) => updateCanvas({ exclusions: e.target.value })} />
                </Field>
                <Field label="Notes" full>
                  <textarea className={fieldInput} value={selected.notes ?? ""} onChange={(e) => updateSelected({ notes: e.target.value })} />
                </Field>
                <Field label="Status">
                  <select className={fieldInput} value={selected.status} onChange={(e) => updateSelected({ status: e.target.value as OfferStatus })}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Pricing Integrity Engine</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Validator only</h3>
                <p className="text-xs text-warmCharcoal/60">Source of truth for price. Unlocks after scope is defined.</p>
              </div>
              <span className="text-2xl">💫</span>
            </div>
            {!scopeDefined && <LockedMessage label="Add scope to unlock pricing validation." />}
            {scopeDefined && (
              <div className="grid md:grid-cols-2 gap-3 text-sm font-marcellus text-warmCharcoal/80">
                <Field label="Cost to deliver">
                  <input className={fieldInput} type="number" value={stateDoc.pricing?.inputs?.costToDeliver ?? ""} onChange={(e) => updatePricingInputs({ costToDeliver: e.target.value ? Number(e.target.value) : null })} />
                </Field>
                <Field label="Hours">
                  <input className={fieldInput} type="number" value={stateDoc.pricing?.inputs?.hoursToDeliver ?? ""} onChange={(e) => updatePricingInputs({ hoursToDeliver: e.target.value ? Number(e.target.value) : null })} />
                </Field>
                <Field label="Energy load">
                  <select className={fieldInput} value={stateDoc.pricing?.inputs?.energyLoad ?? ""} onChange={(e) => updatePricingInputs({ energyLoad: (e.target.value || null) as Rating })}>
                    <option value="">—</option>
                    {rating.filter(Boolean).map((r) => <option key={r as string}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Skill intensity">
                  <select className={fieldInput} value={stateDoc.pricing?.inputs?.skillIntensity ?? ""} onChange={(e) => updatePricingInputs({ skillIntensity: (e.target.value || null) as Rating })}>
                    <option value="">—</option>
                    {rating.filter(Boolean).map((r) => <option key={r as string}>{r}</option>)}
                  </select>
                </Field>
                <div className="md:col-span-2 text-xs text-salmonPeach-700 space-y-1">
                  {warnings.length ? warnings.map((w) => <div key={w}>{w}</div>) : <div className="text-warmCharcoal/60">No warnings. Pricing suggestions will respect energy + hours.</div>}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Delivery System Designer</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Source of truth: delivery</h3>
                <p className="text-xs text-warmCharcoal/60">Unlocks when status is active or delivery is not automated.</p>
              </div>
              <span className="text-2xl">🚚</span>
            </div>
            {!deliveryUnlocked && <LockedMessage label="Set status to active or choose a non-automated mode." />}
            {deliveryUnlocked && selected && (
              <div className="space-y-2 text-sm font-marcellus text-warmCharcoal/80">
                <select className={`${fieldInput} max-w-sm`} value={selected.delivery} onChange={(e) => updateSelected({ delivery: e.target.value as Delivery })}>
                  {deliveries.map((d) => <option key={d}>{d}</option>)}
                </select>
                <p className="text-xs text-warmCharcoal/60">One owner for delivery. Adjust mode here.</p>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Value Ladder Designer</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Advanced (optional)</h3>
              </div>
              <span className="text-2xl">🪜</span>
            </div>
            {selectedReady && selected ? (
              <div className="grid md:grid-cols-2 gap-3 text-sm font-marcellus text-warmCharcoal/80">
                <Field label="Next step offer ID" full>
                  <input className={fieldInput} value={selected.ladder?.nextStepOfferId ?? ""} onChange={(e) => updateLadder("nextStepOfferId", e.target.value || null)} />
                </Field>
                <Field label="Trust depth">
                  <select className={fieldInput} value={selected.ladder?.trustDepth ?? ""} onChange={(e) => updateLadder("trustDepth", (e.target.value || null) as Rating)}>
                    <option value="">—</option>
                    {rating.filter(Boolean).map((r) => <option key={r as string}>{r}</option>)}
                  </select>
                </Field>
              </div>
            ) : <LockedMessage label="Complete Step 1 to edit the ladder." />}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Offer Portfolio Board</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Default view</h3>
                <p className="text-xs text-warmCharcoal/60">Status source of truth. Drag between columns.</p>
              </div>
              <span className="text-2xl">📂</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {statuses.map((col) => (
                <div key={col} className="rounded-xl border border-warmCharcoal/10 bg-white/90 p-3 space-y-2" onDragOver={(e) => e.preventDefault()} onDrop={(event) => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData("offer-id");
                  if (!id) return;
                  setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: col } : o)));
                  patchOffer(id, { status: col });
                }}>
                  <div className="flex items-center justify-between text-sm font-semibold text-warmCharcoal">
                    <span>{col}</span>
                    <span className="text-xs text-warmCharcoal/60">{boardByStatus[col].length}</span>
                  </div>
                  <div className="space-y-2 min-h-[36px]">
                    {boardByStatus[col].map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("offer-id", item.id)}
                        className="rounded-lg border border-warmCharcoal/10 bg-white/95 p-2.5 space-y-1 text-xs text-warmCharcoal/75"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="flex items-center justify-between text-sm text-warmCharcoal font-semibold">
                          <span>{item.name}</span>
                          <span className="text-[11px] text-warmCharcoal/60">{item.tier}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-warmCharcoal/65">
                          <span>{item.priceDisplay || formatMoney(item.priceValue) || "—"}</span>
                          <span>Energy: {item.energy || "—"}</span>
                          <span>Reliability: {item.reliability || "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-warmCharcoal/55">Ecosystem Map</p>
                <h3 className="text-xl font-marcellus text-warmCharcoal">Read-only until 2+ offers</h3>
              </div>
              <span className="text-2xl">🗺️</span>
            </div>
            {hasTwoOffers ? (
              <p className="text-sm text-warmCharcoal/70">Visual map will render here. For now, review the board to keep status as the source of truth.</p>
            ) : (
              <p className="text-sm text-warmCharcoal/60">Add a second offer to unlock the visual map.</p>
            )}
          </Card>

          <SystemAIPanel
            systemName="Offer Architecture"
            context="Design offers that stay coherent while you progress step by step."
            subtitle="Ask for scope, pricing, or delivery refinements."
            hideUsageMeta
            hideChatHeader
            hideChatEmpty
          />
        </div>
      </div>
    </div>
  );
}

function CreateOfferForm({ onCreate, error, fieldInput }: { onCreate: (payload: { name: string; tier: OfferTier; delivery: Delivery; frequency: Frequency }) => void; error: string | null; fieldInput: string; }) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<OfferTier>("entry");
  const [delivery, setDelivery] = useState<Delivery>("live");
  const [frequency, setFrequency] = useState<Frequency>("one_time");

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Field label="Name" full>
        <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Core Implementation" />
      </Field>
      <Field label="Tier">
        <select className={fieldInput} value={tier} onChange={(e) => setTier(e.target.value as OfferTier)}>
          {baseTiers.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Delivery mode">
        <select className={fieldInput} value={delivery} onChange={(e) => setDelivery(e.target.value as Delivery)}>
          {deliveries.map((d) => <option key={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Frequency">
        <select className={fieldInput} value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
          {frequencies.map((f) => <option key={f}>{f}</option>)}
        </select>
      </Field>
      {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
      <div className="md:col-span-2 flex gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onCreate({ name: name.trim(), tier, delivery, frequency })}
          disabled={!name.trim()}
        >
          Create offer
        </Button>
      </div>
    </div>
  );
}

function LockedMessage({ label }: { label: string }) {
  return <p className="text-sm text-warmCharcoal/60">🔒 {label}</p>;
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-[0.16em] text-warmCharcoal/55">{label}</span>
      {children}
    </label>
  );
}
