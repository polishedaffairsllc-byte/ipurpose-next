import { ok, fail } from "@/lib/http";
import { clampText } from "@/lib/validators";
import { requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";

type Body = { title?: string; body?: string; isDeleted?: boolean };

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };
    await requireRole(uid, "explorer");

    const db = firebaseAdmin.firestore();
    const postRef = db.collection("community_posts").doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists || postSnap.data()?.isDeleted) {
      return fail("NOT_FOUND", "Post not found.", 404);
    }

    const data = postSnap.data();
    return ok({
      post: {
        id: postSnap.id,
        spaceKey: data?.spaceKey ?? "general",
        title: data?.title ?? null,
        body: data?.body ?? "",
        userId: data?.authorUid ?? "",
        createdAt: data?.createdAt?.toDate?.() ?? null,
      },
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts/[id] GET error:", error);
    return fail("SERVER_ERROR", "Failed to load post.", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };
    await requireRole(uid, "explorer");

    const body = (await request.json().catch(() => ({}))) as Body;
    const title = body.title !== undefined ? clampText(body.title, 200) : undefined;
    const content = body.body !== undefined ? clampText(body.body) : undefined;
    const isDeleted = typeof body.isDeleted === "boolean" ? body.isDeleted : undefined;

    if (title === undefined && content === undefined && isDeleted === undefined) {
      return fail("VALIDATION_ERROR", "Provide title, body, or delete flag to update.", 400);
    }

    const db = firebaseAdmin.firestore();
    const postRef = db.collection("community_posts").doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return fail("NOT_FOUND", "Post not found.", 404);
    }

    const postData = postSnap.data();
    if (postData?.authorUid !== uid) {
      return fail("FORBIDDEN", "You can only edit your own post.", 403);
    }

    await postRef.set(
      {
        title: title ?? postData?.title,
        body: content ?? postData?.body,
        isDeleted: isDeleted ?? postData?.isDeleted ?? false,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ updated: true });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this space.", 403);
    console.error("/api/community/posts/[id] PATCH error:", error);
    return fail("SERVER_ERROR", "Failed to update post.", 500);
  }
}
