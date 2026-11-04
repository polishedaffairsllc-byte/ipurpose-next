import type { Firestore } from 'firebase-admin/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import { requireCompletedSignup, SIGNUP_REQUIRED_FROM } from './completion';
import { accountDeletionLock } from '../accountDeletionLock';
import { CompanionSafetyError } from '../ai/companionSafety';

export type FirstRunRecord = { stage: 'welcome' | 'choice' | 'intro' | 'experience' | 'complete'; choice?: 'clarity' | 'purpose' };
export function parseFirstRun(input: unknown): FirstRunRecord {
  const body = input as FirstRunRecord | null;
  if (!body || !['welcome', 'choice', 'intro', 'experience', 'complete'].includes(body.stage)
    || (body.choice !== undefined && !['clarity', 'purpose'].includes(body.choice))
    || (['intro', 'experience'].includes(body.stage) && !body.choice)
    || Object.keys(body).some(k => !['stage', 'choice'].includes(k))) throw new CompanionSafetyError('Invalid starting point state.', 400);
  return { stage: body.stage, ...(body.choice ? { choice: body.choice } : {}) };
}
function initialState(user: UserRecord, welcome: boolean): FirstRunRecord {
  return Date.parse(user.metadata.creationTime) < Date.parse(SIGNUP_REQUIRED_FROM)
    ? { stage: 'complete' } : { stage: welcome ? 'choice' : 'welcome' };
}
export async function getFirstRun(db: Firestore, user: UserRecord): Promise<FirstRunRecord> {
  await requireCompletedSignup(db, user);
  const [saved, profile] = await Promise.all([
    db.collection('users').doc(user.uid).collection('onboarding').doc('firstRun').get(),
    db.collection('users').doc(user.uid).get(),
  ]);
  const state = saved.exists ? parseFirstRun(saved.data()?.state) : initialState(user, profile.data()?.introVideos?.hasCompletedWelcome === true);
  return state.stage === 'welcome' && profile.data()?.introVideos?.hasCompletedWelcome === true ? { stage: 'choice' } : state;
}
export function canAdvanceFirstRun(prior: FirstRunRecord, next: FirstRunRecord): boolean {
  if (JSON.stringify(prior) === JSON.stringify(next)) return true;
  if (prior.stage === 'welcome') return next.stage === 'choice' && !next.choice;
  if (prior.stage === 'choice') return next.stage === 'intro' && !!next.choice;
  if (prior.stage === 'intro') return next.stage === 'experience' && next.choice === prior.choice;
  if (prior.stage === 'experience') return next.stage === 'complete' && next.choice === prior.choice;
  return false;
}
export async function advanceFirstRun(db: Firestore, user: UserRecord, input: unknown, verifyIdentity: () => Promise<UserRecord>) {
  await requireCompletedSignup(db, user);
  const next = parseFirstRun(input);
  const parent = db.collection('users').doc(user.uid);
  const ref = parent.collection('onboarding').doc('firstRun');
  await db.runTransaction(async tx => {
    const [saved, profile, deleting] = await Promise.all([tx.get(ref), tx.get(parent), tx.get(accountDeletionLock(db, user.uid))]);
    if (deleting.exists) throw new CompanionSafetyError('Account deletion is in progress.', 409);
    const fresh = await verifyIdentity();
    if (fresh.uid !== user.uid || fresh.metadata.creationTime !== user.metadata.creationTime) throw new CompanionSafetyError('Your signed-in identity changed. Please retry.', 409);
    const prior = saved.exists ? parseFirstRun(saved.data()?.state) : initialState(user, profile.data()?.introVideos?.hasCompletedWelcome === true);
    if (!canAdvanceFirstRun(prior, next)) throw new CompanionSafetyError('Finish the current starting point step before continuing.', 409);
    tx.set(ref, { state: next, updatedAt: new Date() }, { merge: true });
  });
  return next;
}
