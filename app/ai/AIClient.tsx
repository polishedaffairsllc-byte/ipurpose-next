"use client";
import React, { useState, useRef } from "react";

export default function AIClient({ initialName }: { initialName?: string }) {
  const [model, setModel] = useState("gpt-4o-mini");
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResponseText("");
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        setResponseText(`Error: ${txt}`);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const dec = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        setResponseText((p) => p + chunk);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        setResponseText((p) => p + "\n\n[Aborted]");
      } else {
        setResponseText((p) => p + "\n\n[Error] " + ((err as { message?: string })?.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={onSubmit} className="ai-panel">
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontWeight: 600 }}>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4o">gpt-4o</option>
          </select>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          style={{ width: "100%", marginBottom: 8 }}
          placeholder={`Hi ${initialName || "there"}, how can I help?`}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>Ask Mentor</button>
          <button type="button" onClick={() => { controllerRef.current?.abort(); }}>Stop</button>
        </div>
      </form>

      <div className="ai-panel" style={{ marginTop: 12 }}>
        <h3>Response</h3>
        <div className="response-box">{responseText || (loading ? "Thinking..." : "No response yet")}</div>
      </div>
    </div>
  );
}
