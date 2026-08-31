"use client";
import React, { useState, useRef, useEffect } from "react";
import { ResponseMode, getLocalResponseMode, setLocalResponseMode, saveUserResponseMode } from "@/lib/ai/responseModePersistence";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: ResponseMode;
  inferredLens?: "soul" | "systems" | "ai";
}

interface ConversationSummary {
  id: string;
  title: string;
  responseMode: ResponseMode;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AIClient({ initialName, userId }: { initialName?: string; userId?: string }) {
  const [responseMode, setResponseModeState] = useState<ResponseMode>("balanced");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize response mode from localStorage
  useEffect(() => {
    const savedMode = getLocalResponseMode();
    setResponseModeState(savedMode);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialConversation() {
      try {
        const listResponse = await fetch("/api/ai/conversations", { cache: "no-store" });
        if (!listResponse.ok) throw new Error("Unable to load conversations");
        const listData = await listResponse.json();
        const available = (listData.conversations || []) as ConversationSummary[];
        if (cancelled) return;
        setConversations(available);

        const latest = available[0];
        if (!latest) return;
        const messageResponse = await fetch(`/api/ai/conversations/${latest.id}`, {
          cache: "no-store",
        });
        if (!messageResponse.ok) throw new Error("Unable to load conversation");
        const messageData = await messageResponse.json();
        if (cancelled) return;

        setConversationId(latest.id);
        setResponseModeState(latest.responseMode);
        setLocalResponseMode(latest.responseMode);
        setMessages((messageData.messages || []).map((message: ChatMessage & { createdAt: string }) => ({
          ...message,
          timestamp: new Date(message.createdAt),
        })));
      } catch (error) {
        console.warn("Could not restore Mentor conversation:", error);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    }

    loadInitialConversation();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setResponseMode = (mode: ResponseMode) => {
    setResponseModeState(mode);
    setLocalResponseMode(mode);
    if (userId) {
      saveUserResponseMode(userId, mode).catch(console.error);
    }
  };

  async function selectConversation(id: string) {
    controllerRef.current?.abort();
    if (!id) {
      setConversationId(null);
      setMessages([]);
      return;
    }

    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load conversation");
      const data = await response.json();
      const selected = conversations.find((conversation) => conversation.id === id);
      setConversationId(id);
      if (selected) {
        setResponseModeState(selected.responseMode);
        setLocalResponseMode(selected.responseMode);
      }
      setMessages((data.messages || []).map((message: ChatMessage & { createdAt: string }) => ({
        ...message,
        timestamp: new Date(message.createdAt),
      })));
    } catch (error) {
      console.warn("Could not load Mentor conversation:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function startNewConversation() {
    controllerRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setPrompt("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
      mode: responseMode,
    };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    // Reset abort controller
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          responseMode,
          conversationId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to get response");
      }

      const data = await res.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
        try {
          const listResponse = await fetch("/api/ai/conversations", { cache: "no-store" });
          if (listResponse.ok) {
            const listData = await listResponse.json();
            setConversations(listData.conversations || []);
          }
        } catch (error) {
          console.warn("Could not refresh Mentor conversation list:", error);
        }
      }

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
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "[Aborted by user]"
          : `[Error] ${(err as { message?: string })?.message || String(err)}`;

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: errorMsg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Response Mode Selector */}
      <div className="ai-panel mb-6 p-4">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Response Mode:</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["balanced", "reflect", "build", "expand"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setResponseMode(mode)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  backgroundColor: responseMode === mode ? "#9C88FF" : "#f5f5f5",
                  color: responseMode === mode ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: responseMode === mode ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          {responseMode === "balanced" && "Smart mode: The AI suggests a Soul, Systems, or AI perspective based on your input to help structure your thinking."}
          {responseMode === "reflect" && "Alignment focus: Explore purpose, values, and inner clarity"}
          {responseMode === "build" && "Systems focus: Structure workflows, processes, and offers"}
          {responseMode === "expand" && "Strategy focus: Leverage automation and scale impact"}
        </p>
      </div>

      <div className="ai-panel mb-4 p-4" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label htmlFor="mentor-conversation" style={{ fontWeight: 600, fontSize: 14 }}>
          Conversation:
        </label>
        <select
          id="mentor-conversation"
          value={conversationId || ""}
          onChange={(event) => selectConversation(event.target.value)}
          disabled={loading || isHistoryLoading}
          style={{ flex: "1 1 240px", minWidth: 0 }}
        >
          <option value="">New conversation</option>
          {conversations.map((conversation) => (
            <option key={conversation.id} value={conversation.id}>
              {conversation.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={startNewConversation} disabled={loading || isHistoryLoading}>
          New
        </button>
      </div>

      {/* Chat Messages */}
      <div className="ai-panel mb-6" style={{ maxHeight: 400, overflowY: "auto", padding: 12 }}>
        {isHistoryLoading ? (
          <p style={{ color: "#999", fontStyle: "italic", textAlign: "center" }}>
            Loading your Mentor conversation...
          </p>
        ) : messages.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic", textAlign: "center" }}>
            Start a conversation with your iPurpose Mentor...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 6,
                backgroundColor: msg.role === "user" ? "#f0e6ff" : "#f9f9f9",
                borderLeft: `3px solid ${msg.role === "user" ? "#9C88FF" : "#ccc"}`,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#666" }}>
                {msg.role === "user" ? "You" : "iPurpose Mentor"}
                {msg.inferredLens && msg.role === "assistant" && (
                  <span style={{ marginLeft: 8, color: "#9C88FF", fontSize: 11 }}>
                    ({msg.inferredLens})
                  </span>
                )}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <form onSubmit={onSubmit} className="ai-panel">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={4000}
          style={{ width: "100%", marginBottom: 12, fontFamily: "inherit" }}
          placeholder={`Hi ${initialName || "there"} — share what you're thinking through, and the Mentor will help you reflect and organize your next steps.`}
          disabled={loading || isHistoryLoading}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading || isHistoryLoading || !prompt.trim()}>
            {loading ? "Thinking..." : "Ask Mentor"}
          </button>
          <button type="button" onClick={() => controllerRef.current?.abort()} disabled={!loading}>
            Stop
          </button>
        </div>
      </form>
    </div>
  );
}
