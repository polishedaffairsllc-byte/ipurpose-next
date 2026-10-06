import { firebaseAdmin } from '../firebaseAdmin';
import { emailKey, normalizedEmail } from '../clarity/contacts';
import { marketingEligible, recordAuthEmailStatus } from './emailPolicy';

export async function canSendMarketing(rawEmail: string) {
  const email = normalizedEmail(rawEmail);
  const db = firebaseAdmin.firestore();
  try {
    // Read Auth now: stale tokens and a writable client profile are not proof.
    try { await recordAuthEmailStatus(db, await firebaseAdmin.auth().getUserByEmail(email)); }
    catch (error) {
      if ((error as { code?: string }).code !== 'auth/user-not-found') return false;
      const trust = await db.collection('emailTrust').doc(emailKey(email)).get();
      if (trust.data()?.kind !== 'contact') return false;
    }
    return await marketingEligible(db, email);
  } catch { return false; }
}
