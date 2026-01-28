import { ok, fail } from "@/lib/http";
import { clampText } from "@/lib/validators";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

const POST_COOLDOWN_MS = 20_000;

const parseCursor = (cursor: string | null) => {
  if (!cursor) return null;
  const [millisPart, idPart] = cursor.split("_");
  const millis = Number(millisPart);
  if (!Number.isFinite(millis) || !idPart) return null;
  return { millis, id: idPart };
};

export async function GET(request: Request) {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");

    const { searchParams } = new URL(request.url);
    const spaceKey = (searchParams.get("spaceKey") ?? "general").slice(0, 50);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") ?? 20)));
    const cursor = parseCursor(searchParams.get("cursor"));

    const db = firebaseAdmin.firestore();
    let query = db
      .collection("community_posts")
      .where("spaceKey", "==", spaceKey)
      .where("isDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .orderBy(firebaseAdmin.firestore.FieldPath.documentId(), "desc")
      .limit(limit);

    if (cursor) {
      query = query.startAfter(firebaseAdmin.firestore.Timestamp.fromMillis(cursor.millis), cursor.id);
    }

    const snapshot = await query.get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        spaceKey: data.spaceKey,
        title: data.title ?? null,
        body: data.body ?? "",
        userId: data.authorUid,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const lastCreatedAt = lastDoc?.data()?.createdAt?.toMillis?.();
    const nextCursor = lastCreatedAt ? `${lastCreatedAt}_${lastDoc.id}` : null;

    return ok({ items, nextCursor });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts GET error:", error);
    return fail("SERVER_ERROR", "Failed to load posts.", 500);
  }
}

type CreateBody = { spaceKey?: string; title?: string; body?: string };

export async function POST(request: Request) {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");

    const body = (await request.json().catch(() => ({}))) as CreateBody;
    const spaceKey = (body.spaceKey ?? "general").slice(0, 50);
    const title = clampText(body.title, 200);
    const content = clampText(body.body);

    if (!content || content.trim().length === 0) {
      return fail("VALIDATION_ERROR", "Post body is required.", 400);
    }

    const db = firebaseAdmin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const lastPostAt = userSnap.data()?.communityLastPostAt?.toMillis?.() ?? 0;
    if (lastPostAt && Date.now() - lastPostAt < POST_COOLDOWN_MS) {
      return fail("RATE_LIMITED", "Please wait 20 seconds before posting again.", 429);
    }
    const docRef = db.collection("community_posts").doc();

    await docRef.set({
      spaceKey,
      authorUid: uid,
      title,
      body: content,
      isDeleted: false,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    await userRef.set(
      { communityLastPostAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    const createdSnap = await docRef.get();

    return ok({ postId: docRef.id, createdAt: createdSnap.data()?.createdAt?.toDate?.() ?? null }, 201);
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts POST error:", error);
    return fail("SERVER_ERROR", "Failed to create post.", 500);
  }
}
