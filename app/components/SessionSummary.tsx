"use client";

import { useCallback } from "react";
import type { Session, JournalEntry } from "@/lib/types/journal";
import { timestampToDate } from "@/lib/journal/dateUtils";
import Button from "./Button";

interface SessionSummaryProps {
  session: Session & { id: string };
  entries: (JournalEntry & { id: string })[];
  onPrint?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
}

/**
 * Session Summary component
 * Displays finalized entries and session summary
 */
export function SessionSummary({
  session,
  entries,
  onPrint,
  onDownload,
  onClose,
}: SessionSummaryProps) {
  const handlePrint = useCallback(() => {
    window.print();
    onPrint?.();
  }, [onPrint]);

  const handleDownload = useCallback(() => {
    const text = generateTextContent(session, entries);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-session-${session.dateKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  }, [session, entries, onDownload]);

  const endedAt = session.endedAt ? timestampToDate(session.endedAt) : null;
  const startedAt = timestampToDate(session.startedAt);

  return (
    <div className="space-y-8 py-8 print:py-0">
      {/* Header */}
      <div className="border-b border-warmCharcoal/10 pb-8 print:pb-4">
        <h1 className="text-4xl font-marcellus text-warmCharcoal mb-2">
          Session Summary
        </h1>
        <p className="text-warmCharcoal/60">
          {new Date(session.dateKey).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {startedAt && endedAt && (
          <p className="text-sm text-warmCharcoal/50 mt-2">
            Duration: {formatDuration(startedAt, endedAt)}
          </p>
        )}
      </div>

      {/* AI-Generated Summary */}
      {session.summary && (
        <div className="bg-lavenderViolet/5 rounded-xl p-6 border border-lavenderViolet/20 print:border-gray-300">
          <h2 className="text-lg font-semibold text-warmCharcoal mb-4">
            ✨ Session Highlights
          </h2>
          <h3 className="text-2xl font-marcellus text-warmCharcoal mb-4">
            {session.summary.title}
          </h3>
          {session.summary.highlights.length > 0 && (
            <ul className="space-y-2">
              {session.summary.highlights.map((highlight, idx) => (
                <li key={idx} className="text-warmCharcoal/75 flex gap-3">
                  <span className="text-lavenderViolet">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="space-y-6">
        <h2 className="text-2xl font-marcellus text-warmCharcoal">Entries</h2>
        {entries.length === 0 ? (
          <p className="text-warmCharcoal/60 italic">No entries in this session.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-warmCharcoal/10 rounded-lg p-6 bg-white/40 print:bg-white print:border-gray-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-warmCharcoal capitalize">
                    {entry.type.replace(/_/g, " ")}
                  </h3>
                  {entry.promptText && (
                    <p className="text-sm text-warmCharcoal/60 italic mt-1">
                      "{entry.promptText}"
                    </p>
                  )}
                </div>
                <span className="text-xs text-warmCharcoal/40 whitespace-nowrap ml-4">
                  {entry.source}
                </span>
              </div>
              <p className="text-warmCharcoal/80 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-warmCharcoal/5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-lavenderViolet/10 text-lavenderViolet"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-8 border-t border-warmCharcoal/10 print:hidden">
        <Button variant="secondary" size="md" onClick={handlePrint}>
          🖨 Print
        </Button>
        <Button variant="secondary" size="md" onClick={handleDownload}>
          ⬇ Download as Text
        </Button>
        {onClose && (
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function generateTextContent(
  session: Session & { id: string },
  entries: (JournalEntry & { id: string })[]
): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("JOURNAL SESSION SUMMARY");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push(`Date: ${session.dateKey}`);
  if (session.summary) {
    lines.push(`Title: ${session.summary.title}`);
  }
  lines.push("");

  if (session.summary && session.summary.highlights.length > 0) {
    lines.push("HIGHLIGHTS:");
    session.summary.highlights.forEach((h) => lines.push(`  • ${h}`));
    lines.push("");
  }

  lines.push("-".repeat(60));
  lines.push("ENTRIES");
  lines.push("-".repeat(60));
  lines.push("");

  entries.forEach((entry, idx) => {
    lines.push(`${idx + 1}. ${entry.type.replace(/_/g, " ").toUpperCase()}`);
    if (entry.promptText) {
      lines.push(`   Prompt: ${entry.promptText}`);
    }
    lines.push("");
    lines.push(entry.content);
    lines.push("");
    lines.push("-".repeat(40));
    lines.push("");
  });

  return lines.join("\n");
}
