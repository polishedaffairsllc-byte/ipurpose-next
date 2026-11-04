"use client";
import { useEffect, useState, type ReactNode } from 'react';
interface Consent { granted: boolean; version: string; notice: string; provider: string }
function valid(data: Consent): boolean { return typeof data.granted === 'boolean' && typeof data.version === 'string' && Boolean(data.version) && typeof data.notice === 'string' && Boolean(data.notice) && data.provider === 'OpenAI'; }
export function AiPermissionGate({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load(signal?: AbortSignal) {
    setBusy(true); setError(null); setConsent(null);
    try {
      const response = await fetch('/api/ai/consent', { cache: 'no-store', signal });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!valid(data)) throw new Error();
      if (!signal?.aborted) setConsent(data);
    } catch { if (!signal?.aborted) setError('Unable to check AI permission. Please retry.'); }
    finally { if (!signal?.aborted) setBusy(false); }
  }
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, []);
  async function choose(granted: boolean) {
    if (!consent || busy) return;
    const version = consent.version;
    setBusy(true); setError(null);
    if (!granted) setConsent({ ...consent, granted: false });
    try {
      const response = await fetch('/api/ai/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ granted, version }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!valid(data)) throw new Error();
      if (data.granted !== granted || data.version !== version) throw new Error();
      setConsent(data);
    } catch { setConsent(null); setError('Your permission change could not be saved. Please retry before using Compass.'); }
    finally { setBusy(false); }
  }
  return <>
    <section className="rounded-2xl bg-white p-6 space-y-3" aria-label="OpenAI data sharing">
      <h2>Compass and your information</h2>
      {busy ? <p role="status">Checking permission…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {consent ? <><p>{consent.notice}</p><button type="button" disabled={busy} onClick={() => void choose(!consent.granted)} className="rounded-lg border px-4 py-3">{consent.granted ? 'Withdraw OpenAI permission' : 'Allow sharing with OpenAI'}</button></> : !busy ? <button type="button" onClick={() => void load()}>Retry permission check</button> : null}
      <p><a href="/privacy">Privacy Policy</a> · <a href="/dashboard">Use other features</a></p>
    </section>
    {consent?.granted && !busy ? children : null}
  </>;
}
