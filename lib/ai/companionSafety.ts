import { accountDeletionLock } from '../accountDeletionLock';
import type { Firestore } from 'firebase-admin/firestore';

export const AI_CONSENT_VERSION = 'compass-openai-2026-10-12';
export const AI_CONSENT_NOTICE = 'Compass uses OpenAI to generate responses and check content safety. Your messages, relevant conversation history, and saved profile and journey information (name, timezone, Clarity and Purpose results, priorities, check-ins, reflections and Lab/session context) are sent to OpenAI. You can decline and use the other app features, or withdraw permission in Account. Withdrawal stops new requests; it does not erase earlier conversations or information already sent. Other iPurpose AI tools, where available, also require this permission to send the text and saved context you use with them to OpenAI. See the Privacy Policy for details.';
export const REPORT_REASONS = ['unsafe', 'offensive', 'inaccurate', 'other'] as const;
const ID = /^[A-Za-z0-9_-]{1,128}$/;

export class CompanionSafetyError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
function consentRef(db: Firestore, uid: string) {
  return db.collection('users').doc(uid).collection('consents').doc('compassAi');
}
export async function readAiConsent(db: Firestore, uid: string) {
  const record = (await consentRef(db, uid).get()).data();
  return { granted: record?.granted === true && record.version === AI_CONSENT_VERSION,
    version: AI_CONSENT_VERSION, notice: AI_CONSENT_NOTICE, provider: 'OpenAI', protocolVersion: 2 };
}
export async function requireAiConsent(db: Firestore, uid: string) {
  if ((await accountDeletionLock(db, uid).get()).exists) throw new CompanionSafetyError('Account deletion is in progress.', 403);
  if (!(await readAiConsent(db, uid)).granted) throw new CompanionSafetyError('Please review AI data sharing and enable permission in Account before sending a Compass message. If your installed app does not have this control, update the app first.', 403);
}
export async function writeAiConsent(db: Firestore, uid: string, input: unknown) {
  const body = input as { granted?: unknown; version?: unknown } | null;
  if (!body || typeof body.granted !== 'boolean' || body.version !== AI_CONSENT_VERSION) {
    throw new CompanionSafetyError('Please review the current OpenAI disclosure and choose whether to allow sharing.', 400);
  }
  // Read the private deletion guard and parent inside the same transaction.
  // A late grant must not recreate account data after recursive deletion.
  await db.runTransaction(async tx => {
    const [deleting, profile] = await Promise.all([tx.get(accountDeletionLock(db, uid)), tx.get(db.collection('users').doc(uid))]);
    if (deleting.exists || !profile.exists) throw new CompanionSafetyError('Account deletion is in progress or your profile is unavailable. Sign into the app before retrying.', 409);
    tx.set(consentRef(db, uid), { granted: body.granted, version: AI_CONSENT_VERSION,
      provider: 'OpenAI', notice: AI_CONSENT_NOTICE, updatedAt: new Date() }, { merge: true });
  });
  return readAiConsent(db, uid);
}
export async function saveAiReport(db: Firestore, uid: string, input: unknown) {
  const body = input as { conversationId?: unknown; messageId?: unknown; reason?: unknown; details?: unknown } | null;
  if (!body || typeof body.conversationId !== 'string' || !ID.test(body.conversationId)
    || typeof body.messageId !== 'string' || !ID.test(body.messageId)
    || !REPORT_REASONS.includes(body.reason as typeof REPORT_REASONS[number])
    || (body.details !== undefined && (typeof body.details !== 'string' || body.details.length > 1000))) {
    throw new CompanionSafetyError('Choose a report reason and keep details under 1,000 characters.', 400);
  }
  const user = db.collection('users').doc(uid);
  const conversation = user.collection('companionConversations').doc(body.conversationId);
  const message = conversation.collection('messages').doc(body.messageId);
  // Length-prefixed components avoid ID collisions; one report per user/response.
  const report = user.collection('companionReports').doc(`${body.conversationId.length}_${body.conversationId}_${body.messageId}`);
  await db.runTransaction(async tx => {
    const [parent, response, existing, deleting] = await Promise.all([tx.get(conversation), tx.get(message), tx.get(report), tx.get(accountDeletionLock(db, uid))]);
    if (deleting.exists) throw new CompanionSafetyError('Account deletion is in progress.', 409);
    if (!parent.exists || !response.exists || response.data()?.role !== 'assistant') {
      throw new CompanionSafetyError('AI response not found in your conversation.', 404);
    }
    if (existing.exists) return;
    tx.set(report, { uid, conversationId: body.conversationId, messageId: body.messageId,
      reason: body.reason, details: (body.details as string | undefined)?.trim() || '',
      response: response.data()?.content || '', status: 'pending', createdAt: new Date() });
  });
  return { reported: true, reportId: report.id };
}
