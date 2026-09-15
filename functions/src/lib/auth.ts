import { HttpsError } from 'firebase-functions/v2/https';

export interface Caller { uid: string; token: Record<string, unknown> }
export type LookupUser = (uid: string) => Promise<{ disabled?: boolean; customClaims?: Record<string, unknown> }>;

export async function assertIsAdmin(auth: Caller | undefined, lookup: LookupUser) {
  if (!auth) throw new HttpsError('unauthenticated', 'Sign in to view Launch Metrics.');
  if (auth.token.admin !== true) throw new HttpsError('permission-denied', 'Administrator access required.');
  // Check current claims too: a revoked admin claim must not work until token expiry.
  const user = await lookup(auth.uid);
  if (user.disabled || user.customClaims?.admin !== true) throw new HttpsError('permission-denied', 'Administrator access required.');
}
