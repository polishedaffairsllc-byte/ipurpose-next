"use client";

import { useCallback } from "react";
import type { JournalEntry } from "@/lib/types/journal";

interface JournalEntryBoxProps {
  entry: JournalEntry & { id: string };
  onContentChange: (content: string) => void;
  isSaving: boolean;
  saveError?: string;
  lastSavedAt?: Date;
  placeholder?: string;
}

/**
 * Reusable journal entry box component with autosave indicators
 */
export function JournalEntryBox({
  entry,
  onContentChange,
  isSaving,
  saveError,
  lastSavedAt,
  placeholder,
}: JournalEntryBoxProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onContentChange(e.target.value);
    },
    [onContentChange]
  );

  const formatLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-warmCharcoal/70">
          {formatLabel(entry.type)}
        </label>
        <div className="flex items-center gap-2 text-xs">
          {isSaving && (
            <span className="text-blue-500 animate-pulse">Saving...</span>
          )}
          {saveError && (
            <span className="text-red-500" title={saveError}>
              ⚠ Error
            </span>
          )}
          {lastSavedAt && !isSaving && !saveError && (
            <span className="text-warmCharcoal/40">
              Saved {formatTime(lastSavedAt)}
            </span>
          )}
        </div>
      </div>

      {entry.promptText && (
        <p className="text-sm text-warmCharcoal/60 italic">
          "{entry.promptText}"
        </p>
      )}

      <textarea
        value={entry.content}
        onChange={handleChange}
        placeholder={placeholder || "Start writing..."}
        className="w-full h-32 p-4 border border-lavenderViolet/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lavenderViolet focus:border-transparent resize-none"
      />
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 60) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
