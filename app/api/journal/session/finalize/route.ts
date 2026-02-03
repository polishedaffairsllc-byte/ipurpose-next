import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";
import {
  finalizeSession,
  getSession,
  getSessionEntries,
  getOrCreateSession,
} from "@/lib/journal/firestoreHelpers";

export async function POST(req: NextRequest) {
  try {
    const uid = await requireUid();
    const body = await req.json().catch(() => ({}));
    const requestedSessionId = (body as { sessionId?: string }).sessionId;

    const session = requestedSessionId
      ? { id: requestedSessionId }
      : await getOrCreateSession(uid);

    const sessionId = session.id;
    if (!sessionId) {
      return fail("INVALID_REQUEST", "Session ID missing.", 400);
    }

    await finalizeSession(uid, sessionId);

    const [finalSession, entries] = await Promise.all([
      getSession(uid, sessionId),
      getSessionEntries(uid, sessionId),
    ]);

    if (!finalSession) {
      return fail("NOT_FOUND", "Session not found after finalize.", 404);
    }

    return ok({ session: finalSession, entries });
  } catch (error) {
    console.error("/api/journal/session/finalize POST error", error);
    const status = (error as { status?: number }).status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    return fail("SERVER_ERROR", "Unable to end session.", status);
  }
}
