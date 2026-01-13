/**
 * lib/leads.ts
 * Shared lead submission helper for storing leads in Firestore
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export type LeadSource = 'clarity-check' | 'info-session';

export interface LeadData {
  source: LeadSource;
  name: string;
  email: string;
  createdAt?: Timestamp | ReturnType<typeof firebaseAdmin.firestore.FieldValue.serverTimestamp>;
  updatedAt?: Timestamp | ReturnType<typeof firebaseAdmin.firestore.FieldValue.serverTimestamp>;
  touchCount?: number;
  status?: string;
  userAgent?: string | null;
  ip?: string | null;
  referer?: string | null;
  pathname?: string | null;
}

/**
 * Validate lead submission data
 */
export function validateLead(
  name: string | undefined,
  email: string | undefined
): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, error: 'INVALID_NAME' };
  }

  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'INVALID_EMAIL' };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'INVALID_EMAIL' };
  }

  return { valid: true };
}

/**
 * Normalize email: trim + lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if lead already exists (dedupe check)
 * Returns existing doc if found and created within last 7 days
 */
export async function findExistingLead(
  source: LeadSource,
  normalizedEmail: string
): Promise<{ docId: string; data: LeadData } | null> {
  const db = firebaseAdmin.firestore();
  const leadsRef = db.collection('leads');

  // Query: find leads with same email + source
  const query = leadsRef
    .where('source', '==', source)
    .where('email', '==', normalizedEmail)
    .orderBy('createdAt', 'desc')
    .limit(1);

  const snapshot = await query.get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data() as LeadData;

  // Check if within last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  let createdAtMs: number | null = null;

  if (data.createdAt instanceof Timestamp) {
    createdAtMs = data.createdAt.toMillis();
  } else if (data.createdAt) {
    const d = new Date(data.createdAt as any);
    if (!isNaN(d.getTime())) {
      createdAtMs = d.getTime();
    }
  }

  if (createdAtMs && createdAtMs >= sevenDaysAgo) {
    return { docId: doc.id, data };
  }

  return null;
}

/**
 * Update existing lead (dedupe case)
 */
export async function updateExistingLead(docId: string): Promise<string> {
  const db = firebaseAdmin.firestore();
  const leadsRef = db.collection('leads');

  await leadsRef.doc(docId).update({
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    touchCount: firebaseAdmin.firestore.FieldValue.increment(1),
  });

  return docId;
}

/**
 * Create new lead submission
 */
export async function createNewLead(data: LeadData): Promise<string> {
  const db = firebaseAdmin.firestore();
  const leadsRef = db.collection('leads');

  const leadData: LeadData = {
    ...data,
    createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    touchCount: 1,
    status: 'new',
  };

  const docRef = await leadsRef.add(leadData);
  return docRef.id;
}

/**
 * Main handler: Process lead submission with dedupe logic
 */
export async function processLead(
  source: LeadSource,
  name: string,
  email: string,
  context: {
    userAgent?: string | null;
    ip?: string | null;
    referer?: string | null;
    pathname?: string | null;
  }
): Promise<{
  ok: boolean;
  error?: string;
  id?: string;
  deduped?: boolean;
}> {
  // Validate
  const validation = validateLead(name, email);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    // Check for existing lead
    const existing = await findExistingLead(source, normalizedEmail);

    if (existing) {
      // Dedupe: update existing
      console.log(`[LEADS] Dedupe ${source} from ${normalizedEmail}`, existing.data);
      const id = await updateExistingLead(existing.docId);
      return { ok: true, id, deduped: true };
    }

    // Create new lead
    const id = await createNewLead({
      source,
      name: name.trim(),
      email: normalizedEmail,
      userAgent: context.userAgent || null,
      ip: context.ip || null,
      referer: context.referer || null,
      pathname: context.pathname || null,
    });

    console.log(`[LEADS] New ${source} submission:`, { id, name, email: normalizedEmail, context });
    return { ok: true, id, deduped: false };
  } catch (error) {
    console.error(`[LEADS] Error processing ${source}:`, error);
    return { ok: false, error: 'STORAGE_ERROR' };
  }
}
