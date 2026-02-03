"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { AutosaveState } from "@/lib/types/journal";

const AUTOSAVE_DELAY = 1000; // 1 second debounce
const FALLBACK_ENTRY_KEY = "__draft__";

type DraftSnapshot = {
  key: string;
  value: string;
};

type AutosaveSnapshot = {
  key: string;
  state: AutosaveState;
};

const idleAutosaveState = (): AutosaveState => ({
  isPending: false,
  isError: false,
});

/**
 * Hook for autosaving journal entries with debouncing
 */
export function useJournalEntryAutosave(
  entryId: string | null,
  initialContent: string,
  onSave: (content: string) => Promise<void>
) {
  const entryKey = entryId ?? FALLBACK_ENTRY_KEY;
  const versionKey = `${entryKey}::${initialContent}`;

  const [draftSnapshot, setDraftSnapshot] = useState<DraftSnapshot>(() => ({
    key: versionKey,
    value: initialContent,
  }));

  const [autosaveSnapshot, setAutosaveSnapshot] = useState<AutosaveSnapshot>(() => ({
    key: versionKey,
    state: idleAutosaveState(),
  }));

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const versionKeyRef = useRef(versionKey);

  useEffect(() => {
    versionKeyRef.current = versionKey;
  }, [versionKey]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [versionKey]);

  const content = draftSnapshot.key === versionKey ? draftSnapshot.value : initialContent;
  const autosaveState =
    autosaveSnapshot.key === versionKey ? autosaveSnapshot.state : idleAutosaveState();

  const scheduleAutosave = useCallback(
    (newContent: string) => {
      if (!entryId) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const saveKey = versionKey;

      setAutosaveSnapshot((prev) => {
        const baseState = prev.key === saveKey ? prev.state : idleAutosaveState();
        return {
          key: saveKey,
          state: {
            ...baseState,
            isPending: true,
            isError: false,
            error: undefined,
          },
        };
      });

      timeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current || versionKeyRef.current !== saveKey) {
          return;
        }

        try {
          await onSave(newContent);
          if (!isMountedRef.current || versionKeyRef.current !== saveKey) {
            return;
          }

          setAutosaveSnapshot((prev) => {
            if (prev.key !== saveKey) return prev;
            return {
              key: saveKey,
              state: {
                ...prev.state,
                isPending: false,
                isError: false,
                error: undefined,
                lastSavedAt: new Date(),
              },
            };
          });
        } catch (error) {
          console.error("Autosave error:", error);
          if (!isMountedRef.current || versionKeyRef.current !== saveKey) {
            return;
          }

          const message = error instanceof Error ? error.message : "Save failed";
          setAutosaveSnapshot((prev) => {
            if (prev.key !== saveKey) return prev;
            return {
              key: saveKey,
              state: {
                ...prev.state,
                isPending: false,
                isError: true,
                error: message,
              },
            };
          });
        }
      }, AUTOSAVE_DELAY);
    },
    [entryId, onSave, versionKey]
  );

  const handleChange = useCallback(
    (newContent: string) => {
      setDraftSnapshot({ key: versionKey, value: newContent });
      scheduleAutosave(newContent);
    },
    [scheduleAutosave, versionKey]
  );

  return {
    content,
    setContent: handleChange,
    autosaveState,
  };
}
