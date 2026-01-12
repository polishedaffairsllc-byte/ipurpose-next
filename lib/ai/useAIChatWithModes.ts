/**
 * useAIChatWithModes Hook
 * Manages chat state, response mode selection, and mode persistence
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { ResponseMode, getLocalResponseMode, setLocalResponseMode, saveUserResponseMode, initializeResponseMode } from "@/lib/ai/responseModePersistence";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: ResponseMode;
  inferredLens?: "soul" | "systems" | "ai";
}

interface UseAIChatWithModesProps {
  userId: string | null;
  conversationId?: string;
}

export function useAIChatWithModes({ userId, conversationId = "default" }: UseAIChatWithModesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responseMode, setResponseModeState] = useState<ResponseMode>("balanced");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize response mode on mount
  useEffect(() => {
    (async () => {
      const initialMode = await initializeResponseMode(userId);
      setResponseModeState(initialMode);
      setIsInitialized(true);
    })();
  }, [userId]);

  // Update response mode
  const setResponseMode = useCallback(
    async (mode: ResponseMode) => {
      setResponseModeState(mode);
      setLocalResponseMode(mode);

      // Save to Firestore if authenticated
      if (userId) {
        await saveUserResponseMode(userId, mode);
      }
    },
    [userId]
  );

  // Send a chat message
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      const messageId = `msg_${Date.now()}`;
      const newMessage: ChatMessage = {
        id: messageId,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
        mode: responseMode,
      };

      // Add user message to state immediately
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Call chat API with responseMode and userId
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            responseMode,
            conversationId,
            userId,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from AI coach");
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          mode: responseMode,
          inferredLens: data.inferredLens,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [responseMode, conversationId, userId, messages]
  );

  return {
    messages,
    responseMode,
    setResponseMode,
    sendMessage,
    isLoading,
    error,
    isInitialized,
    conversationId,
  };
}
