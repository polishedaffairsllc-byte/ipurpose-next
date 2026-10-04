import type { Firestore } from 'firebase-admin/firestore';
import { normalizedEmail } from './contacts';

export async function marketingSuppressed(db: Firestore, rawEmail: string) {
  const email = normalizedEmail(rawEmail);
  try {
    const [optOut, leads, users] = await Promise.all([
      db.collection('email_opt_outs').doc(Buffer.from(email).toString('base64')).get(),
      db.collection('leads').where('email', '==', email).get(),
      db.collection('users').where('email', '==', email).get(),
    ]);
    return optOut.exists || [...leads.docs, ...users.docs].some(doc => {
      const data = doc.data();
      return data.emailOptOut === true || ['unsubscribed', 'suppressed', 'opted_out'].includes(data.subscriptionStatus);
    });
  } catch { return true; }
}
