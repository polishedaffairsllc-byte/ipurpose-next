"use client";

import React, { useState } from "react";

const topics = [
  "Account & Access",
  "Billing & Membership",
  "Guides & Resources",
  "Press / Partnerships",
  "Something else",
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Account & Access");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setTopic("Account & Access");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-sm shadow-2xl">
      <div className="space-y-4 text-center text-white">
        <p className="uppercase tracking-[0.2em] text-white/60" style={{ fontSize: "35px" }}>
          Contact
        </p>
        <h1 className="font-italiana text-white" style={{ fontSize: "35px" }}>
          We're here to help
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: "35px" }}>
          Calm, clear guidance for account access, billing questions, partnerships, or anything else.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-white/80" style={{ fontSize: "35px" }}>Your name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lavenderViolet/60"
              style={{ fontSize: "35px" }}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/80" style={{ fontSize: "35px" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lavenderViolet/60"
              style={{ fontSize: "35px" }}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/80" style={{ fontSize: "35px" }}>Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lavenderViolet/60"
            style={{ fontSize: "35px" }}
          >
            {topics.map((t) => (
              <option key={t} value={t} className="text-black" style={{ fontSize: "20px" }}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-white/80" style={{ fontSize: "35px" }}>How can we help?</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lavenderViolet/60 min-h-[180px]"
            style={{ fontSize: "35px" }}
            placeholder="Share details, links, or error messages so we can help quickly."
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100" style={{ fontSize: "35px" }}>
            {error}
          </div>
        )}

        {status === "success" && (
          <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-50" style={{ fontSize: "35px" }}>
            Got it! We'll respond within one business day.
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-xl bg-gradient-to-r from-lavenderViolet to-indigoDeep px-6 py-4 text-white font-marcellus shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ fontSize: "35px" }}
        >
          {status === "submitting" ? "Sending..." : "Send message"}
        </button>

        <p className="text-white/60 text-center" style={{ fontSize: "35px" }}>
          Prefer email? Reach us at <a className="underline" href="mailto:support@ipurposesoul.com">support@ipurposesoul.com</a>
        </p>
      </form>
    </div>
  );
}
