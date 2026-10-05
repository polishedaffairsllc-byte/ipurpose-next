import type { firestore } from 'firebase-admin';
import { generatePurposeProfile, readPurposeProfile } from '@/mobile/src/lib/purposeCheck';
export async function getPurposeProfile(db: firestore.Firestore, uid: string) {
    const document = await db.collection('users').doc(uid).get();
    return readPurposeProfile(document.data()?.purposeProfile);
}
export async function savePurposeProfile(db: firestore.Firestore, uid: string, input: unknown, now?: string) {
    const profile = generatePurposeProfile(input, now);
    const reference = db.collection('users').doc(uid);
    await db.runTransaction(async (tx) => {
        const doc = await tx.get(reference);
        // Update replaces the whole nested map on a retake, removing old saved text.
        if (doc.exists)
            tx.update(reference, { purposeProfile: profile });
        else
            tx.set(reference, { purposeProfile: profile });
    });
    return profile;
}
export async function deletePurposeProfile(db: firestore.Firestore, uid: string, deleteField: unknown) {
    const reference = db.collection('users').doc(uid);
    await db.runTransaction(async (tx) => { const doc = await tx.get(reference); if (doc.exists)
        tx.update(reference, { purposeProfile: deleteField }); });
}
