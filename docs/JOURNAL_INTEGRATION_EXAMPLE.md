/**
 * Example: How to integrate the journaling system into the overview/dashboard page
 *
 * This file demonstrates the complete flow:
 * 1. Create/fetch session on page load
 * 2. Render multiple journal entry boxes
 * 3. Handle autosave from client-side
 * 4. Finalize session when user clicks "End Session"
 * 5. Navigate to summary page
 */

import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import {
  getOrCreateSession,
  getOrCreateDraftEntry,
  getSessionEntries,
} from "@/lib/journal/firestoreHelpers";
import type { JournalEntry, Session } from "@/lib/types/journal";

// Server component that fetches initial data
export async function DashboardJournalSection() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;

  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const uid = decoded.uid;

    // 1. Get or create today's session
    const appSession = await getOrCreateSession(uid);

    // 2. Get or create draft entries for each reflection type
    const affirmationEntry = await getOrCreateDraftEntry(
      uid,
      appSession.id,
      "affirmation_reflection",
      "overview",
      "What does today's affirmation mean to you?"
    );

    const intentionEntry = await getOrCreateDraftEntry(
      uid,
      appSession.id,
      "intention",
      "overview",
      "What do you want to move forward today?"
    );

    const freeJournalEntry = await getOrCreateDraftEntry(
      uid,
      appSession.id,
      "free_journal",
      "overview"
    );

    // 3. Fetch any existing entries
    const existingEntries = await getSessionEntries(uid, appSession.id);

    return (
      <JournalSection
        uid={uid}
        sessionId={appSession.id}
        affirmationEntry={affirmationEntry}
        intentionEntry={intentionEntry}
        freeJournalEntry={freeJournalEntry}
        entries={existingEntries}
      />
    );
  } catch (error) {
    console.error("Journal section error:", error);
    return redirect("/login");
  }
}

// Client component that handles interactivity
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { autosaveEntry, finalizeSession } from "@/lib/journal/firestoreHelpers";
import { useJournalEntryAutosave } from "@/lib/journal/useJournalEntryAutosave";
import { JournalEntryBox } from "@/app/components/JournalEntryBox";
import Button from "@/app/components/Button";

interface JournalSectionProps {
  uid: string;
  sessionId: string;
  affirmationEntry: JournalEntry & { id: string };
  intentionEntry: JournalEntry & { id: string };
  freeJournalEntry: JournalEntry & { id: string };
  entries: (JournalEntry & { id: string })[];
}

function JournalSection({
  uid,
  sessionId,
  affirmationEntry,
  intentionEntry,
  freeJournalEntry,
}: JournalSectionProps) {
  const router = useRouter();
  const [isFinalizingSession, setIsFinalizingSession] = useState(false);

  // Use autosave hook for each entry
  const affirmation = useJournalEntryAutosave(
    affirmationEntry.id,
    affirmationEntry.content,
    (content) => autosaveEntry(uid, affirmationEntry.id, { content })
  );

  const intention = useJournalEntryAutosave(
    intentionEntry.id,
    intentionEntry.content,
    (content) => autosaveEntry(uid, intentionEntry.id, { content })
  );

  const freeJournal = useJournalEntryAutosave(
    freeJournalEntry.id,
    freeJournalEntry.content,
    (content) => autosaveEntry(uid, freeJournalEntry.id, { content })
  );

  const handleEndSession = useCallback(async () => {
    setIsFinalizingSession(true);
    try {
      // Finalize all entries and generate summary
      await finalizeSession(uid, sessionId);

      // Navigate to summary page
      router.push(`/journal/session/${sessionId}`);
    } catch (error) {
      console.error("Error finalizing session:", error);
      alert("Failed to end session. Please try again.");
      setIsFinalizingSession(false);
    }
  }, [uid, sessionId, router]);

  return (
    <div className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-marcellus text-warmCharcoal mb-2">
          Today's Reflections
        </h2>
        <p className="text-warmCharcoal/60">
          Take time to journal on your affirmation, intention, and any thoughts
          for today.
        </p>
      </div>

      {/* Affirmation Reflection */}
      <JournalEntryBox
        entry={{ ...affirmationEntry, content: affirmation.content }}
        onContentChange={affirmation.setContent}
        isSaving={affirmation.autosaveState.isPending}
        saveError={affirmation.autosaveState.error}
        lastSavedAt={affirmation.autosaveState.lastSavedAt}
        placeholder="Reflect on today's affirmation..."
      />

      {/* Intention Setting */}
      <JournalEntryBox
        entry={{ ...intentionEntry, content: intention.content }}
        onContentChange={intention.setContent}
        isSaving={intention.autosaveState.isPending}
        saveError={intention.autosaveState.error}
        lastSavedAt={intention.autosaveState.lastSavedAt}
        placeholder="What do you want to move forward today?"
      />

      {/* Free Journal */}
      <JournalEntryBox
        entry={{ ...freeJournalEntry, content: freeJournal.content }}
        onContentChange={freeJournal.setContent}
        isSaving={freeJournal.autosaveState.isPending}
        saveError={freeJournal.autosaveState.error}
        lastSavedAt={freeJournal.autosaveState.lastSavedAt}
        placeholder="Write any additional thoughts..."
      />

      {/* End Session Button */}
      <div className="flex justify-end gap-4 pt-8 border-t border-warmCharcoal/10">
        <Button
          variant="primary"
          size="lg"
          onClick={handleEndSession}
          disabled={isFinalizingSession}
        >
          {isFinalizingSession ? "Finalizing..." : "End Session & View Summary"}
        </Button>
      </div>
    </div>
  );
}

export default JournalSection;

/**
 * Usage in dashboard/page.tsx:
 *
 * import { DashboardJournalSection } from '@/app/components/DashboardJournalSection';
 *
 * export default async function DashboardPage() {
 *   return (
 *     <div className="relative">
 *       <DashboardJournalSection />
 *       {// ... rest of dashboard content ... }
 *     </div>
 *   );
 * }
 */
