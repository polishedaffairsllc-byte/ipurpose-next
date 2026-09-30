import type { Firestore, Query } from 'firebase-admin/firestore';

import { isQuestionnaire } from './submissionType';
export { isQuestionnaire } from './submissionType';
type Questionnaire = Record<string, unknown>;

/** Legacy email matching requires ownership verified by Firebase Auth. */
export function legacyAccountEmail(user: { email?: string; emailVerified?: boolean } | null): string | undefined {
  return user?.emailVerified === true ? user.email : undefined;
}

async function findQuestionnaire(query: Query, uid: string): Promise<Questionnaire | undefined> {
  let page = query.orderBy('createdAt', 'desc').limit(25);
  while (true) {
    const snapshot = await page.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Email is only a fallback for records not owned by another account.
      if (data.uid && data.uid !== uid) continue;
      if (isQuestionnaire(data)) return data;
    }
    if (snapshot.size < 25) return undefined;
    page = query.orderBy('createdAt', 'desc').startAfter(snapshot.docs[snapshot.size - 1]).limit(25);
  }
}

/** UID is authoritative; legacy email comes only from the authenticated account. */
export async function getLatestQuestionnaire(db: Firestore, uid: string, verifiedAccountEmail?: string) {
  const collection = db.collection('clarityCheckSubmissions');
  const fields = ['type', 'messageCount', 'conversationSummary', 'conversationHistory', 'uid', 'scores', 'identityType', 'resultSummary', 'resultDetail', 'nextStep', 'createdAt'];
  const owned = await findQuestionnaire(collection.where('uid', '==', uid).select(...fields), uid);
  if (owned) return owned;
  if (!verifiedAccountEmail) return undefined;
  const emails = [...new Set([verifiedAccountEmail.trim().toLowerCase(), verifiedAccountEmail.trim()])];
  const results = await Promise.all(emails.map(email =>
    findQuestionnaire(collection.where('email', '==', email).select(...fields), uid)
  ));
  return results.filter((result): result is Questionnaire => !!result)
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))[0];
}

function timestamp(value: unknown): number {
  return (value as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
}
