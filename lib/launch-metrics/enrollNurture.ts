import type { Firestore } from 'firebase-admin/firestore';

export interface NurtureEnrollment {
  email: string;
  name: string;
  submissionId: string;
  identityType?: string;
  totalScore?: number;
}

/** The existing Firestore queue is the subscription system; Resend delivers its tasks. */
export async function enrollNurture(db: Firestore, data: NurtureEnrollment, now = new Date()) {
  if (!data.submissionId || data.submissionId.includes('/')) throw new Error('A persisted lead ID is required.');
  const email = data.email.trim().toLowerCase();
  const optOut = db.collection('email_opt_outs').doc(Buffer.from(email).toString('base64'));
  const existing = db.collection('emailTasks').where('submissionId', '==', data.submissionId).limit(1);
  const tasks = [
    ['nurture_1', 2], ['nurture_2', 4], ['clarity_check_founders_rate', 5],
    ['nurture_3', 7], ['nurture_4', 10], ['nurture_5', 14],
  ] as const;
  return db.runTransaction(async tx => {
    // Fail closed on opt-out lookup errors. Also recognize legacy randomly-ID'd tasks.
    const [optedOut, queued] = await Promise.all([tx.get(optOut), tx.get(existing)]);
    if (optedOut.exists) return 'opted_out' as const;
    if (!queued.empty) return 'duplicate' as const;
    for (const [type, days] of tasks) {
      tx.create(db.collection('emailTasks').doc(`${data.submissionId}_${type}`), {
        email, name: data.name, submissionId: data.submissionId,
        ...(data.identityType && { identityType: data.identityType }),
        ...(data.totalScore !== undefined && { totalScore: data.totalScore }),
        type, scheduledFor: new Date(now.getTime() + days * 86400000),
        status: 'pending', createdAt: now,
      });
    }
    return 'enrolled' as const;
  });
}
