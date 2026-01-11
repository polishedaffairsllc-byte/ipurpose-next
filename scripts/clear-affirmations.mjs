import admin from "firebase-admin";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  // Allow JSON string wrapped in single quotes in .env.local
  const cleaned = raw.startsWith("'") && raw.endsWith("'") ? raw.slice(1, -1) : raw;
  return JSON.parse(cleaned);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(getServiceAccount()) });
}

const db = admin.firestore();
const col = db.collection("affirmations");

console.log("Clearing Firestore collection: affirmations");

let total = 0;
while (true) {
  const snap = await col.limit(250).get();
  if (snap.empty) break;

  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  total += snap.size;
  console.log(`Deleted ${total} documents...`);
}

console.log("✓ Done. affirmations collection is now empty.");
