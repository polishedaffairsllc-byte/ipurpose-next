"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JournalEntry, Session } from "@/lib/types/journal";
import { JournalEntryBox } from "./JournalEntryBox";
import { SessionSummaryModal } from "./SessionSummaryModal";
import Button from "./Button";

type Props = {
  todaysAffirmation: string;
  userName?: string;
};

/**
 * Dashboard journal panel - displays affirmation and intention entries
 * Now with active "End Session" button with confirmation dialog
 */
export default function DashboardJournalPanel({ todaysAffirmation, userName = "Friend" }: Props) {
  const router = useRouter();
  const [affirmationContent, setAffirmationContent] = useState("");
  const [intentionContent, setIntentionContent] = useState("");
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
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
    console.log("End Session clicked!");
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

      // Show summary modal
      setShowSummary(true);
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

  // Mock session data for summary
  const mockSession: Session & { id: string } = {
    id: "session-1",
    startedAt: sessionStartTime as any,
    endedAt: new Date() as any,
    dateKey: new Date().toISOString().split("T")[0],
    summary: {
      title: `A Beautiful Session`,
      highlights: affirmationContent
        ? [`Affirmation: ${affirmationContent.substring(0, 60)}`]
        : [],
      generatedAt: new Date() as any,
      model: "user",
    },
  };

  // Mock entries for summary
  const mockEntries: (JournalEntry & { id: string })[] = [];
  if (affirmationContent) {
    mockEntries.push({
      id: "affirmation-1",
      type: "affirmation_reflection",
      status: "final",
      content: affirmationContent,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      dateKey: new Date().toISOString().split("T")[0],
      sessionId: "session-1",
      source: "overview",
      promptText: "What does today's affirmation mean to you?",
    });
  }
  if (intentionContent) {
    mockEntries.push({
      id: "intention-1",
      type: "intention",
      status: "final",
      content: intentionContent,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      dateKey: new Date().toISOString().split("T")[0],
      sessionId: "session-1",
      source: "overview",
      promptText: "What do you want to move forward today?",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 text-center">
          <p className="text-xs font-marcellus tracking-widest text-warmCharcoal/60 uppercase mb-4">
            TODAY'S AFFIRMATION
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
          <p className="text-xs font-marcellus tracking-widest text-warmCharcoal/60 uppercase mb-4">
            Today's intention
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

      {/* Confirmation Dialog - Simple Test */}
      {showConfirmation && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '28rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              End Session?
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              You&apos;ve been journaling for <strong>{sessionDuration} minute{sessionDuration !== 1 ? "s" : ""}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleCancel}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Keep Journaling
              </button>
              <button
                onClick={handleConfirmEndSession}
                disabled={isEndingSession}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#9C88FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                {isEndingSession ? "Finalizing..." : "End Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={showSummary}
        session={mockSession}
        entries={mockEntries}
        onClose={() => setShowSummary(false)}
        userName={userName}
      />
    </div>
  );
}

