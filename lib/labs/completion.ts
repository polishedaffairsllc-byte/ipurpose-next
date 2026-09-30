import { FieldValue, type Firestore } from 'firebase-admin/firestore';

export const LAB_KEYS = ['identity', 'meaning', 'agency'] as const;
export type LabKey = typeof LAB_KEYS[number];
export const ORIENTATION_STEPS = [
  'orientation_intro', 'identity_lab', 'meaning_lab', 'agency_lab',
  'integration_reflection', 'community_reflection',
] as const;

export function mergeProgress(previous: unknown, added: readonly string[]) {
  // Preserve earlier and future step keys; only known steps contribute to this arc.
  const completedSteps = [...new Set([
    ...(Array.isArray(previous) ? previous.filter((v): v is string => typeof v === 'string') : []),
    ...added,
  ])];
  const count = ORIENTATION_STEPS.filter(step => completedSteps.includes(step)).length;
  return { completedSteps, percentComplete: Math.round(count / ORIENTATION_STEPS.length * 100) };
}

export async function getLabCompletion(db: Firestore, uid: string) {
  const docs = await db.getAll(
    ...LAB_KEYS.map(key => db.collection('lab_completion').doc(`${uid}_${key}`)),
    db.collection('labCompletion').doc(uid),
  );
  const legacy = docs[3].data() || {};
  return Object.fromEntries(LAB_KEYS.map((key, i) => [key, docs[i].exists || legacy[key] === true])) as Record<LabKey, boolean>;
}

/** Canonical completion, compatibility mirror, and progress commit together. */
export async function completeLab(db: Firestore, uid: string, labKey: LabKey, method: string) {
  const refs = LAB_KEYS.map(key => db.collection('lab_completion').doc(`${uid}_${key}`));
  const legacyRef = db.collection('labCompletion').doc(uid);
  const progressRef = db.collection('learning_path_progress').doc(uid);
  await db.runTransaction(async transaction => {
    const docs = await transaction.getAll(...refs, legacyRef, progressRef);
    const legacy = docs[3].data() || {};
    const completed = LAB_KEYS.filter((key, i) => key === labKey || docs[i].exists || legacy[key] === true);
    const now = FieldValue.serverTimestamp();
    for (const key of completed) {
      const index = LAB_KEYS.indexOf(key);
      if (!docs[index].exists) {
        transaction.set(refs[index], {
          uid, labKey: key,
          ...(key === labKey
            ? { completedAt: now, method }
            // Do not invent the date a legacy completion occurred.
            : { method: 'legacy', migratedAt: now }),
        });
      }
    }
    transaction.set(legacyRef, {
      ...Object.fromEntries(completed.map(key => [key, true])), updatedAt: now,
    }, { merge: true });
    transaction.set(progressRef, {
      uid, arcKey: 'orientation',
      ...mergeProgress(docs[4].data()?.completedSteps, completed.map(key => `${key}_lab`)),
      updatedAt: now,
    }, { merge: true });
  });
  const saved = await refs[LAB_KEYS.indexOf(labKey)].get();
  return saved.data()?.completedAt?.toDate?.() ?? null;
}

export async function updateOrientationProgress(
  db: Firestore, uid: string, addedSteps: string[], currentStep?: string,
) {
  const ref = db.collection('learning_path_progress').doc(uid);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    transaction.set(ref, {
      uid, arcKey: 'orientation',
      ...mergeProgress(snapshot.data()?.completedSteps, addedSteps),
      ...(currentStep ? { currentStep } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
}
