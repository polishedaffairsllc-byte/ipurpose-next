import { createHash, randomBytes } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';

export const PUBLIC_ACTIONS = ['contact', 'clarity-submit', 'clarity-lead', 'info-session', 'workshop', 'welcome-popup', 'email-confirm'] as const;
export type PublicAction = typeof PUBLIC_ACTIONS[number];
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const WINDOW = 10 * 60 * 1000;
function replayRef(db: Firestore, action: PublicAction, ip: string, body: Record<string, unknown>) {
  const payload = Object.fromEntries(Object.keys(body).sort().filter(key => !['website', 'formToken', 'requestId'].includes(key)).map(key => [key, key === 'email' && validEmail(body[key]) ? (body[key] as string).trim().toLowerCase() : body[key]]));
  return db.collection('publicReplays').doc(hash(`${action}:${validEmail(body.email) ? body.email.trim().toLowerCase() : ip}:${JSON.stringify(payload)}`));
}

// On Vercel use its overwritten client-IP header, not the caller's arbitrary
// forwarded-for list. Missing infrastructure IP shares a conservative bucket.
export function requestIp(request: Request) {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
    || (process.env.NODE_ENV !== 'production' ? request.headers.get('x-real-ip') : null) || 'unknown';
}
export class PublicInputError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readPublicJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new PublicInputError(415, 'Please submit the form as JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new PublicInputError(400, 'Please complete the form.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24_000) { await reader.cancel(); throw new PublicInputError(413, 'This submission is too large.'); }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new PublicInputError(400, 'Please complete the form.'); }
}
export function validEmail(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length <= 254 && /^[^\s@\x00-\x1f]+@[^\s@\x00-\x1f]+\.[^\s@\x00-\x1f]+$/.test(value.trim());
}
export function validText(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value);
}
function throttleRef(db: Firestore, action: string, ip: string, now: number) {
  return db.collection('publicThrottle').doc(hash(`${action}:${ip}:${Math.floor(now / WINDOW)}`));
}
export async function issuePublicChallenge(db: Firestore, action: PublicAction, ip: string, now = Date.now()) {
  const token = randomBytes(32).toString('base64url');
  const rateRef = throttleRef(db, 'challenge', ip, now);
  await db.runTransaction(async tx => {
    const rate = (await tx.get(rateRef)).data();
    if ((rate?.count || 0) >= 60) throw new PublicInputError(429, 'Please wait before trying again.');
    tx.set(rateRef, { count: (rate?.count || 0) + 1, expiresAt: new Date(now + 2 * WINDOW) });
    tx.create(db.collection('publicChallenges').doc(hash(token)), { action, issuedAt: now, ipHash: hash(ip), used: false, expiresAt: new Date(now + 2 * 60 * 60 * 1000) });
  });
  return token;
}
export async function protectPublicSubmission(db: Firestore, action: PublicAction, ip: string,
  body: Record<string, unknown>, options: { requireChallenge?: boolean; limit?: number } = {}, now = Date.now()) {
  const rateRef = throttleRef(db, action, ip, now);
  // Deterministic sorted payload blocks repeats even with fresh tokens/IPs.
  const addressRate = validEmail(body.email) ? throttleRef(db, `${action}:email`, body.email.trim().toLowerCase(), now) : null;
  const duplicateRef = replayRef(db, action, ip, body);
  const token = body.formToken;
  const challengeRef = typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token) ? db.collection('publicChallenges').doc(hash(token)) : null;
  return db.runTransaction(async tx => {
    const rate = (await tx.get(rateRef)).data();
    const duplicate = (await tx.get(duplicateRef)).data();
    const addressCount = addressRate ? (await tx.get(addressRate)).data()?.count || 0 : 0;
    const challenge = challengeRef ? (await tx.get(challengeRef)).data() : null;
    if ((rate?.count || 0) >= (options.limit ?? 8) || addressCount >= 8) throw new PublicInputError(429, 'Please wait before trying again.');
    tx.set(rateRef, { count: (rate?.count || 0) + 1, expiresAt: new Date(now + 2 * WINDOW) });
    if (addressRate) tx.set(addressRate, { count: addressCount + 1, expiresAt: new Date(now + 2 * WINDOW) });
    if (body.website !== undefined && (typeof body.website !== 'string' || body.website.trim())) return 'dropped' as const;
    if (options.requireChallenge || token !== undefined) {
      if (!challenge || challenge.action !== action || challenge.ipHash !== hash(ip)
        || now - challenge.issuedAt < 1500 || now - challenge.issuedAt > 2 * 60 * 60 * 1000) return 'invalid' as const;
      if (challenge.used) return 'duplicate' as const;
    }
    if (duplicate && now - duplicate.createdAt < WINDOW) return 'duplicate' as const;
    if (challengeRef) tx.update(challengeRef, { used: true });
    tx.set(duplicateRef, { createdAt: now, reservation: typeof token === 'string' ? hash(token) : null, expiresAt: new Date(now + WINDOW) });
    return 'accepted' as const;
  });
}

// Contact storage failures can be retried without resetting any throttle. Only
// the accepted request's token can release its reservation, never a replay.
export async function releasePublicSubmission(db: Firestore, action: PublicAction, ip: string, body: Record<string, unknown>) {
  if (typeof body.formToken !== 'string') return;
  const reservation = hash(body.formToken);
  const ref = replayRef(db, action, ip, body);
  const challengeRef = db.collection('publicChallenges').doc(reservation);
  await db.runTransaction(async tx => {
    const current = (await tx.get(ref)).data();
    const challenge = (await tx.get(challengeRef)).data();
    if (current?.reservation !== reservation || !challenge) return;
    tx.delete(ref);
    tx.update(challengeRef, { used: false });
  });
}
