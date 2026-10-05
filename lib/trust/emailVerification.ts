import { randomBytes, createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { emailKey, normalizedEmail } from '../clarity/contacts';
import type { TransactionalSender } from '../clarity/delivery';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const TOKEN_LIFE = 24 * 60 * 60 * 1000;

export async function requestContactVerification(db: Firestore, rawEmail: string, send: TransactionalSender, now = new Date()) {
  const email = normalizedEmail(rawEmail);
  const ref = db.collection('emailTrust').doc(emailKey(email));
  const token = randomBytes(32).toString('base64url');
  const issued = await db.runTransaction(async tx => {
    const current = (await tx.get(ref)).data();
    if (current?.verified === true || (typeof current?.lastRequestedAt === 'number' && now.getTime() - current.lastRequestedAt < 15 * 60 * 1000)) return false;
    tx.set(ref, { email, kind: 'contact', verified: false, tokenHash: hashToken(token),
      expiresAt: now.getTime() + TOKEN_LIFE, lastRequestedAt: now.getTime() }, { merge: true });
    return true;
  });
  if (!issued) return 'unchanged';
  try {
    await send({ to: email, subject: 'Confirm your iPurpose email address',
      text: `Confirm that you can receive email at this address:\n\nhttps://ipurposesoul.com/confirm-email#key=${emailKey(email)}&token=${token}\n\nThis link expires in 24 hours. Confirmation does not subscribe you to marketing. If you didn’t request this, you can ignore this email.` }, `verify_${hashToken(token)}`);
    return 'sent';
  } catch {
    // Allow a new protected request to recover from a provider failure.
    await db.runTransaction(async tx => {
      const current = (await tx.get(ref)).data();
      if (current?.tokenHash === hashToken(token)) tx.update(ref, { lastRequestedAt: 0, tokenHash: null });
    });
    return 'failed';
  }
}

export async function confirmContactEmail(db: Firestore, key: unknown, token: unknown, now = new Date()) {
  if (typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key) || typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const ref = db.collection('emailTrust').doc(key);
  return db.runTransaction(async tx => {
    const current = (await tx.get(ref)).data();
    if (!current || current.kind !== 'contact' || current.verified === true
      || current.expiresAt <= now.getTime() || current.tokenHash !== hashToken(token)) return false;
    tx.update(ref, { verified: true, verifiedAt: now, tokenHash: null, expiresAt: null });
    return true;
  });
}
