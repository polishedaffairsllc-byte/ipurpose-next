import { firebaseAdmin } from "@/lib/firebaseAdmin";

export type OfferTier = "free" | "entry" | "core" | "expansion" | "premium" | "legacy";
export type OfferType = "service" | "product" | "membership" | "program" | "license" | "other";
export type OfferStatus = "active" | "building" | "planned" | "retiring" | "experimental";
export type Frequency = "one_time" | "recurring" | "mixed";
export type Delivery = "live" | "async" | "hybrid" | "automated" | "community";
export type Rating = "low" | "med" | "high" | null;

export interface OfferDocument {
  id: string;
  name: string;
  tier: OfferTier;
  type: OfferType;
  entryPoint?: string | null;
  delivery: Delivery;
  frequency: Frequency;
  priceDisplay?: string | null;
  priceValue?: number | null;
  currency?: string;
  reliability?: Rating;
  energy?: Rating;
  canvas?: {
    problem?: string | null;
    audience?: string | null;
    transformation?: string | null;
    promise?: string | null;
    format?: string | null;
    experience?: string | null;
    support?: string | null;
    boundaries?: string | null;
    completion?: string | null;
  };
  ladder?: {
    entryFriction?: Rating;
    trustDepth?: Rating;
    supportDepth?: Rating;
    transformationDepth?: Rating;
    nextStepOfferId?: string | null;
  };
  status: OfferStatus;
  stripe?: { productId?: string; priceId?: string } | null;
  notes?: string | null;
  seeded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OfferStateDoc {
  pricing?: {
    model?: "flat" | "tiered" | "subscription" | "hybrid" | "value_based";
    inputs?: {
      costToDeliver?: number | null;
      hoursToDeliver?: number | null;
      energyLoad?: Rating;
      skillIntensity?: Rating;
      transformationDepth?: Rating;
    };
    riskBufferPct?: number | null;
    accessibilityGuardrails?: string | null;
    tiers?: Array<{
      name: "Starter" | "Core" | "Premium";
      priceValue?: number | null;
      priceDisplay?: string | null;
      scope?: string | null;
      slas?: string | null;
      proof?: string | null;
      boundaries?: string | null;
    }>;
  };
  deliveryModesEnabled?: Delivery[];
  updatedAt?: Date;
}

function db() {
  try {
    return firebaseAdmin.firestore();
  } catch (err) {
    console.warn("Firestore not initialized", (err as { message?: string })?.message);
    return null;
  }
}

const DEFAULT_CURRENCY = "usd";

function serializeOffer(docId: string, data: FirebaseFirestore.DocumentData): OfferDocument {
  return {
    id: docId,
    name: data.name ?? "Untitled Offer",
    tier: data.tier ?? "entry",
    type: data.type ?? "other",
    entryPoint: data.entryPoint ?? null,
    delivery: data.delivery ?? "live",
    frequency: data.frequency ?? "one_time",
    priceDisplay: data.priceDisplay ?? null,
    priceValue: data.priceValue ?? null,
    currency: data.currency ?? DEFAULT_CURRENCY,
    reliability: data.reliability ?? null,
    energy: data.energy ?? null,
    canvas: data.canvas ?? {},
    ladder: data.ladder ?? {},
    status: data.status ?? "planned",
    stripe: data.stripe ?? null,
    notes: data.notes ?? null,
    seeded: data.seeded ?? false,
    createdAt: data.createdAt?.toDate?.() ?? undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
}

export async function listOffersWithSeed(userId: string): Promise<OfferDocument[]> {
  const database = db();
  if (!database) return [];
  const col = database.collection("users").doc(userId).collection("offers");
  const snap = await col.limit(1).get();

  if (snap.empty) {
    const starterRef = col.doc("starter_core_offer");
    const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    await starterRef.set({
      name: "Core Offer (Starter)",
      tier: "core",
      type: "program",
      entryPoint: "site",
      delivery: "hybrid",
      frequency: "one_time",
      status: "building",
      seeded: true,
      notes: "Starter offer created automatically. Edit or rename anytime.",
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  }

  const allSnap = await col.orderBy("createdAt", "desc").get();
  return allSnap.docs.map((doc) => serializeOffer(doc.id, doc.data()));
}

export async function createOffer(userId: string, payload: Partial<OfferDocument>): Promise<OfferDocument> {
  const database = db();
  if (!database) throw new Error("Firestore not available");
  const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  const col = database.collection("users").doc(userId).collection("offers");
  const docRef = col.doc();
  const record = {
    name: payload.name || "New Offer",
    tier: payload.tier || "entry",
    type: payload.type || "other",
    entryPoint: payload.entryPoint ?? null,
    delivery: payload.delivery || "live",
    frequency: payload.frequency || "one_time",
    priceDisplay: payload.priceDisplay ?? null,
    priceValue: payload.priceValue ?? null,
    currency: payload.currency || DEFAULT_CURRENCY,
    reliability: payload.reliability ?? null,
    energy: payload.energy ?? null,
    canvas: payload.canvas ?? {},
    ladder: payload.ladder ?? {},
    status: payload.status || "planned",
    stripe: payload.stripe ?? null,
    notes: payload.notes ?? null,
    seeded: false,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(record);
  const saved = await docRef.get();
  return serializeOffer(docRef.id, saved.data() || {});
}

export async function updateOffer(userId: string, offerId: string, payload: Partial<OfferDocument>): Promise<OfferDocument> {
  const database = db();
  if (!database) throw new Error("Firestore not available");
  const docRef = database.collection("users").doc(userId).collection("offers").doc(offerId);
  await docRef.set({
    ...payload,
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const saved = await docRef.get();
  return serializeOffer(docRef.id, saved.data() || {});
}

export async function deleteOffer(userId: string, offerId: string) {
  const database = db();
  if (!database) throw new Error("Firestore not available");
  await database.collection("users").doc(userId).collection("offers").doc(offerId).delete();
}

export async function getOfferState(userId: string): Promise<OfferStateDoc> {
  const database = db();
  if (!database) return {};
  const ref = database.collection("users").doc(userId).collection("systems_offer_architecture").doc("state");
  const snap = await ref.get();
  if (!snap.exists) return {};
  const data = snap.data() || {};
  return {
    pricing: data.pricing ?? {},
    deliveryModesEnabled: data.deliveryModesEnabled ?? [],
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
}

export async function updateOfferState(userId: string, payload: Partial<OfferStateDoc>) {
  const database = db();
  if (!database) throw new Error("Firestore not available");
  const ref = database.collection("users").doc(userId).collection("systems_offer_architecture").doc("state");
  await ref.set({
    ...payload,
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const saved = await ref.get();
  const data = saved.data() || {};
  return {
    pricing: data.pricing ?? {},
    deliveryModesEnabled: data.deliveryModesEnabled ?? [],
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  } as OfferStateDoc;
}
