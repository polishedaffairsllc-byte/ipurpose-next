"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const DEFAULT_STEPS = [
  {
    key: "readiness",
    title: "AI Readiness Check",
    prompt: "Before diving into tools and prompts, let's understand where you are right now with AI. There's no wrong answer — this is about clarity, not judgment.",
    example: "Current comfort: \"I've used ChatGPT a few times but don't feel confident.\"\nBiggest hesitation: \"I'm afraid it'll make my work sound generic.\"",
    fields: [
      { key: "readiness_comfort", label: "How would you describe your current comfort level with AI?", type: "checkboxes", options: ["Never used it", "Tried it once or twice", "Use it sometimes", "Use it regularly", "I feel confident"] },
      { key: "readiness_used", label: "Which AI tools have you tried? (e.g., ChatGPT, Claude, Gemini, Canva AI, etc.)" },
      { key: "readiness_hesitation", label: "What's your biggest hesitation or concern about using AI in your work?" },
      { key: "readiness_excited", label: "What excites you most about what AI could do for you?" },
      { key: "readiness_statement", label: "Readiness Statement: \"Right now, my relationship with AI is…\"", required: true },
    ],
  },
  {
    key: "values",
    title: "Your Values Filter",
    prompt: "AI is a tool — and like any tool, it should serve your values, not override them. Let's define what stays human and what AI is allowed to support.",
    example: "Non-negotiable: \"My personal stories and voice — AI doesn't write those.\"\nAI can help: \"Organizing my ideas into outlines and drafting first passes of emails.\"",
    fields: [
      { key: "values_nonneg", label: "What parts of your work should always stay 100% human? (your voice, stories, client relationships, etc.)" },
      { key: "values_aihelp", label: "Where would you welcome AI support? (brainstorming, drafting, organizing, research, etc.)" },
      { key: "values_boundary", label: "What's one boundary you want to set with AI? (e.g., \"I won't publish anything AI writes without editing it first.\")" },
      { key: "values_three", label: "Choose 3 values that guide how you'll use AI:", required: true, type: "checkboxes", options: ["Authenticity", "Integrity", "Efficiency", "Creativity", "Transparency", "Simplicity", "Excellence", "Other"] },
      { key: "values_statement", label: "Values Filter Statement: \"I will use AI to support my work, but never to…\"", required: true },
    ],
  },
  {
    key: "prompts",
    title: "Prompt Library",
    prompt: "Great prompts are the key to great AI output. Here are ready-to-use prompts organized by what you actually need to do. Read each one, try it, and note which ones resonate most.",
    example: "Favorite prompt: \"Help me outline a newsletter about [topic] for [audience]. Keep my tone warm and direct.\"\nWhy: \"It saved me 30 minutes and the outline was 80% usable.\"",
    fields: [
      { key: "prompts_clarity", label: "🧭 CLARITY — Try this prompt:\n\"I'm working on [project]. Help me identify the 3 most important questions I should answer before moving forward.\"  \n\nPaste what you got back (or your reaction):" },
      { key: "prompts_content", label: "✍️ CONTENT — Try this prompt:\n\"Write a first draft of a [blog post / email / social caption] about [topic] for [audience]. Use a [warm / professional / bold] tone. Keep it under [word count].\" \n\nPaste what you got back (or your reaction):" },
      { key: "prompts_planning", label: "📋 PLANNING — Try this prompt:\n\"I have [goal]. Break this into a 30-day action plan with weekly milestones. Keep each step simple and achievable.\" \n\nPaste what you got back (or your reaction):" },
      { key: "prompts_messaging", label: "💬 MESSAGING — Try this prompt:\n\"Help me explain [what I do] to someone who's never heard of it. Make it clear, compelling, and under 2 sentences.\" \n\nPaste what you got back (or your reaction):" },
      { key: "prompts_favorite", label: "Which prompt category felt most useful to you?", type: "checkboxes", options: ["Clarity", "Content", "Planning", "Messaging"] },
      { key: "prompts_own", label: "Write your own custom prompt for something you actually need help with right now:", required: true },
    ],
  },
  {
    key: "workflow",
    title: "Your AI Workflow Map",
    prompt: "Now let's map your actual work. For each area, decide: does AI help here, or does this stay fully human? This becomes your personal operating system for AI.",
    example: "Content Creation → AI helps with outlines, I write the final version.\nClient Communication → Stays human. Always.\nResearch → AI does first pass, I verify and curate.",
    fields: [
      { key: "workflow_map", label: "Map your key work areas. For each row, note what AI handles vs. what stays human.", required: true, type: "grid", rows: ["Content Creation", "Client Communication", "Research & Learning", "Planning & Strategy", "Admin & Organization"], columns: ["AI Supports", "Stays Human"] },
      { key: "workflow_firsttask", label: "What's the first task you'll hand to AI this week?" },
      { key: "workflow_timesave", label: "Where do you spend the most time that AI could reduce? Be specific." },
      { key: "workflow_rule", label: "Your Workflow Rule: \"Before I publish/send/share anything AI helped create, I will always…\"", required: true },
    ],
  },
  {
    key: "guardrails",
    title: "Ethical Guardrails",
    prompt: "AI is powerful — and power needs guardrails. This is your personal AI ethics agreement. It's not about rules from the outside; it's about integrity from the inside.",
    example: "Agreement: \"I will always disclose when AI significantly contributed to my work. I will never use AI to deceive or misrepresent my expertise.\"",
    fields: [
      { key: "guardrails_disclose", label: "Will you disclose when AI helps create your content? How?", type: "checkboxes", options: ["Always disclose", "Disclose for major pieces", "Only if asked", "Still deciding"] },
      { key: "guardrails_wontdo", label: "What will you NEVER use AI for? (e.g., faking expertise, replacing genuine connection, etc.)" },
      { key: "guardrails_check", label: "Before using AI output, what's your quality check? (e.g., \"Does this sound like me? Is it accurate? Would I say this in person?\")" },
      { key: "guardrails_agreement", label: "Your Personal AI Ethics Agreement — write 3-5 commitments:", required: true, placeholder: "Example:\n1. I will always edit AI output to reflect my true voice.\n2. I will not use AI to create content I don't understand.\n3. I will be transparent with my audience about my AI use.\n4. I will prioritize human connection over efficiency.\n5. I will revisit these guardrails quarterly." },
      { key: "guardrails_revisit", label: "When will you revisit and update these guardrails? (e.g., monthly, quarterly)" },
    ],
  },
];

export default function AIBlueprintClient() {
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [steps] = useState(DEFAULT_STEPS);
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

  // load existing responses via server API
  useEffect(() => {
    if (!uid) return;
    fetch('/api/ai-blueprint/responses', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Object.keys(json.data).length > 0) {
          setValues(json.data as Record<string, string>);
        }
      })
      .catch((err) => console.error('Failed loading AI Blueprint responses', err));
    if (!userName) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then((res) => res.json())
        .then((json) => {
          if (json.user?.displayName) setUserName(json.user.displayName);
        })
        .catch(() => {});
    }
  }, [uid]);

  const saveTimer = useRef<number | null>(null);
  async function saveNow(nextValues: Record<string, string>) {
    if (!uid) return;
    setSaving(true);
    try {
      await fetch('/api/ai-blueprint/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ responses: nextValues }),
      });
    } catch (err) {
      console.error('Failed to save AI Blueprint responses:', err);
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

  // Build formatted text content
  const buildFormattedContent = useCallback(() => {
    const separator = "=".repeat(60);
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let content = `iPurpose AI Blueprint — ${todayDate}\n`;
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
                const cellKey = `${f.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
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
      }
      content += `${separator}\n\n`;
    });

    return content;
  }, [steps, values, userName]);

  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    const modalEl = document.querySelector('[data-ai-blueprint-summary]');
    if (!modalEl) return;
    const clone = modalEl.cloneNode(true) as HTMLElement;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>iPurpose AI Blueprint</title>
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
          th { background: #f0eeff; font-family: 'Marcellus', serif; }
        </style>
      </head>
      <body>${clone.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let sectionsHtml = '';
    steps.forEach((s) => {
      const fields = (s as any).fields;
      let fieldsHtml = '';

      if (fields) {
        fields.forEach((f: any) => {
          if (f.type === 'grid' && f.rows && f.columns) {
            let tableRows = '';
            f.rows.forEach((row: string) => {
              let cells = '';
              f.columns.forEach((col: string) => {
                const cellKey = `${f.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                cells += `<td style="padding:0.5rem 0.75rem;border:1px solid #e5e1f5;color:#2A2A2A;">${values[cellKey] || '<em style="color:#bbb;">—</em>'}</td>`;
              });
              tableRows += `<tr><td style="padding:0.5rem 0.75rem;border:1px solid #e5e1f5;font-weight:600;color:#6B5B95;font-family:'Marcellus',serif;">${row}</td>${cells}</tr>`;
            });
            let headerCells = '<th style="padding:0.5rem 0.75rem;border:1px solid #e5e1f5;background:#f0eeff;width:140px;"></th>';
            f.columns.forEach((col: string) => {
              headerCells += `<th style="padding:0.5rem 0.75rem;border:1px solid #e5e1f5;background:#f0eeff;font-family:'Marcellus',serif;color:#6B5B95;">${col}</th>`;
            });
            fieldsHtml += `
              <div style="margin-bottom:1rem;">
                <p style="font-weight:600;color:#555;font-size:0.85rem;margin-bottom:0.5rem;">${f.label}</p>
                <table style="border-collapse:collapse;width:100%;"><thead><tr>${headerCells}</tr></thead><tbody>${tableRows}</tbody></table>
              </div>`;
          } else {
            const val = values[f.key];
            // Strip the prompt text from labels that contain embedded prompts
            const cleanLabel = f.label.split('\n')[0];
            fieldsHtml += `
              <div style="margin-bottom:1rem;border-left:4px solid rgba(107,91,149,0.3);padding-left:1rem;">
                <p style="font-weight:600;color:#555;font-size:0.85rem;margin-bottom:0.25rem;">${cleanLabel}${f.required ? ' <span style="color:#E88C7A;">*</span>' : ''}</p>
                <p style="color:#2A2A2A;white-space:pre-line;">${val || '<em style="color:#bbb;">Not yet filled</em>'}</p>
              </div>`;
          }
        });
      }

      sectionsHtml += `
        <div style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e1f5;page-break-inside:avoid;">
          <h2 style="font-size:1.35rem;font-weight:600;color:#6B5B95;margin-bottom:1rem;font-family:'Marcellus',serif;">${s.title}</h2>
          ${fieldsHtml}
        </div>`;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>iPurpose AI Blueprint — ${userName || 'Workbook'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Marcellus&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
          @page { margin: 1.5cm; }
          body { font-family: 'Montserrat', system-ui, sans-serif; line-height: 1.7; color: #2A2A2A; max-width: 800px; margin: 0 auto; padding: 2rem; }
          .header { text-align: center; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 2px solid #6B5B95; }
          .header h1 { font-size: 2.25rem; font-family: 'Marcellus', serif; color: #6B5B95; margin: 0 0 0.25rem 0; }
          .header .tagline { font-family: 'Italiana', serif; font-size: 1.1rem; color: #9C88FF; margin: 0 0 0.75rem 0; }
          .header .meta { font-size: 0.85rem; color: #888; }
          .footer { text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e1f5; font-size: 0.8rem; color: #aaa; font-family: 'Italiana', serif; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 iPurpose AI Blueprint</h1>
          <p class="tagline">Use AI Without Losing Your Voice</p>
          <p class="meta">${userName ? `Prepared for <strong>${userName}</strong> · ` : ''}${todayDate}</p>
        </div>
        ${sectionsHtml}
        <div class="footer">
          © ${new Date().getFullYear()} iPurpose · ipurposesoul.com
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  }, [steps, values, userName]);

  const step = steps[current];

  // Calculate overall completion across all fields
  const overallProgress = useMemo(() => {
    let filled = 0;
    let total = 0;
    steps.forEach((s) => {
      const fields = (s as any).fields;
      if (fields) {
        fields.forEach((f: any) => {
          if (f.type === 'grid' && f.rows && f.columns) {
            f.rows.forEach((row: string) => {
              f.columns.forEach((col: string) => {
                total++;
                const cellKey = `${f.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                if (values[cellKey]?.trim()) filled++;
              });
            });
          } else {
            total++;
            if (values[f.key]?.trim()) filled++;
          }
        });
      }
    });
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [steps, values]);

  const hasFields = !!(step as any).fields?.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">iPurpose AI Blueprint</h2>

      {/* Step Navigation Pills */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => {
            const isActive = i === current;
            const stepFields = (s as any).fields;

            let filledCount = 0;
            let totalCount = 0;
            if (stepFields) {
              stepFields.forEach((f: any) => {
                if (f.type === 'grid' && f.rows && f.columns) {
                  f.rows.forEach((row: string) => {
                    f.columns.forEach((col: string) => {
                      totalCount++;
                      const cellKey = `${f.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                      if (values[cellKey]?.trim()) filledCount++;
                    });
                  });
                } else {
                  totalCount++;
                  if (values[f.key]?.trim()) filledCount++;
                }
              });
            }

            const isComplete = totalCount > 0 && filledCount === totalCount;
            const isInProgress = filledCount > 0 && filledCount < totalCount;

            return (
              <button
                key={s.key}
                onClick={() => setCurrent(i)}
                className={`
                  relative px-3 py-2 rounded-full text-xs sm:text-sm font-marcellus transition-all duration-200 flex items-center gap-1.5
                  ${isActive
                    ? 'text-white shadow-md'
                    : isComplete
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : isInProgress
                        ? 'bg-indigoDeep/10 text-indigoDeep border border-indigoDeep/20 hover:bg-indigoDeep/20'
                        : 'bg-gray-50 text-warmCharcoal/50 border border-gray-100 hover:bg-gray-100'
                  }
                `}
                style={isActive ? { background: 'linear-gradient(135deg, #6B5B95, #9C88FF)' } : undefined}
              >
                {isComplete && !isActive && (
                  <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isInProgress && !isActive && (
                  <span className="inline-block w-2 h-2 rounded-full bg-indigoDeep/60 flex-shrink-0" />
                )}
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
          <span className="font-marcellus">{overallProgress}% complete</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%`, background: overallProgress === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #6B5B95, #9C88FF)' }}
          />
        </div>
      </div>

      {/* Step Card */}
      <div className="ipurpose-glow-container">
        <div className="relative bg-white rounded-2xl shadow-sm border border-indigoDeep/10 p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3">{step.title}</h3>
          <div className="text-sm sm:text-base text-warmCharcoal/70 mb-3 leading-relaxed whitespace-pre-line">{step.prompt}</div>

          {/* Example hint */}
          {step.example && (
            <div className="text-xs text-warmCharcoal/40 italic mb-5 font-marcellus bg-indigoDeep/5 rounded-lg px-4 py-3 border-l-2 border-indigoDeep/20 whitespace-pre-line">
              <span className="font-semibold not-italic text-warmCharcoal/50">Example:</span>{'\n'}{step.example}
            </div>
          )}

          {/* Multi-field rendering */}
          {hasFields && (
            <div className="space-y-5">
              {(step as any).fields.map((field: any) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-warmCharcoal/80 mb-1.5 whitespace-pre-line">
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
                                ? 'bg-indigoDeep/10 text-indigoDeep border-indigoDeep/30'
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
                            <th className="p-2 text-left text-warmCharcoal/60 font-marcellus border-b border-indigoDeep/10 w-36"></th>
                            {field.columns.map((col: string) => (
                              <th key={col} className="p-2 text-center text-warmCharcoal/70 font-marcellus border-b border-indigoDeep/10 font-semibold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {field.rows.map((row: string) => (
                            <tr key={row}>
                              <td className="p-2 font-marcellus text-warmCharcoal/70 font-semibold border-b border-indigoDeep/5">{row}</td>
                              {field.columns.map((col: string) => {
                                const cellKey = `${field.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                                return (
                                  <td key={col} className="p-1.5 border-b border-indigoDeep/5">
                                    <input
                                      type="text"
                                      value={values[cellKey] || ''}
                                      onChange={(e) => onChange(cellKey, e.target.value)}
                                      placeholder={`${col}…`}
                                      className="w-full border border-indigoDeep/10 rounded-lg px-3 py-2 text-warmCharcoal/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigoDeep/30 focus:border-indigoDeep/30 transition-all"
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
                      rows={field.key === 'guardrails_agreement' ? 8 : 3}
                      className="w-full border border-indigoDeep/10 rounded-xl p-4 text-warmCharcoal/80 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigoDeep/30 focus:border-indigoDeep/30 transition-all resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
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
                  style={{ background: 'linear-gradient(135deg, #6B5B95, #9C88FF)' }}
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
                  🤖 Complete &amp; Review
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
            data-ai-blueprint-summary
            style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '56rem', width: '100%', maxHeight: '85vh', overflow: 'auto', margin: '2rem 0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Action bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(42,42,42,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(42,42,42,0.6)', textAlign: 'center', margin: 0 }}>
                💡 <strong>Tip:</strong> Print or download your Blueprint to keep as a reference alongside your AI tools
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
                  ⬇ Download PDF
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  style={{ flex: 1, padding: '0.875rem', backgroundColor: '#6B5B95', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a4d80')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6B5B95')}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Header */}
            <div style={{ borderBottom: '1px solid rgba(42,42,42,0.1)', paddingBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2A2A2A', marginBottom: '0.5rem', fontFamily: 'Marcellus, serif' }}>
                🤖 iPurpose AI Blueprint
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
                                {f.label.split('\n')[0]}
                              </p>
                              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid rgba(107,91,149,0.2)', textAlign: 'left', fontFamily: 'Marcellus, serif', color: 'rgba(42,42,42,0.6)', fontSize: '0.875rem' }}></th>
                                    {f.columns.map((col: string) => (
                                      <th key={col} style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid rgba(107,91,149,0.2)', textAlign: 'left', fontFamily: 'Marcellus, serif', color: 'rgba(42,42,42,0.7)' }}>{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {f.rows.map((row: string) => (
                                    <tr key={row}>
                                      <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(42,42,42,0.05)', fontWeight: '600', color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif' }}>{row}</td>
                                      {f.columns.map((col: string) => {
                                        const cellKey = `${f.key}_${row.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${col.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
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

                        const cleanLabel = f.label.split('\n')[0];
                        return (
                          <div key={f.key} style={{ borderLeft: '4px solid rgba(107,91,149,0.3)', paddingLeft: '1rem' }}>
                            <p style={{ fontWeight: '600', color: 'rgba(42,42,42,0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              {cleanLabel}
                            </p>
                            <p style={{ color: '#2A2A2A', whiteSpace: 'pre-line' }}>
                              {values[f.key] || <span style={{ color: 'rgba(42,42,42,0.3)', fontStyle: 'italic' }}>Not yet filled</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
