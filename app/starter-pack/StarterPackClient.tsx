"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_STEPS = [
  { key: "grounding", title: "Grounding in the Present", prompt: "Describe how you're feeling right now. What three words capture your present state?" },
  { key: "vision", title: "Vision Alignment", prompt: "Imagine the best possible version of your life. What does it look like?" },
  { key: "selfDiscovery", title: "Self-Discovery & Alignment", prompt: "Notice repeating patterns. Which pattern shows up most for you?" },
  { key: "coreValues", title: "Core Values & Passions", prompt: "Which values guide your life? List three." },
  { key: "energyFlow", title: "Energy & Flow", prompt: "How does your energy move through the day? Map morning/afternoon/evening." },
  { key: "purposeAction", title: "Purpose in Action", prompt: "What is your purpose statement? Who do you serve?" },
  { key: "integration", title: "Integration & Commitment", prompt: "Commit to one change you will make this week to live more aligned." },
];

export default function StarterPackClient() {
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) setUid(u.uid);
      else setUid(null);
    });
    return () => unsub();
  }, []);

  const db = useMemo(() => {
    try {
      return getFirebaseFirestore();
    } catch (e) {
      return null;
    }
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
        const mapped = (json.steps || []).map((s: any, i: number) => {
          const exampleText = s.example ? Object.values(s.example).join(' ') : '';
          const prompt = [s.intro || '', exampleText].filter(Boolean).join('\n\n');
          return { key: s.key || `step${i + 1}`, title: s.title || `Step ${i + 1}`, prompt };
        });
        if (mapped.length) setSteps(mapped);
      } catch (err) {
        // keep defaults on failure
        console.error('Failed to load starter pack prompts', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // load existing responses
  useEffect(() => {
    if (!uid || !db) return;
    const docRef = doc(db, 'starterPackResponses', uid);
    getDoc(docRef).then((snap) => {
      if (snap.exists()) setValues(snap.data() as Record<string, string>);
    }).catch((err) => console.error('Failed loading starter pack responses', err));
  }, [uid, db]);

  // simple debounce implementation
  const saveTimer = useRef<number | null>(null);
  async function saveNow(nextValues: Record<string, string>) {
    if (!uid || !db) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'starterPackResponses', uid);
      await setDoc(docRef, { ...nextValues, updatedAt: serverTimestamp() }, { merge: true } as any);
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

  const step = steps[current];

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">iPurpose Starter Pack</h1>

      <div className="mb-6">
        <div className="flex items-center gap-3 overflow-auto">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setCurrent(i)}
              className={`px-3 py-2 rounded ${i === current ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
        <p className="text-sm text-gray-600 mb-4">{step.prompt}</p>

        <textarea
          value={values[step.key] || ''}
          onChange={(e) => onChange(step.key, e.target.value)}
          rows={10}
          className="w-full border rounded p-3"
        />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              className="px-4 py-2 bg-gray-100 rounded mr-3"
            >
              Back
            </button>
            <button
              onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          </div>

          <div className="text-sm text-gray-500">{saving ? 'Saving…' : 'All changes saved'}</div>
        </div>
      </div>
    </div>
  );
}
