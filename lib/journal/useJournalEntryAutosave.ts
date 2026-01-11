"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { JournalEntry, AutosaveState } from "@/lib/types/journal";

const AUTOSAVE_DELAY = 1000; // 1 second debounce

/**
 * Hook for autosaving journal entries with debouncing
 */
export function useJournalEntryAutosave(
  entryId: string | null,
  initialContent: string,
  onSave: (content: string) => Promise<void>
) {
  const [content, setContent] = useState(initialContent);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    isPending: false,
    isError: false,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounced save function
  const scheduleAutosave = useCallback(
    (newContent: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set pending state immediately
      if (isMountedRef.current) {
        setAutosaveState((prev) => ({ ...prev, isPending: true }));
      }

      // Schedule new save
      timeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current || !entryId) return;

        try {
          await onSave(newContent);
          if (isMountedRef.current) {
            setAutosaveState({
              isPending: false,
              isError: false,
              lastSavedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Autosave error:", error);
          if (isMountedRef.current) {
            setAutosaveState({
              isPending: false,
              isError: true,
              error: error instanceof Error ? error.message : "Save failed",
            });
          }
        }
      }, AUTOSAVE_DELAY);
    },
    [entryId, onSave]
  );

  const handleChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      scheduleAutosave(newContent);
    },
    [scheduleAutosave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    setContent: handleChange,
    autosaveState,
  };
}
