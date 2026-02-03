import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";
import { autosaveEntry } from "@/lib/journal/firestoreHelpers";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const uid = await requireUid();
    const { entryId } = await context.params;
    if (!entryId) {
      return fail("INVALID_REQUEST", "Entry ID is required.", 400);
    }

    const body = await req.json().catch(() => ({}));
    const { content } = body as { content?: string };

    if (typeof content !== "string") {
      return fail("INVALID_REQUEST", "Content must be a string.", 400);
    }

    await autosaveEntry(uid, entryId, { content });
    return ok({ saved: true });
  } catch (error) {
    console.error(`/api/journal/entry PATCH error`, error);
    const status = (error as { status?: number }).status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    return fail("SERVER_ERROR", "Unable to save entry.", status);
  }
}
