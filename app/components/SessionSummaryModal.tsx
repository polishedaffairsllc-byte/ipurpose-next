"use client";

import { useCallback } from "react";
import type { Session, JournalEntry } from "@/lib/types/journal";
import Button from "./Button";

interface SessionSummaryModalProps {
  isOpen: boolean;
  session: Session & { id: string };
  entries: (JournalEntry & { id: string })[];
  onClose: () => void;
  userName?: string;
}

/**
 * Session Summary Modal - displays finalized entries in a popup
 */
export function SessionSummaryModal({
  isOpen,
  session,
  entries,
  onClose,
  userName = "Friend",
}: SessionSummaryModalProps) {
  const handlePrint = useCallback(() => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    // Get the modal content
    const modalElement = document.querySelector('[data-print-modal]');
    if (!modalElement) return;

    // Clone the content
    const content = modalElement.cloneNode(true) as HTMLElement;
    
    // Write to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${userName}'s Journal Session Summary</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #2A2A2A;
            max-width: 800px;
            margin: 0;
            padding: 2rem;
          }
          h1 { font-size: 2.25rem; margin-top: 0; }
          h2 { font-size: 1.875rem; margin-top: 1.5rem; }
          h3 { font-weight: 600; }
          .entry { border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
          .tags { margin-top: 0.5rem; font-size: 0.875rem; }
          .tag { display: inline-block; background: #f0f0f0; padding: 0.25rem 0.5rem; margin-right: 0.5rem; border-radius: 12px; }
          button { display: none; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

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
  }, [session, entries]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }} data-print-modal>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '42rem', width: '100%', margin: '2rem 0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(42, 42, 42, 0.1)', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2A2A2A', marginBottom: '0.5rem' }}>
            ✨ {userName}&apos;s Journal Session Summary
          </h1>
          <p style={{ color: 'rgba(42, 42, 42, 0.6)' }}>
            {new Date(session.dateKey).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* AI-Generated Summary */}
        {session.summary && (
          <div style={{ backgroundColor: 'rgba(156, 136, 255, 0.05)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(156, 136, 255, 0.2)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '1rem' }}>
              Session Highlights
            </h2>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2A2A2A', marginBottom: '1rem' }}>
              {session.summary.title}
            </h3>
            {session.summary.highlights.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {session.summary.highlights.map((highlight, idx) => (
                  <li key={idx} style={{ color: 'rgba(42, 42, 42, 0.75)', display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: '#9C88FF' }}>•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2A2A2A' }}>
            Your Reflections
          </h2>
          {entries.length === 0 ? (
            <p style={{ color: 'rgba(42, 42, 42, 0.6)', fontStyle: 'italic' }}>
              No entries in this session.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                style={{ border: '1px solid rgba(42, 42, 42, 0.1)', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#2A2A2A', textTransform: 'capitalize' }}>
                      {entry.type.replace(/_/g, " ")}
                    </h3>
                    {entry.promptText && (
                      <p style={{ fontSize: '0.875rem', color: 'rgba(42, 42, 42, 0.6)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        &quot;{entry.promptText}&quot;
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(42, 42, 42, 0.4)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                    {entry.source}
                  </span>
                </div>
                <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-wrap', lineHeight: '1.625' }}>
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(42, 42, 42, 0.05)' }}>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(156, 136, 255, 0.1)', color: '#9C88FF' }}
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
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '2rem', borderTop: '1px solid rgba(42, 42, 42, 0.1)' }}>
          <button
            onClick={handlePrint}
            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            🖨 Print
          </button>
          <button
            onClick={handleDownload}
            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            ⬇ Download
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#9C88FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
