import { ok, fail } from "@/lib/http";
import { clampText } from "@/lib/validators";
import { requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";

const COMMENT_COOLDOWN_MS = 10_000;

const parseCursor = (cursor: string | null) => {
  if (!cursor) return null;
  const [millisPart, idPart] = cursor.split("_");
  const millis = Number(millisPart);
  if (!Number.isFinite(millis) || !idPart) return null;
  return { millis, id: idPart };
};

type Body = { body?: string };

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };
    await requireRole(uid, "explorer");

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit") ?? 50)));
    const cursor = parseCursor(searchParams.get("cursor"));

    const db = firebaseAdmin.firestore();
    const postRef = db.collection("community_posts").doc(id);
    const postSnap = await postRef.get();
    if (!postSnap.exists || postSnap.data()?.isDeleted) {
      return fail("NOT_FOUND", "Post not found.", 404);
    }

    let query = postRef
      .collection("comments")
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
        postId: id,
        userId: data.authorUid,
        body: data.body ?? "",
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const lastCreatedAt = lastDoc?.data()?.createdAt?.toMillis?.();
    const nextCursor = lastCreatedAt ? `${lastCreatedAt}_${lastDoc.id}` : null;

    return ok({
      post: {
        id: postSnap.id,
        spaceKey: postSnap.data()?.spaceKey ?? "general",
        title: postSnap.data()?.title ?? null,
        body: postSnap.data()?.body ?? "",
        userId: postSnap.data()?.authorUid ?? "",
        createdAt: postSnap.data()?.createdAt?.toDate?.() ?? null,
      },
      comments: items.reverse(),
      nextCursor,
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts/[id]/comments GET error:", error);
    return fail("SERVER_ERROR", "Failed to load comments.", 500);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };
    await requireRole(uid, "explorer");

    const body = (await request.json().catch(() => ({}))) as Body;
    const content = clampText(body.body);

    if (!content || content.trim().length === 0) {
      return fail("VALIDATION_ERROR", "Comment body is required.", 400);
    }

    const db = firebaseAdmin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const lastCommentAt = userSnap.data()?.communityLastCommentAt?.toMillis?.() ?? 0;
    if (lastCommentAt && Date.now() - lastCommentAt < COMMENT_COOLDOWN_MS) {
      return fail("RATE_LIMITED", "Please wait 10 seconds before commenting again.", 429);
    }
    const commentRef = db
      .collection("community_posts")
      .doc(id)
      .collection("comments")
      .doc();

    await commentRef.set({
      authorUid: uid,
      body: content,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    await userRef.set(
      { communityLastCommentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    const commentSnap = await commentRef.get();

    return ok({ commentId: commentRef.id, createdAt: commentSnap.data()?.createdAt?.toDate?.() ?? null }, 201);
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts/[id]/comments POST error:", error);
    return fail("SERVER_ERROR", "Failed to create comment.", 500);
  }
}
