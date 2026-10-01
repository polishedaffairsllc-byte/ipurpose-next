'use client';

import { useEffect, useRef, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { ACTIVITY_KINDS, type ActivityKind, type ActivityPage, type ActivityRow, type PurgePreview } from '@/lib/admin-activity/types';
import styles from './metrics.module.css';

const labels: Record<ActivityKind, string> = {
  accounts: 'Login accounts', profiles: 'Saved profiles', leads: 'Captured emails', clarity: 'Clarity Checks',
  registrations: 'Info-session signups', cohorts: 'Cohort signups', emails: 'Email queue / history',
};
const button = 'rounded border px-3 py-2 disabled:opacity-50';

export default function LaunchActivity() {
  const [allowed, setAllowed] = useState(false);
  const [kind, setKind] = useState<ActivityKind>('accounts');
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<PurgePreview | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const generation = useRef(0);
  const user = useRef<User | null>(null);
  const lock = useRef(false);

  async function request<T>(signedIn: User, suffix = '', body?: unknown): Promise<T> {
    const token = await signedIn.getIdToken();
    const response = await fetch(`/api/admin/launch-activity${suffix}`, {
      method: body ? 'POST' : 'GET', cache: 'no-store', credentials: 'omit',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error || 'Activity operation failed.');
    return value as T;
  }

  useEffect(() => {
    let active = true;
    // Invalidate outstanding HTTP responses on unmount; this is a request epoch, not a DOM ref.
    const invalidateRequests = () => { generation.current += 1; };
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async signedIn => {
      const version = ++generation.current;
      user.current = signedIn;
      setAllowed(false); setRows([]); setCursor(null); setPreview(null); setConfirmation(''); setAcknowledged(false); setMessage('');
      if (!signedIn) return;
      try {
        const token = await signedIn.getIdTokenResult();
        if (!active || generation.current !== version || token.claims.admin !== true) return;
        setAllowed(true); setBusy(true); setKind('accounts');
        const result = await request<ActivityPage>(signedIn, '?kind=accounts');
        if (active && generation.current === version) { setRows(result.rows); setCursor(result.cursor); }
      } catch {
        if (active && generation.current === version) setMessage('Unable to load activity. Sign in with an administrator account and retry.');
      } finally { if (active && generation.current === version) setBusy(false); }
    });
    return () => { active = false; invalidateRequests(); unsubscribe(); };
  }, []);

  async function action(work: (signedIn: User, version: number) => Promise<void>) {
    if (!user.current || busy || lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    const version = generation.current;
    try { await work(user.current, version); }
    catch (error) { if (version === generation.current) setMessage(error instanceof Error ? error.message : 'Operation failed.'); }
    finally { lock.current = false; if (version === generation.current) setBusy(false); }
  }

  function load(nextKind: ActivityKind, more = false) {
    void action(async (signedIn, version) => {
      const params = new URLSearchParams({ kind: nextKind });
      if (more && cursor) params.set('cursor', cursor);
      const result = await request<ActivityPage>(signedIn, `?${params}`);
      if (version !== generation.current) return;
      setKind(nextKind); setPreview(null); setConfirmation(''); setAcknowledged(false);
      setRows(previous => more ? [...new Map([...previous, ...result.rows].map(row => [row.id, row])).values()] : result.rows);
      setCursor(result.cursor);
    });
  }
  function inspect(row: ActivityRow) {
    void action(async (signedIn, version) => {
      setPreview(null); setConfirmation(''); setAcknowledged(false);
      const result = await request<PurgePreview>(signedIn, '', { action: 'preview', target: { kind: row.kind, id: row.id } });
      if (version === generation.current) setPreview(result);
    });
  }
  function purge() {
    if (!preview || !acknowledged || confirmation !== preview.confirmation) return;
    void action(async (signedIn, version) => {
      await request(signedIn, '', { action: 'purge', target: preview.target, fingerprint: preview.fingerprint, confirmation });
      if (version !== generation.current) return;
      setPreview(null); setConfirmation(''); setAcknowledged(false); setRows([]); setCursor(null);
      setMessage('Purge completed. Selected linked records and login were removed where present. Historical GA4/weekly totals are unchanged.');
      const page = await request<ActivityPage>(signedIn, `?kind=${kind}`);
      if (version === generation.current) { setRows(page.rows); setCursor(page.cursor); }
    });
  }

  if (!allowed) return null;
  const needle = query.trim().toLowerCase();
  const visible = rows.filter(row => [row.email, row.name, row.id, row.source, row.status].some(value => value?.toLowerCase().includes(needle)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return <section aria-labelledby="activity-heading" className={`${styles.activity} space-y-4 rounded-xl border bg-white p-5`}>
    <h2 id="activity-heading" className="text-2xl">People &amp; activity</h2>
    <p className="text-sm">Actual saved records, separate from GA4 event totals. Browse every retained page; repeated lead submissions may have been merged. An email queue row is a message, not another signup. Platform is not inferred when it was not recorded.</p>
    <div className="flex flex-wrap gap-2" aria-label="Activity categories">{ACTIVITY_KINDS.map(value =>
      <button key={value} className={`${button} ${kind === value ? 'bg-[#4B4E6D] text-white' : ''}`} aria-pressed={kind === value} disabled={busy} onClick={() => load(value)}>{labels[value]}</button>)}</div>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">Search loaded records<input className="mt-1 block rounded border p-2" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Email, name, ID, source" /></label>
      <button className={button} disabled={busy} onClick={() => load(kind)}>Refresh this list</button>
      <p className="text-sm">{rows.length} loaded · {visible.length} matches{cursor ? ' · More records available' : ' · End of list'}</p>
    </div>
    {busy ? <p role="status">Working…</p> : null}
    {message ? <p role="status" className="rounded border p-3">{message}</p> : null}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <caption className="sr-only">{labels[kind]} — loaded records, newest first</caption>
      <thead><tr>{['Email / record', 'Name', 'Date (UTC)', 'Source / status', 'Clarity result', 'Cleanup'].map(label => <th key={label} className="p-2">{label}</th>)}</tr></thead>
      <tbody>{visible.map(row => <tr key={row.id} className="border-t">
        <td className="p-2"><span>{row.email || 'No email recorded'}</span><small className="block break-all text-gray-600">{row.id}</small></td>
        <td className="p-2">{row.name || '—'}</td><td className="whitespace-nowrap p-2">{row.date ? row.date.replace('T', ' ').replace('.000Z', ' UTC') : 'Not recorded'}</td>
        <td className="p-2">{[row.source, row.status].filter(Boolean).join(' · ') || 'Not recorded'}</td>
        <td className="p-2">{row.score !== null ? `Score ${row.score}` : '—'}{row.identity ? ` · ${row.identity}` : ''}</td>
        <td className="p-2"><button className={button} disabled={busy} onClick={() => inspect(row)} aria-label={`Preview purge for ${row.email || row.id}`}>Preview purge</button></td>
      </tr>)}</tbody>
    </table></div>
    {!busy && !visible.length ? <p>No matching records in the loaded pages.</p> : null}
    {cursor ? <button className={button} disabled={busy} onClick={() => load(kind, true)}>Load next 100 records</button> : null}
    {preview ? <section aria-labelledby="purge-heading" className="space-y-3 rounded border-2 border-red-700 p-4">
      <h3 id="purge-heading" className="text-xl font-semibold">Review permanent purge: {preview.email || preview.uid || preview.target.id}</h3>
      <p>This removes the linked person’s records across categories, not just the selected row. Login to delete: {preview.loginExists ? preview.uid : 'none found'}. Pending emails: {preview.pendingEmails}.</p>
      <ul className="list-disc pl-5">{Object.entries(preview.counts).map(([name, count]) => <li key={name}>{name}: {count}</li>)}</ul>
      <details><summary className="cursor-pointer">Exact records and actions ({preview.records.length})</summary><ul className="max-h-60 overflow-auto break-all text-sm">{preview.records.map(record => <li key={record.path}>{record.action}: {record.path}</li>)}</ul></details>
      <p className="text-sm">This cannot be undone here. Purchase records are retained and de-linked; community posts become tombstones so other people’s replies remain. A minimal email suppression entry remains to prevent re-enrollment. Emails already in delivery cannot be recalled. GA4 events and weekly totals are not erased.</p>
      <p className="text-sm">Permanent deletion requires a sign-in within the last five minutes. If prompted, sign out and back in before retrying.</p>
      <label className="flex gap-2"><input type="checkbox" checked={acknowledged} disabled={busy} onChange={event => setAcknowledged(event.target.checked)} />I verified these are test/dummy records and want to permanently remove this person’s login and related records.</label>
      <label className="block">Type <strong>{preview.confirmation}</strong><input className="mt-1 block w-full rounded border p-2" autoComplete="off" value={confirmation} disabled={busy} onChange={event => setConfirmation(event.target.value)} /></label>
      <div className="flex gap-3"><button className={`${button} ${styles.purgeButton}`} disabled={busy || !acknowledged || confirmation !== preview.confirmation} onClick={purge}>Permanently purge</button><button className={button} disabled={busy} onClick={() => setPreview(null)}>Cancel</button></div>
    </section> : null}
  </section>;
}
