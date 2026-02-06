"use client";

import { useCallback, useEffect, useState } from "react";
import type { JournalEntry, Session } from "@/lib/types/journal";
import { useJournalEntryAutosave } from "@/lib/journal/useJournalEntryAutosave";
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
export default function DashboardJournalPanel(props: Props) {
  const safeProps = props ?? ({} as Props);
  const { todaysAffirmation, userName = "Friend" } = safeProps;
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionData, setSessionData] = useState<(Session & { id: string }) | null>(null);
  const [entryMap, setEntryMap] = useState<Partial<Record<string, JournalEntry & { id: string }>>>({});
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSessionFinalized, setIsSessionFinalized] = useState(false);
  const [finalizedSession, setFinalizedSession] = useState<(Session & { id: string }) | null>(null);
  const [finalizedEntries, setFinalizedEntries] = useState<(JournalEntry & { id: string })[]>([]);

  useEffect(() => {
    console.log("DashboardJournalPanel mounted", props);
  }, [props]);

  const loadSession = useCallback(async () => {
    setIsLoadingSession(true);
    setSessionError(null);
    try {
      const res = await fetch("/api/journal/session", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load journal session");
      }
      const json = await res.json();
      const data = json?.data as {
        session?: Session & { id: string };
        entries?: Partial<Record<string, JournalEntry & { id: string }>>;
      };
      if (!data?.session || !data?.entries) {
        throw new Error("Incomplete journal payload");
      }
      setSessionData(data.session);
      setEntryMap(data.entries ?? {});
      setIsSessionFinalized(Boolean(data.session.endedAt));
      if (!data.session.endedAt) {
        setFinalizedSession(null);
        setFinalizedEntries([]);
      }
    } catch (error) {
      console.error("Journal session load error", error);
      setSessionError(error instanceof Error ? error.message : "Failed to load journal session");
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (!props) {
    return <div style={{ color: "red" }}>Dashboard props undefined</div>;
  }

  if (!todaysAffirmation) {
    return <div>Loading dashboard data...</div>;
  }

  const affirmationEntry = entryMap.affirmation;
  const intentionEntry = entryMap.intention;

  const saveEntryContent = useCallback(async (entryId: string | null, newContent: string) => {
    if (!entryId) return;
    const res = await fetch(`/api/journal/entry/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to save entry");
    }
  }, []);

  const affirmationAutosave = useJournalEntryAutosave(
    affirmationEntry?.id ?? null,
    affirmationEntry?.content ?? "",
    (newContent) => saveEntryContent(affirmationEntry?.id ?? null, newContent)
  );

  const intentionAutosave = useJournalEntryAutosave(
    intentionEntry?.id ?? null,
    intentionEntry?.content ?? "",
    (newContent) => saveEntryContent(intentionEntry?.id ?? null, newContent)
  );

  const journalReady = Boolean(sessionData && affirmationEntry && intentionEntry && !sessionError);
  const journalStatusMessage = sessionError
    ? sessionError
    : isLoadingSession
      ? "Loading journaling experience..."
      : "Journal session unavailable. Please refresh.";

  const getSessionDuration = () => {
    const now = new Date();
    const diffMs = now.getTime() - sessionStartTime.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    return diffMins > 0 ? diffMins : 1;
  };

  const handleEndSessionClick = () => {
    if (isSessionFinalized && finalizedSession) {
      setShowSummary(true);
      return;
    }
    if (!sessionData) {
      alert("Session not ready yet.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmEndSession = async () => {
    if (!sessionData) {
      alert("Session not ready yet.");
      return;
    }
    setIsEndingSession(true);
    setShowConfirmation(false);

    try {
      // Force save any pending changes before finalizing
      const savePromises: Promise<void>[] = [];
      
      if (affirmationEntry?.id && affirmationAutosave.content !== affirmationEntry.content) {
        savePromises.push(saveEntryContent(affirmationEntry.id, affirmationAutosave.content));
      }
      
      if (intentionEntry?.id && intentionAutosave.content !== intentionEntry.content) {
        savePromises.push(saveEntryContent(intentionEntry.id, intentionAutosave.content));
      }
      
      // Wait for all saves to complete
      await Promise.all(savePromises);
      
      // Small delay to ensure Firestore writes complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const res = await fetch("/api/journal/session/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionData.id }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to finalize session");
      }
      const json = await res.json();
      const data = json?.data as {
        session?: Session & { id: string };
        entries?: (JournalEntry & { id: string })[];
      };
      if (!data?.session) {
        throw new Error("Session finalize payload missing");
      }
      setFinalizedSession(data.session);
      setFinalizedEntries(data.entries ?? []);
      setIsSessionFinalized(true);
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

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 text-center">
          <p className="font-marcellus tracking-widest text-warmCharcoal/60 uppercase mb-4" style={{ fontSize: '40px' }}>
            TODAY'S AFFIRMATION
          </p>
          <p className="font-marcellus text-warmCharcoal leading-relaxed mb-6" style={{ fontSize: '40px' }}>
            &quot;{todaysAffirmation}&quot;
          </p>
        </div>

        {journalReady && affirmationEntry ? (
          <JournalEntryBox
            entry={{ ...affirmationEntry, content: affirmationAutosave.content }}
            onContentChange={affirmationAutosave.setContent}
            isSaving={affirmationAutosave.autosaveState.isPending}
            saveError={affirmationAutosave.autosaveState.error}
            lastSavedAt={affirmationAutosave.autosaveState.lastSavedAt}
            placeholder="What comes up for you as you sit with this?"
            disabled={isSessionFinalized}
            textStyle={{ fontSize: '40px' }}
          />
        ) : (
          <p className="text-warmCharcoal/70" style={{ fontSize: '40px' }}>{journalStatusMessage}</p>
        )}
      </div>

      <div>
        <div className="mb-4">
          <p className="font-marcellus tracking-widest text-warmCharcoal/60 uppercase mb-4" style={{ fontSize: '40px' }}>
            Today's intention
          </p>
        </div>

        {journalReady && intentionEntry ? (
          <JournalEntryBox
            entry={{ ...intentionEntry, content: intentionAutosave.content }}
            onContentChange={intentionAutosave.setContent}
            isSaving={intentionAutosave.autosaveState.isPending}
            saveError={intentionAutosave.autosaveState.error}
            lastSavedAt={intentionAutosave.autosaveState.lastSavedAt}
            placeholder="What do you want to move forward today?"
            disabled={isSessionFinalized}
            textStyle={{ fontSize: '40px' }}
          />
        ) : (
          <p className="text-warmCharcoal/70" style={{ fontSize: '40px' }}>{journalStatusMessage}</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 border-t border-warmCharcoal/10">
        <Button
          variant="primary"
          size="md"
          onClick={handleEndSessionClick}
          disabled={isEndingSession || !journalReady}
        >
          {isSessionFinalized ? "View Session Summary" : `End Session (${sessionDuration}m)`}
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
      {finalizedSession && (
        <SessionSummaryModal
          isOpen={showSummary}
          session={finalizedSession}
          entries={finalizedEntries}
          onClose={() => setShowSummary(false)}
          userName={userName}
        />
      )}
    </div>
  );
}

