"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/types/journal";
import { JournalEntryBox } from "./JournalEntryBox";
import Button from "./Button";

type Props = {
  todaysAffirmation: string;
};

/**
 * Dashboard journal panel - displays affirmation and intention entries
 * Note: This is a placeholder component. For full implementation with session management,
 * integrate getOrCreateSession() server-side and pass entries as props.
 */
export default function DashboardJournalPanel({ todaysAffirmation }: Props) {
  const [affirmationContent, setAffirmationContent] = useState("");
  const [intentionContent, setIntentionContent] = useState("");

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
        <Button variant="primary" size="md" disabled>
          End Session
        </Button>
      </div>

      <p className="text-xs text-warmCharcoal/50 text-center italic">
        Full journaling integration coming soon
      </p>
    </div>
  );
}

