"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JournalEntry } from "@/lib/types/journal";
import { JournalEntryBox } from "./JournalEntryBox";
import Button from "./Button";

type Props = {
  todaysAffirmation: string;
};

/**
 * Dashboard journal panel - displays affirmation and intention entries
 * Now with active "End Session" button with confirmation dialog
 */
export default function DashboardJournalPanel({ todaysAffirmation }: Props) {
  const router = useRouter();
  const [affirmationContent, setAffirmationContent] = useState("");
  const [intentionContent, setIntentionContent] = useState("");
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sessionStartTime] = useState(new Date());

  // In a full implementation, these would be real entries from getOrCreateDraftEntry()
  const mockAffirmationEntry: JournalEntry & { id: string } = {
    id: "affirmation-1",
    type: "affirmation_reflection",
    status: "draft",
    content: affirmationContent,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    dateKey: new Date().toISOString().split("T")[0],
    sessionId: "session-1",
    source: "overview",
    promptText: "What does today's affirmation mean to you?",
  };

  const mockIntentionEntry: JournalEntry & { id: string } = {
    id: "intention-1",
    type: "intention",
    status: "draft",
    content: intentionContent,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    dateKey: new Date().toISOString().split("T")[0],
    sessionId: "session-1",
    source: "overview",
    promptText: "What do you want to move forward today?",
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diffMs = now.getTime() - sessionStartTime.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    return diffMins > 0 ? diffMins : 1;
  };

  const handleEndSessionClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmEndSession = async () => {
    setIsEndingSession(true);
    setShowConfirmation(false);

    try {
      // TODO: In production, call:
      // await finalizeSession(uid, sessionId);
      // const entries = await getSessionEntries(uid, sessionId);
      // const session = await getSession(uid, sessionId);

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to session summary page
      // router.push(`/dashboard/session/session-1`);
      alert("Session ended! (Mock - would redirect to summary page)");
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session. Please try again.");
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const sessionDuration = getSessionDuration();

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold tracking-widest text-warmCharcoal/60 uppercase mb-4 font-montserrat">
            TODAY&apos;S AFFIRMATION
          </p>
          <p className="text-2xl md:text-4xl font-marcellus text-warmCharcoal leading-relaxed mb-6">
            &quot;{todaysAffirmation}&quot;
          </p>
        </div>

        <JournalEntryBox
          entry={{ ...mockAffirmationEntry, content: affirmationContent }}
          onContentChange={setAffirmationContent}
          isSaving={false}
          placeholder="What comes up for you as you sit with this?"
        />
      </div>

      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest text-warmCharcoal/60 uppercase mb-4 font-montserrat">
            Today&apos;s intention
          </p>
        </div>

        <JournalEntryBox
          entry={{ ...mockIntentionEntry, content: intentionContent }}
          onContentChange={setIntentionContent}
          isSaving={false}
          placeholder="What do you want to move forward today?"
        />
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 border-t border-warmCharcoal/10">
        <Button
          variant="primary"
          size="md"
          onClick={handleEndSessionClick}
          disabled={isEndingSession}
        >
          End Session ({sessionDuration}m)
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-2xl space-y-6">
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
                End Session?
              </h3>
              <p className="text-warmCharcoal/70">
                You&apos;ve been journaling for{" "}
                <span className="font-semibold">{sessionDuration} minute{sessionDuration !== 1 ? "s" : ""}</span>.
              </p>
              <p className="text-sm text-warmCharcoal/60 mt-3">
                Once you end, your entries will be finalized and you won&apos;t be able to edit them. You&apos;ll see your session summary.
              </p>
            </div>

            {/* Session Preview */}
            <div className="bg-lavenderViolet/5 rounded-lg p-4 border border-lavenderViolet/20 space-y-2">
              <p className="text-xs font-semibold text-lavenderViolet uppercase">
                ✨ Session Preview
              </p>
              <div className="space-y-2 text-sm text-warmCharcoal/70">
                {affirmationContent && (
                  <p className="truncate">
                    • Affirmation: &quot;{affirmationContent.substring(0, 40)}{affirmationContent.length > 40 ? "..." : ""}&quot;
                  </p>
                )}
                {intentionContent && (
                  <p className="truncate">
                    • Intention: &quot;{intentionContent.substring(0, 40)}{intentionContent.length > 40 ? "..." : ""}&quot;
                  </p>
                )}
                {!affirmationContent && !intentionContent && (
                  <p className="italic text-warmCharcoal/40">No entries yet</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCancel}
                disabled={isEndingSession}
              >
                Keep Journaling
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmEndSession}
                disabled={isEndingSession}
              >
                {isEndingSession ? "Finalizing..." : "End Session"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-warmCharcoal/50 text-center italic">
        Full journaling integration coming soon
      </p>
    </div>
  );
}

