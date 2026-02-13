"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const DEFAULT_STEPS = [
  {
    key: "grounding",
    title: "Grounding in the Present",
    prompt: "Take a moment to pause and check in with yourself. Be honest — there are no wrong answers.",
    example: 'Three words: "Tired, hopeful, curious."\nGrounding statement: "Today, I choose to stay present and kind to myself."',
    fields: [
      { key: "grounding_threeWords", label: "What three words describe how you feel about your life right now?" },
      { key: "grounding_connected", label: "When was the last time you felt deeply connected to yourself or your work?" },
      { key: "grounding_release", label: "What is one thing you know you're ready to release?" },
      { key: "grounding_statement", label: 'Grounding Statement: "Today, I choose to…"', required: true },
    ],
  },
  { key: "vision", title: "Vision Alignment", prompt: "Imagine the best possible version of your life. Answer from your heart, not from logic.", example: 'Bold vision: "Launching my dream business and traveling."\nTop 3 desires: "Freedom, stability, community."', fields: [
      { key: "vision_12months", label: "If everything went right in your life for the next 12 months, what would that look like?" },
      { key: "vision_boldest", label: "What is the boldest vision you can imagine for yourself?" },
      { key: "vision_inspires", label: "Who inspires you, and why?" },
      { key: "vision_desire1", label: "Desire 1" },
      { key: "vision_desire2", label: "Desire 2" },
      { key: "vision_desire3", label: "Desire 3" },
    ],
  },
  { key: "selfDiscovery", title: "Self-Discovery & Alignment", prompt: "Notice the patterns that keep showing up and where you feel out of sync. This reflection is not about judgment — it's about awareness, which is the first step to change.", example: "Pattern: \"I keep overcommitting my time.\"\nOut of alignment: \"When I'm working late and skipping family time.\"\nSmall step: \"Set boundaries around my workday.\"\nAlignment statement: \"I am most myself when I am encouraging others to grow.\"", fields: [
      { key: "selfDiscovery_patterns", label: "What patterns or habits keep repeating in your life?" },
      { key: "selfDiscovery_outOfAlignment", label: 'Where do you feel most "out of alignment" right now?' },
      { key: "selfDiscovery_smallStep", label: "What small step could bring you closer to balance?" },
      { key: "selfDiscovery_statement", label: 'Alignment Statement: "I am most myself when…"', required: true },
    ],
  },
  { key: "coreValues", title: "Core Values & Passions", prompt: "Your values are the compass that guide your decisions. Choose the ones that matter most, then reflect on how they show up in your daily life.", example: 'Activities: "Singing and writing make me feel most alive."\nAdvice: "Friends often come to me for encouragement when they feel stuck."\nValues Chosen: Creativity, Family, Integrity.\nReflection:\nCreativity → I honor this by painting every week.\nFamily → I neglect this when I let work spill into weekends.\nIntegrity → I honor this by keeping promises to myself and others.', fields: [
      { key: "coreValues_alive", label: "What activities make you feel most alive?" },
      { key: "coreValues_advice", label: "What do people come to you for advice or help with?" },
      { key: "coreValues_three", label: "Which 3 values do you want to guide your choices?", required: true, type: "checkboxes", options: ["Freedom", "Growth", "Family", "Creativity", "Integrity", "Justice", "Other"] },
      { key: "coreValues_reflection", label: "Write one sentence about how you honor (or neglect) each value." },
    ],
  },
  {
    key: "energyFlow",
    title: "Energy & Flow",
    prompt: "Map out how your energy rises and falls during the day. This helps you plan with purpose.",
    example: "Morning → Focus: \"Creative writing\" | Rest: \"Stretch + tea\"\nAfternoon → Focus: \"Meetings\" | Rest: \"Short walk\"\nEvening → Focus: \"Reading\" | Rest: \"Meditation\"",
    fields: [
      { key: "energy_gives", label: "What gives you energy?" },
      { key: "energy_drains", label: "What drains your energy?" },
      { key: "energy_peak", label: "When during the day do you feel most productive? Most creative?" },
      { key: "energy_schedule", label: "Flow Schedule — Fill in how you want to spend your energy during each part of the day. Use the Focus column for activities that move your purpose forward, and the Rest column for practices that restore you.", required: true, type: "grid", rows: ["Morning", "Afternoon", "Evening"], columns: ["Focus", "Rest"] },
    ],
  },
  {
    key: "purposeAction",
    title: "Purpose in Action",
    prompt: "Think about your impact—the people, message, and legacy that matter to you.",
    example: "Purpose statement: \"My purpose is to teach and inspire so that others believe in their potential.\"",
    fields: [
      { key: "purpose_group", label: "If you could impact one group of people with your gifts, who would it be?" },
      { key: "purpose_message", label: "What message or story do you feel called to share?" },
      { key: "purpose_legacy", label: "What legacy do you want to leave behind?" },
      { key: "purpose_statement", label: "Purpose Statement: \"My purpose is to… so that…\"", required: true },
    ],
  },
  {
    key: "integration",
    title: "Integration & Next Steps",
    prompt: "Bring it all together. This is your commitment to yourself.",
    example: "Commitment letter closing: \"I commit to living in alignment with my purpose, even in small daily choices.\"",
    fields: [
      { key: "integration_surprise", label: "What's the most surprising thing you discovered in this workbook?" },
      { key: "integration_clarity", label: "Which exercise gave you the most clarity?" },
      { key: "integration_bravestep", label: "What is your next brave step?" },
      { key: "integration_commitment", label: "Commitment Letter", required: true, placeholder: "Close with: I commit to living in alignment with my purpose." },
    ],
  },
];

export default function StarterPackClient() {
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUid(u.uid);
        if (u.displayName) setUserName(u.displayName);
      } else {
        setUid(null);
      }
    });
    return () => unsub();
  }, []);

  // load canonical prompts from server endpoint (sanitized)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/resources/starter-pack-prompts');
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        // Merge server prompts with defaults — preserve fields/structure from DEFAULT_STEPS
        const serverSteps = json.steps || [];
        if (!serverSteps.length) return;
        const merged = DEFAULT_STEPS.map((def) => {
          const match = serverSteps.find((s: any) => s.key === def.key);
          if (!match) return def;
          return {
            ...def,
            title: match.title || def.title,
            prompt: [match.intro || '', match.prompt || ''].filter(Boolean).join('\n\n') || def.prompt,
            example: (match.example ? (typeof match.example === 'string' ? match.example : Object.values(match.example).join(' ')) : def.example),
          };
        });
        setSteps(merged);
      } catch (err) {
        // keep defaults on failure
        console.error('Failed to load starter pack prompts', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // load existing responses via server API (uses Admin SDK, bypasses Firestore rules)
  useEffect(() => {
    if (!uid) return;
    // Load responses
    fetch('/api/starter-pack/responses', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Object.keys(json.data).length > 0) {
          setValues(json.data as Record<string, string>);
        }
      })
      .catch((err) => console.error('Failed loading starter pack responses', err));
    // Load user name from profile if not already set
    if (!userName) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then((res) => res.json())
        .then((json) => {
          if (json.user?.displayName) setUserName(json.user.displayName);
        })
        .catch(() => {});
    }
  }, [uid]);

  // simple debounce implementation
  const saveTimer = useRef<number | null>(null);
  async function saveNow(nextValues: Record<string, string>) {
    if (!uid) return;
    setSaving(true);
    try {
      await fetch('/api/starter-pack/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ responses: nextValues }),
      });
    } catch (err) {
      console.error('Failed to save starter pack responses:', err);
    } finally {
      setSaving(false);
    }
  }

  function onChange(key: string, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    // @ts-ignore
    saveTimer.current = window.setTimeout(() => saveNow(next), 700);
  }

  // Build formatted text content for download / print
  const buildFormattedContent = useCallback(() => {
    const separator = "=".repeat(60);
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let content = `iPurpose Starter Pack — ${todayDate}\n`;
    if (userName) content += `Prepared for: ${userName}\n`;
    content += `\n${separator}\n\n`;

    steps.forEach((s) => {
      content += `${s.title.toUpperCase()}\n\n`;
      const fields = (s as any).fields;
      if (fields) {
        fields.forEach((f: any) => {
          if (f.type === 'grid' && f.rows && f.columns) {
            content += `${f.label}\n`;
            f.rows.forEach((row: string) => {
              const cells = f.columns.map((col: string) => {
                const cellKey = `${f.key}_${row.toLowerCase()}_${col.toLowerCase()}`;
                return `${col}: ${values[cellKey] || '(not filled)'}`;
              }).join(' | ');
              content += `  ${row} → ${cells}\n`;
            });
            content += `\n`;
          } else if (f.type === 'checkboxes') {
            content += `${f.label}:\n${values[f.key] || '(not selected)'}\n\n`;
          } else {
            content += `${f.label}:\n${values[f.key] || '(not filled)'}\n\n`;
          }
        });
      } else {
        content += `${values[s.key] || '(not filled)'}\n\n`;
      }
      content += `${separator}\n\n`;
    });

    return content;
  }, [steps, values, userName]);

  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    const modalEl = document.querySelector('[data-starter-pack-summary]');
    if (!modalEl) return;
    const clone = modalEl.cloneNode(true) as HTMLElement;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>iPurpose Starter Pack</title>
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Marcellus&display=swap" rel="stylesheet">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #2A2A2A; max-width: 800px; margin: 0; padding: 2rem; }
          h1 { font-size: 2rem; margin-top: 0; font-family: 'Marcellus', serif; }
          h2 { font-size: 1.5rem; margin-top: 1.5rem; font-family: 'Marcellus', serif; }
          h3 { font-weight: 600; margin-top: 1rem; }
          .section { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e0e0e0; }
          button { display: none !important; }
          .whitespace-pre-line { white-space: pre-line; }
          table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
          th, td { border: 1px solid #e0e0e0; padding: 0.5rem 0.75rem; text-align: left; }
          th { background: #f5f3ff; font-family: 'Marcellus', serif; }
        </style>
      </head>
      <body>${clone.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

  const handleDownload = useCallback(() => {
    const content = buildFormattedContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iPurpose-Starter-Pack-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [buildFormattedContent]);

  const step = steps[current];
  const progress = ((current + 1) / steps.length) * 100;
  const hasFields = !!(step as any).fields?.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">iPurpose Starter Pack</h2>

      {/* Step Navigation Pills */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => {
            const isActive = i === current;
            // A step is "completed" if the single key has a value, or if any field in the fields array has a value
            const stepFields = (s as any).fields;
            const isCompleted = stepFields
              ? stepFields.some((f: any) => !!values[f.key])
              : !!values[s.key];
            return (
              <button
                key={s.key}
                onClick={() => setCurrent(i)}
                className={`
                  px-3 py-2 rounded-full text-xs sm:text-sm font-marcellus transition-all duration-200
                  ${isActive
                    ? 'text-white shadow-md'
                    : isCompleted
                      ? 'bg-lavenderViolet/10 text-lavenderViolet border border-lavenderViolet/20 hover:bg-lavenderViolet/20'
                      : 'bg-gray-50 text-warmCharcoal/50 border border-gray-100 hover:bg-gray-100'
                  }
                `}
                style={isActive ? { background: 'linear-gradient(135deg, #9C88FF, #6B5B95)' } : undefined}
              >
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-warmCharcoal/50 mb-1">
          <span className="font-marcellus">Step {current + 1} of {steps.length}</span>
          <span className="font-marcellus">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #9C88FF, #E6C87C)' }}
          />
        </div>
      </div>

      {/* Step Card */}
      <div className="ipurpose-glow-container">
        <div className="relative bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3">{step.title}</h3>
          <div className="text-sm sm:text-base text-warmCharcoal/70 mb-3 leading-relaxed whitespace-pre-line">{step.prompt}</div>

          {/* Example hint */}
          {step.example && (
            <div className="text-xs text-warmCharcoal/40 italic mb-5 font-marcellus bg-lavenderViolet/5 rounded-lg px-4 py-3 border-l-2 border-lavenderViolet/20 whitespace-pre-line">
              <span className="font-semibold not-italic text-warmCharcoal/50">Example:</span>{'\n'}{step.example}
            </div>
          )}

          {/* Multi-field rendering */}
          {hasFields ? (
            <div className="space-y-5">
              {(step as any).fields.map((field: any) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-warmCharcoal/80 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-salmonPeach ml-1">*</span>}
                  </label>

                  {field.type === 'checkboxes' && field.options ? (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((opt: string) => {
                        const selected = (values[field.key] || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                        const isChecked = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const updated = isChecked
                                ? selected.filter((s: string) => s !== opt)
                                : [...selected, opt];
                              onChange(field.key, updated.join(', '));
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-marcellus transition-all border ${
                              isChecked
                                ? 'bg-lavenderViolet/10 text-lavenderViolet border-lavenderViolet/30'
                                : 'bg-gray-50 text-warmCharcoal/60 border-gray-100 hover:bg-gray-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : field.type === 'grid' && field.rows && field.columns ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr>
                            <th className="p-2 text-left text-warmCharcoal/60 font-marcellus border-b border-lavenderViolet/10 w-28"></th>
                            {field.columns.map((col: string) => (
                              <th key={col} className="p-2 text-center text-warmCharcoal/70 font-marcellus border-b border-lavenderViolet/10 font-semibold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {field.rows.map((row: string) => (
                            <tr key={row}>
                              <td className="p-2 font-marcellus text-warmCharcoal/70 font-semibold border-b border-lavenderViolet/5">{row}</td>
                              {field.columns.map((col: string) => {
                                const cellKey = `${field.key}_${row.toLowerCase()}_${col.toLowerCase()}`;
                                return (
                                  <td key={col} className="p-1.5 border-b border-lavenderViolet/5">
                                    <input
                                      type="text"
                                      value={values[cellKey] || ''}
                                      onChange={(e) => onChange(cellKey, e.target.value)}
                                      placeholder={`${col}…`}
                                      className="w-full border border-lavenderViolet/10 rounded-lg px-3 py-2 text-warmCharcoal/80 text-sm focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30 focus:border-lavenderViolet/30 transition-all"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <textarea
                      value={values[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder || "Start writing here…"}
                      rows={field.key === 'integration_commitment' ? 6 : 3}
                      className="w-full border border-lavenderViolet/10 rounded-xl p-4 text-warmCharcoal/80 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30 focus:border-lavenderViolet/30 transition-all resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <textarea
              value={values[step.key] || ''}
              onChange={(e) => onChange(step.key, e.target.value)}
              placeholder="Start writing here…"
              rows={8}
              className="w-full border border-lavenderViolet/10 rounded-xl p-4 text-warmCharcoal/80 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30 focus:border-lavenderViolet/30 transition-all resize-none"
            />
          )}

          {/* Navigation & Save Status */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                className="px-5 py-2.5 rounded-full text-sm font-marcellus transition-all
                  bg-gray-50 text-warmCharcoal/70 border border-gray-100
                  hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>
              {current < steps.length - 1 ? (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="px-5 py-2.5 rounded-full text-sm font-marcellus text-white transition-all
                    hover:opacity-90 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)' }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowSummary(true)}
                  className="px-5 py-2.5 rounded-full text-sm font-marcellus text-white transition-all
                    hover:opacity-90 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #6B5B95, #9C88FF)' }}
                >
                  ✨ Complete &amp; Review
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-warmCharcoal/40 font-marcellus">
              {saving ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-softGold animate-pulse" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  All changes saved
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary / Print Modal ── */}
      {showSummary && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div
            data-starter-pack-summary
            style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '56rem', width: '100%', maxHeight: '85vh', overflow: 'auto', margin: '2rem 0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Action bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(42,42,42,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(42,42,42,0.6)', textAlign: 'center', margin: 0 }}>
                💡 <strong>Tip:</strong> Print or download your workbook to keep a copy of your reflections
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handlePrint}
                  style={{ flex: 1, padding: '0.875rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                  🖨 Print
                </button>
                <button
                  onClick={handleDownload}
                  style={{ flex: 1, padding: '0.875rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  style={{ flex: 1, padding: '0.875rem', backgroundColor: '#9C88FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8577E8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9C88FF')}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Header */}
            <div style={{ borderBottom: '1px solid rgba(42,42,42,0.1)', paddingBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2A2A2A', marginBottom: '0.5rem', fontFamily: 'Marcellus, serif' }}>
                ✨ iPurpose Starter Pack
              </h1>
              <p style={{ color: 'rgba(42,42,42,0.6)', fontFamily: 'Italiana, serif', fontSize: '1.25rem' }}>
                {userName && <>{userName} · </>}{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Sections — one per step */}
            {steps.map((s) => {
              const fields = (s as any).fields;
              return (
                <div key={s.key} className="section" style={{ borderBottom: '1px solid rgba(42,42,42,0.1)', paddingBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '1rem', fontFamily: 'Marcellus, serif' }}>
                    {s.title}
                  </h2>
                  {fields ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {fields.map((f: any) => {
                        if (f.type === 'grid' && f.rows && f.columns) {
                          return (
                            <div key={f.key}>
                              <p style={{ fontWeight: '600', color: 'rgba(42,42,42,0.6)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                {f.label}
                              </p>
                              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid rgba(156,136,255,0.2)', textAlign: 'left', fontFamily: 'Marcellus, serif', color: 'rgba(42,42,42,0.6)', fontSize: '0.875rem' }}></th>
                                    {f.columns.map((col: string) => (
                                      <th key={col} style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid rgba(156,136,255,0.2)', textAlign: 'left', fontFamily: 'Marcellus, serif', color: 'rgba(42,42,42,0.7)' }}>{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {f.rows.map((row: string) => (
                                    <tr key={row}>
                                      <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(42,42,42,0.05)', fontWeight: '600', color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif' }}>{row}</td>
                                      {f.columns.map((col: string) => {
                                        const cellKey = `${f.key}_${row.toLowerCase()}_${col.toLowerCase()}`;
                                        return (
                                          <td key={col} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(42,42,42,0.05)', color: 'rgba(42,42,42,0.8)', whiteSpace: 'pre-line' }}>
                                            {values[cellKey] || <span style={{ color: 'rgba(42,42,42,0.3)', fontStyle: 'italic' }}>—</span>}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }

                        return (
                          <div key={f.key} style={{ borderLeft: '4px solid rgba(156,136,255,0.3)', paddingLeft: '1rem' }}>
                            <p style={{ fontWeight: '600', color: 'rgba(42,42,42,0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              {f.label}
                            </p>
                            <p style={{ color: '#2A2A2A', whiteSpace: 'pre-line' }}>
                              {values[f.key] || <span style={{ color: 'rgba(42,42,42,0.3)', fontStyle: 'italic' }}>Not yet filled</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#2A2A2A', whiteSpace: 'pre-line' }}>
                      {values[s.key] || <span style={{ color: 'rgba(42,42,42,0.3)', fontStyle: 'italic' }}>Not yet filled</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
