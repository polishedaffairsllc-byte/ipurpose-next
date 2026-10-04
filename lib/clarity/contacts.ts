import { createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';

export const normalizedEmail = (email: string) => email.trim().toLowerCase();
export const emailKey = (email: string) => createHash('sha256').update(normalizedEmail(email)).digest('hex');

/** The registry serializes all sources without merging/deleting legacy records. */
export async function resolveContact(db: Firestore, input: {
  email: string; source: string; name?: string; context?: Record<string, unknown>;
}, now = new Date()) {
  const email = normalizedEmail(input.email);
  const registry = db.collection('leadEmailKeys').doc(emailKey(email));
  return db.runTransaction(async tx => {
    const index = await tx.get(registry);
    const matches = await tx.get(db.collection('leads').where('email', '==', email));
    const indexedId = index.data()?.leadId;
    const ordered = [...matches.docs].sort((a, b) => a.id.localeCompare(b.id));
    const existing = ordered.find(doc => doc.id === indexedId) || ordered[0];
    const leadRef = existing?.ref || db.collection('leads').doc(`email_${emailKey(email)}`);
    const data = existing?.data() || {};
    const legacyDuplicateIds = ordered.filter(doc => doc.id !== leadRef.id).map(doc => doc.id);
    const patch = existing ? {
      updatedAt: now, touchCount: (typeof data.touchCount === 'number' ? data.touchCount : 0) + 1,
      ...(!data.name && input.name?.trim() ? { name: input.name.trim() } : {}),
    } : {
      ...input.context, email, source: input.source,
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      createdAt: now, updatedAt: now, touchCount: 1, status: 'new',
    };
    tx.set(leadRef, patch, { merge: true });
    tx.set(registry, {
      email, leadId: leadRef.id, legacyDuplicateIds,
      sources: [...new Set([...(Array.isArray(index.data()?.sources) ? index.data()!.sources : []), data.source, input.source].filter(Boolean))],
      updatedAt: now,
    }, { merge: true });
    return { id: leadRef.id, deduped: Boolean(existing), legacyDuplicateIds, data: { ...data, ...patch } };
  });
}
