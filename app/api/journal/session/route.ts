import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";
import {
  getOrCreateSession,
  getOrCreateDraftEntry,
} from "@/lib/journal/firestoreHelpers";
import type { JournalEntry } from "@/lib/types/journal";

const ENTRY_CONFIG = [
  {
    key: "affirmation",
    type: "affirmation_reflection" as const,
    promptText: "What does today's affirmation mean to you?",
  },
  {
    key: "intention",
    type: "intention" as const,
    promptText: "What do you want to move forward today?",
  },
  {
    key: "free",
    type: "free_journal" as const,
    promptText: undefined,
  },
];

export async function GET() {
  try {
    const uid = await requireUid();
    const session = await getOrCreateSession(uid);

    const entryPromises = ENTRY_CONFIG.map((config) =>
      getOrCreateDraftEntry(uid, session.id, config.type, "overview", config.promptText)
    );

    const entries = await Promise.all(entryPromises);

    const entryMap = entries.reduce<Record<string, JournalEntry & { id: string }>>((acc, entry, idx) => {
      const key = ENTRY_CONFIG[idx].key;
      acc[key] = entry;
      return acc;
    }, {});

    return ok({ session, entries: entryMap });
  } catch (error) {
    console.error("/api/journal/session GET error", error);
    const status = (error as { status?: number }).status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    return fail("SERVER_ERROR", "Unable to load session.", status);
  }
}
