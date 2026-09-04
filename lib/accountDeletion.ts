import type { firestore } from "firebase-admin";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

const RECENT_AUTHENTICATION_WINDOW_SECONDS = 5 * 60;

export const ACCOUNT_DIRECT_DOCUMENT_COLLECTIONS = [
  "users",
  "user-preferences",
  "user-contexts",
  "identity_maps",
  "meaning_maps",
  "agency_maps",
  "labs",
  "integration",
  "learning_path_progress",
  "labCompletion",
  "aiBlueprintResponses",
  "starterPackResponses",
  "rate-limits",
  "userProgress",
] as const;

export const ACCOUNT_UID_QUERY_COLLECTIONS = [
  "clarityCheckSubmissions",
  "workflowSystems",
  "lab_events",
  "activation_a_states",
  "cohort-registrations",
] as const;

export const ACCOUNT_USER_ID_QUERY_COLLECTIONS = [
  "gpt-interactions",
  "conversation-sessions",
  "conversation-memory",
] as const;

const LAB_COMPLETION_KEYS = ["identity", "meaning", "agency"] as const;

export function isRecentAuthentication(
  authTimeSeconds: number | undefined,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!Number.isFinite(authTimeSeconds)) return false;
  const ageSeconds = nowSeconds - (authTimeSeconds as number);
  return ageSeconds >= 0 && ageSeconds <= RECENT_AUTHENTICATION_WINDOW_SECONDS;
}

export function getAccountDeletionPlan(uid: string, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase() || undefined;

  return {
    directDocuments: [
      ...ACCOUNT_DIRECT_DOCUMENT_COLLECTIONS.map((collection) => ({ collection, id: uid })),
      ...LAB_COMPLETION_KEYS.map((key) => ({ collection: "lab_completion", id: `${uid}_${key}` })),
    ],
    fieldQueries: [
      ...ACCOUNT_UID_QUERY_COLLECTIONS.map((collection) => ({ collection, field: "uid", value: uid })),
      ...ACCOUNT_USER_ID_QUERY_COLLECTIONS.map((collection) => ({ collection, field: "userId", value: uid })),
      { collection: "community_posts", field: "authorUid", value: uid },
      ...(normalizedEmail ? [
        { collection: "clarityCheckSubmissions", field: "email", value: normalizedEmail },
        { collection: "emailTasks", field: "email", value: normalizedEmail },
        { collection: "leads", field: "email", value: normalizedEmail },
      ] : []),
    ],
    purchaseQuery: { collection: "purchases", field: "uid", value: uid },
    commentsQuery: { collectionGroup: "comments", field: "authorUid", value: uid },
  } as const;
}

async function recursiveDeleteDocuments(
  db: firestore.Firestore,
  references: firestore.DocumentReference[]
) {
  for (const reference of references) {
    await db.recursiveDelete(reference);
  }
}

/**
 * Remove user-owned product data. Financial purchase records are retained but
 * de-linked from the deleted Firebase identity; community posts are tombstoned
 * so deleting one author does not erase other members' replies.
 *
 * Every operation is safe to retry. The route deletes Firebase Auth only after
 * this function completes successfully.
 */
export async function deleteAccountData(uid: string, email?: string): Promise<void> {
  const db = firebaseAdmin.firestore();
  const plan = getAccountDeletionPlan(uid, email);

  for (const target of plan.fieldQueries) {
    const snapshot = await db
      .collection(target.collection)
      .where(target.field, "==", target.value)
      .get();

    if (target.collection === "community_posts") {
      for (const document of snapshot.docs) {
        await document.ref.set(
          {
            authorUid: "deleted-user",
            title: "",
            body: "",
            isDeleted: true,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } else {
      await recursiveDeleteDocuments(db, snapshot.docs.map((document) => document.ref));
    }
  }

  const comments = await db
    .collectionGroup(plan.commentsQuery.collectionGroup)
    .where(plan.commentsQuery.field, "==", plan.commentsQuery.value)
    .get();
  await recursiveDeleteDocuments(db, comments.docs.map((document) => document.ref));

  const purchases = await db
    .collection(plan.purchaseQuery.collection)
    .where(plan.purchaseQuery.field, "==", plan.purchaseQuery.value)
    .get();
  for (const purchase of purchases.docs) {
    await purchase.ref.set(
      {
        uid: firebaseAdmin.firestore.FieldValue.delete(),
        accountDeletedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await recursiveDeleteDocuments(
    db,
    plan.directDocuments.map((target) => db.collection(target.collection).doc(target.id))
  );
}
