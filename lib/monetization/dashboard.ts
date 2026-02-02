import Stripe from "stripe";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

// Types aligned to the canonical spec
export type IncomeStreamStatus = "active" | "building" | "planned" | "dormant" | "experimental";
export type IncomeStreamType = "service" | "product" | "membership" | "program" | "license" | "affiliate" | "other";

export interface IncomeStream {
  id: string;
  name: string;
  type: IncomeStreamType;
  status: IncomeStreamStatus;
  audience: string | null;
  entryPoint: string | null;
  delivery: string | null;
  frequency: "one_time" | "recurring" | "mixed";
  priceDisplay: string | null;
  priceValue: number | null;
  currency: string;
  effort: "low" | "med" | "high" | null;
  automation: "low" | "med" | "high" | null;
  stability: "low" | "med" | "high" | "unknown" | null;
  growth: "low" | "med" | "high" | null;
  alignment: "low" | "med" | "high" | null;
  energy: "low" | "med" | "high" | null;
  stripe: {
    productId?: string;
    priceId?: string;
  } | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingPlanTier {
  name: string;
  priceValue?: number | null;
  priceDisplay?: string | null;
  scope?: string | null;
  slas?: string | null;
  proof?: string | null;
  boundaries?: string | null;
}

export interface PricingPlan {
  id: string;
  name: string;
  offerRefStreamId?: string | null;
  inputs: {
    costToDeliver?: number | null;
    hoursToDeliver?: number | null;
    energyLoad?: "low" | "med" | "high" | null;
    skillIntensity?: "low" | "med" | "high" | null;
    transformationDepth?: "low" | "med" | "high" | null;
    marketPosition?: string | null;
    riskBufferPct?: number | null;
    accessibilityGuardrails?: string | null;
  };
  model: "flat" | "tiered" | "subscription" | "hybrid" | "value_based";
  tiers?: PricingPlanTier[];
  valueCanvas?: {
    promise?: string | null;
    proof?: string | null;
    process?: string | null;
    risks?: string | null;
  };
  sustainability?: {
    suggestedPriceMin?: number | null;
    marginEstimate?: number | null;
    burnoutRisk?: "low" | "med" | "high" | null;
  };
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StripeMetrics {
  rollingRevenue?: number | null;
  recurringRevenue?: number | null;
  oneTimeRevenue?: number | null;
  recurringRatio?: number | null;
  invoicesPaid?: number | null;
  invoicesOpen?: number | null;
  failedPayments?: number | null;
  churnRate?: number | null;
  arpu?: number | null;
}

export interface MonetizationSnapshot {
  id?: string;
  range: "rolling_30d" | "calendar_month" | "rolling_7d";
  currency: string;
  stripeMetrics: StripeMetrics;
  computed: {
    predictabilityPct?: number | null;
    volatilityLabel?: "low" | "med" | "high" | null;
    cashflowBufferWeeks?: number | null;
    roiClarity?: "low" | "med" | "high" | null;
    energyRoi?: "low" | "med" | "high" | null;
    timeRoi?: "low" | "med" | "high" | null;
    stressRoi?: "low" | "med" | "high" | null;
    alignmentRoi?: "low" | "med" | "high" | null;
    focusPicks?: string[];
    simplify?: string[];
    expand?: string[];
  };
  createdAt?: Date;
}

const FALLBACK_METRICS: StripeMetrics = {
  rollingRevenue: 0,
  recurringRevenue: 0,
  oneTimeRevenue: 0,
  recurringRatio: 0,
  invoicesPaid: 0,
  invoicesOpen: 0,
  failedPayments: 0,
  churnRate: null,
  arpu: null,
};

const DEFAULT_CURRENCY = "usd";

function getDb() {
  try {
    return firebaseAdmin.firestore();
  } catch (err) {
    console.warn("Firestore not initialized:", (err as { message?: string })?.message);
    return null;
  }
}

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

async function seedStarterIncomeStream(userId: string) {
  const db = getDb();
  if (!db) return null;

  const collection = db.collection("users").doc(userId).collection("income_streams");
  const docRef = collection.doc("starter-core-stream");
  const existing = await docRef.get();
  if (existing.exists) {
    const data = existing.data() || {};
    return {
      id: docRef.id,
      ...(data as any),
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    } as IncomeStream;
  }

  const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  const record: Partial<IncomeStream> & { createdAt: any; updatedAt: any } = {
    name: "Core Stream (Starter)",
    type: "program",
    status: "building",
    frequency: "mixed",
    priceDisplay: null,
    priceValue: null,
    currency: DEFAULT_CURRENCY,
    audience: null,
    entryPoint: null,
    delivery: null,
    effort: null,
    automation: null,
    stability: "unknown",
    growth: null,
    alignment: null,
    energy: null,
    stripe: null,
    notes: "Starter stream created automatically — edit anytime.",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(record);
  const saved = await docRef.get();
  const data = saved.data() || {};
  return {
    id: docRef.id,
    ...(data as any),
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  } as IncomeStream;
}

async function listInvoicesLast30d(stripe: Stripe) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 60 * 60 * 24 * 30;
  const invoices = await stripe.invoices.list({
    limit: 100,
    created: { gte: thirtyDaysAgo },
    status: "all",
  });
  return invoices.data;
}

export async function fetchStripeSummary(): Promise<{
  connected: boolean;
  currency: string;
  metrics: StripeMetrics;
  error?: string;
}> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { connected: false, currency: DEFAULT_CURRENCY, metrics: FALLBACK_METRICS, error: "Stripe not configured" };
  }

  try {
    const invoices = await listInvoicesLast30d(stripe);
    if (!invoices.length) {
      return { connected: true, currency: DEFAULT_CURRENCY, metrics: { ...FALLBACK_METRICS } };
    }

    const currency = invoices[0].currency || DEFAULT_CURRENCY;
    let rollingRevenue = 0;
    let recurringRevenue = 0;
    let oneTimeRevenue = 0;
    let invoicesPaid = 0;
    let invoicesOpen = 0;
    let failedPayments = 0;

    invoices.forEach((inv) => {
      const total = (inv.total || 0) / 100;
      if (inv.status === "paid") {
        rollingRevenue += total;
        invoicesPaid += 1;
        if (inv.subscription) {
          recurringRevenue += total;
        } else {
          oneTimeRevenue += total;
        }
      } else if (inv.status === "open") {
        invoicesOpen += 1;
      } else if (inv.status === "uncollectible" || inv.status === "void") {
        failedPayments += 1;
      }
    });

    const totalRevenue = rollingRevenue + oneTimeRevenue;
    const recurringRatio = totalRevenue > 0 ? recurringRevenue / totalRevenue : 0;

    const metrics: StripeMetrics = {
      rollingRevenue: Number(rollingRevenue.toFixed(2)),
      recurringRevenue: Number(recurringRevenue.toFixed(2)),
      oneTimeRevenue: Number(oneTimeRevenue.toFixed(2)),
      recurringRatio: Number(recurringRatio.toFixed(3)),
      invoicesPaid,
      invoicesOpen,
      failedPayments,
      churnRate: null,
      arpu: null,
    };

    return { connected: true, currency, metrics };
  } catch (err) {
    console.error("Stripe summary error", err);
    return {
      connected: false,
      currency: DEFAULT_CURRENCY,
      metrics: FALLBACK_METRICS,
      error: err instanceof Error ? err.message : "Stripe fetch failed",
    };
  }
}

export async function getIncomeStreams(userId: string): Promise<IncomeStream[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection("users").doc(userId).collection("income_streams").orderBy("createdAt", "desc").get();
  if (snap.empty) {
    const seeded = await seedStarterIncomeStream(userId);
    return seeded ? [seeded] : [];
  }
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "Untitled Stream",
      type: (data.type as IncomeStreamType) ?? "other",
      status: (data.status as IncomeStreamStatus) ?? "planned",
      audience: data.audience ?? null,
      entryPoint: data.entryPoint ?? null,
      delivery: data.delivery ?? null,
      frequency: (data.frequency as IncomeStream["frequency"]) ?? "one_time",
      priceDisplay: data.priceDisplay ?? null,
      priceValue: data.priceValue ?? null,
      currency: data.currency ?? DEFAULT_CURRENCY,
      effort: data.effort ?? null,
      automation: data.automation ?? null,
      stability: data.stability ?? null,
      growth: data.growth ?? null,
      alignment: data.alignment ?? null,
      energy: data.energy ?? null,
      stripe: data.stripe ?? null,
      notes: data.notes ?? null,
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    } as IncomeStream;
  });
}

export async function createIncomeStream(userId: string, payload: Partial<IncomeStream>): Promise<IncomeStream> {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  const collection = db.collection("users").doc(userId).collection("income_streams");
  const docRef = collection.doc();
  const record = {
    name: payload.name || "Untitled Stream",
    type: payload.type || "other",
    status: payload.status || "planned",
    audience: payload.audience ?? null,
    entryPoint: payload.entryPoint ?? null,
    delivery: payload.delivery ?? null,
    frequency: payload.frequency || "one_time",
    priceDisplay: payload.priceDisplay ?? null,
    priceValue: payload.priceValue ?? null,
    currency: payload.currency || DEFAULT_CURRENCY,
    effort: payload.effort ?? null,
    automation: payload.automation ?? null,
    stability: payload.stability ?? null,
    growth: payload.growth ?? null,
    alignment: payload.alignment ?? null,
    energy: payload.energy ?? null,
    stripe: payload.stripe ?? null,
    notes: payload.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(record);
  const saved = await docRef.get();
  return { id: docRef.id, ...(saved.data() as any) } as IncomeStream;
}

export async function updateIncomeStream(userId: string, streamId: string, payload: Partial<IncomeStream>): Promise<IncomeStream> {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  const docRef = db.collection("users").doc(userId).collection("income_streams").doc(streamId);
  await docRef.set({
    ...payload,
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const saved = await docRef.get();
  return { id: docRef.id, ...(saved.data() as any) } as IncomeStream;
}

export async function deleteIncomeStream(userId: string, streamId: string) {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  await db.collection("users").doc(userId).collection("income_streams").doc(streamId).delete();
}

export async function getPricingPlans(userId: string): Promise<PricingPlan[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection("users").doc(userId).collection("pricing_plans").orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "Untitled Plan",
      offerRefStreamId: data.offerRefStreamId ?? null,
      inputs: data.inputs ?? {},
      model: data.model ?? "flat",
      tiers: data.tiers ?? [],
      valueCanvas: data.valueCanvas ?? {},
      sustainability: data.sustainability ?? {},
      notes: data.notes ?? null,
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    } as PricingPlan;
  });
}

export async function createPricingPlan(userId: string, payload: Partial<PricingPlan>): Promise<PricingPlan> {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  const docRef = db.collection("users").doc(userId).collection("pricing_plans").doc();
  const record = {
    name: payload.name || "New Pricing Plan",
    offerRefStreamId: payload.offerRefStreamId ?? null,
    inputs: payload.inputs ?? {},
    model: payload.model || "flat",
    tiers: payload.tiers ?? [],
    valueCanvas: payload.valueCanvas ?? {},
    sustainability: payload.sustainability ?? {},
    notes: payload.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(record);
  const saved = await docRef.get();
  return { id: docRef.id, ...(saved.data() as any) } as PricingPlan;
}

export async function updatePricingPlan(userId: string, planId: string, payload: Partial<PricingPlan>): Promise<PricingPlan> {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  const docRef = db.collection("users").doc(userId).collection("pricing_plans").doc(planId);
  await docRef.set({
    ...payload,
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const saved = await docRef.get();
  return { id: docRef.id, ...(saved.data() as any) } as PricingPlan;
}

export async function getLatestSnapshot(userId: string): Promise<MonetizationSnapshot | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await db
    .collection("users")
    .doc(userId)
    .collection("monetization_snapshots")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    range: data.range ?? "rolling_30d",
    currency: data.currency ?? DEFAULT_CURRENCY,
    stripeMetrics: data.stripeMetrics ?? { ...FALLBACK_METRICS },
    computed: data.computed ?? {},
    createdAt: data.createdAt?.toDate?.() ?? undefined,
  };
}

export async function getSnapshotHistory(userId: string, limitCount = 10): Promise<MonetizationSnapshot[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db
    .collection("users")
    .doc(userId)
    .collection("monetization_snapshots")
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      range: data.range ?? "rolling_30d",
      currency: data.currency ?? DEFAULT_CURRENCY,
      stripeMetrics: data.stripeMetrics ?? { ...FALLBACK_METRICS },
      computed: data.computed ?? {},
      createdAt: data.createdAt?.toDate?.() ?? undefined,
    } as MonetizationSnapshot;
  });
}

export async function saveSnapshot(userId: string, snapshot: MonetizationSnapshot) {
  const db = getDb();
  if (!db) return;
  const docRef = db.collection("users").doc(userId).collection("monetization_snapshots").doc();
  await docRef.set({
    ...snapshot,
    createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  });
}

function labelVolatility(recurringRatio?: number | null): "low" | "med" | "high" | null {
  if (recurringRatio == null) return null;
  if (recurringRatio >= 0.75) return "low";
  if (recurringRatio >= 0.45) return "med";
  return "high";
}

function pickTierFromMetric(value?: number | null): "low" | "med" | "high" | null {
  if (value == null) return null;
  if (value >= 0.75) return "high";
  if (value >= 0.45) return "med";
  return "low";
}

function aggregateRatings(streams: IncomeStream[]) {
  const ratings = { energy: 0, effort: 0, automation: 0, alignment: 0, count: 0 };
  const map: Record<string, number> = { low: 0.25, med: 0.6, high: 0.9 };
  streams.forEach((s) => {
    if (s.energy && map[s.energy]) ratings.energy += map[s.energy];
    if (s.effort && map[s.effort]) ratings.effort += map[s.effort];
    if (s.automation && map[s.automation]) ratings.automation += map[s.automation];
    if (s.alignment && map[s.alignment]) ratings.alignment += map[s.alignment];
    ratings.count += 1;
  });
  if (!ratings.count) return null;
  return {
    energy: ratings.energy / ratings.count,
    effort: ratings.effort / ratings.count,
    automation: ratings.automation / ratings.count,
    alignment: ratings.alignment / ratings.count,
  };
}

export function computeFocusIndicators(streams: IncomeStream[], metrics: StripeMetrics) {
  const ratings = aggregateRatings(streams);
  const predictabilityPct = metrics.recurringRatio != null ? Math.round(metrics.recurringRatio * 100) : null;
  const volatilityLabel = labelVolatility(metrics.recurringRatio);
  const roiClarity = ratings ? pickTierFromMetric(ratings.automation) : null;
  const energyRoi = ratings ? pickTierFromMetric(ratings.energy) : null;
  const timeRoi = ratings ? pickTierFromMetric(ratings.automation) : null;
  const stressRoi = ratings ? pickTierFromMetric(ratings.effort ? 1 - ratings.effort : null) : null;
  const alignmentRoi = ratings ? pickTierFromMetric(ratings.alignment) : null;

  const focusPicks: string[] = [];
  if (volatilityLabel === "high") focusPicks.push("Stabilize recurring revenue");
  if (metrics.failedPayments && metrics.failedPayments > 0) focusPicks.push("Resolve failed payments/dunning");
  if (ratings && ratings.effort && ratings.effort > 0.6) focusPicks.push("Reduce effort via automation or scope");

  return {
    predictabilityPct,
    volatilityLabel,
    cashflowBufferWeeks: null,
    roiClarity,
    energyRoi,
    timeRoi,
    stressRoi,
    alignmentRoi,
    focusPicks,
    simplify: [],
    expand: [],
  } satisfies MonetizationSnapshot["computed"];
}

export async function buildDashboard(userId: string, opts?: { includeStripe?: boolean }) {
  const includeStripe = opts?.includeStripe !== false;
  const [streams, pricingPlans, latestSnapshot] = await Promise.all([
    getIncomeStreams(userId),
    getPricingPlans(userId),
    getLatestSnapshot(userId),
  ]);

  let stripeSummary: Awaited<ReturnType<typeof fetchStripeSummary>> | null = null;
  if (includeStripe) {
    stripeSummary = await fetchStripeSummary();
  }

  const metrics = stripeSummary?.connected
    ? stripeSummary.metrics
    : latestSnapshot?.stripeMetrics ?? { ...FALLBACK_METRICS };

  const computed = computeFocusIndicators(streams, metrics);

  // Cache snapshot when we have fresh Stripe data
  if (stripeSummary?.connected) {
    await saveSnapshot(userId, {
      range: "rolling_30d",
      currency: stripeSummary.currency,
      stripeMetrics: metrics,
      computed,
    });
  }

  const history = await getSnapshotHistory(userId, 12);

  return {
    streams,
    pricingPlans,
    metrics,
    computed,
    currency: stripeSummary?.currency || latestSnapshot?.currency || DEFAULT_CURRENCY,
    stripe: {
      connected: stripeSummary?.connected || false,
      error: stripeSummary?.error,
    },
    snapshotDate: latestSnapshot?.createdAt || null,
    history,
  };
}
