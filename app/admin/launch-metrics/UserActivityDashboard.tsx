'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import type {
  CompassConversationResponse,
  JourneyStepActivity,
  UserActivityDetailResponse,
  UserActivityListResponse,
  UserActivityRow,
} from '@/lib/admin-activity/userActivityTypes';

const button = 'rounded border px-3 py-2 disabled:opacity-50';
type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'allowed';

function when(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : value;
}

function duration(ms: number) {
  if (!ms) return 'Not tracked';
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', `${seconds}s`].filter(Boolean).join(' ');
}

function latestCompass(row: UserActivityRow) {
  return row.compass.lastExitAt || row.compass.lastEnterAt || row.compass.lastConversationAt;
}

function started(step: JourneyStepActivity) {
  if (step.startedAt) return when(step.startedAt);
  return step.completedAt ? 'Start not tracked in that app version' : 'Not tracked in that app version';
}

function completed(step: JourneyStepActivity) {
  return step.completedAt ? when(step.completedAt) : 'No saved completion found';
}

export default function UserActivityDashboard() {
  const [access, setAccess] = useState<AccessState>('checking');
  const [rows, setRows] = useState<UserActivityRow[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState<UserActivityDetailResponse | null>(null);
  const [conversation, setConversation] = useState<CompassConversationResponse | null>(null);
  const [conversationBusyId, setConversationBusyId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const generation = useRef(0);

  async function request<T>(signedIn: User, suffix = ''): Promise<T> {
    const token = await signedIn.getIdToken();
    const response = await fetch(`/api/admin/user-activity${suffix}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) throw new Error(body?.error || 'Unable to load user activity.');
    return body as T;
  }

  async function loadList(signedIn: User, version: number) {
    setBusy(true);
    setMessage('');
    try {
      const result = await request<UserActivityListResponse>(signedIn);
      if (generation.current !== version) return;
      setRows(result.users);
      setGeneratedAt(result.generatedAt);
      if (result.truncated) setMessage('Showing the first 1,000 Firebase accounts.');
    } catch (error) {
      if (generation.current === version) setMessage(error instanceof Error ? error.message : 'Unable to load user activity.');
    } finally {
      if (generation.current === version) setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async signedIn => {
      const version = ++generation.current;
      userRef.current = signedIn;
      setRows([]);
      setDetail(null);
      setConversation(null);
      setMessage('');
      if (!signedIn) {
        setAccess('signed_out');
        return;
      }
      setAccess('checking');
      try {
        const token = await signedIn.getIdTokenResult(true);
        if (!active || generation.current !== version) return;
        if (token.claims.admin !== true) {
          setAccess('forbidden');
          return;
        }
        setAccess('allowed');
        await loadList(signedIn, version);
      } catch {
        if (active && generation.current === version) {
          setAccess('signed_out');
          setMessage('Sign in with an administrator account and retry.');
        }
      }
    });
    return () => { active = false; generation.current += 1; unsubscribe(); };
  }, []);

  async function refresh() {
    if (!userRef.current || busy) return;
    setDetail(null);
    setConversation(null);
    await loadList(userRef.current, generation.current);
  }

  async function inspect(uid: string) {
    if (!userRef.current || busy) return;
    const version = generation.current;
    setBusy(true);
    setMessage('');
    setConversation(null);
    try {
      const result = await request<UserActivityDetailResponse>(userRef.current, `?uid=${encodeURIComponent(uid)}`);
      if (generation.current === version) setDetail(result);
    } catch (error) {
      if (generation.current === version) setMessage(error instanceof Error ? error.message : 'Unable to inspect this user.');
    } finally {
      if (generation.current === version) setBusy(false);
    }
  }

  async function viewConversation(conversationId: string) {
    if (!userRef.current || !detail || conversationBusyId) return;
    setConversationBusyId(conversationId);
    setMessage('');
    try {
      const result = await request<CompassConversationResponse>(
        userRef.current,
        `?uid=${encodeURIComponent(detail.user.uid)}&conversationId=${encodeURIComponent(conversationId)}`,
      );
      setConversation(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load this conversation.');
    } finally {
      setConversationBusyId(null);
    }
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(row => !needle || [row.email, row.name, row.uid, row.platform]
      .some(value => value?.toLowerCase().includes(needle)));
  }, [rows, query]);

  if (access === 'checking') {
    return <section className="rounded-xl border bg-white p-5"><p>Checking administrator access…</p></section>;
  }
  if (access === 'signed_out') {
    return <section className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="text-2xl">Administrator sign-in required</h2>
      <p className="text-sm">Sign in with the iPurpose owner or administrator account to view user support activity.</p>
      <a className="underline" href="/login?next=/admin/user-activity">Sign in and return to User Activity →</a>
      {message ? <p role="status">{message}</p> : null}
    </section>;
  }
  if (access === 'forbidden') {
    return <section className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="text-2xl">Administrator access required</h2>
      <p className="text-sm">This signed-in account does not currently have the Firebase administrator claim required for this support dashboard.</p>
    </section>;
  }

  const compassUsers = rows.filter(row => row.compass.storedMessageCount > 0).length;
  return <section className="space-y-5 rounded-xl border bg-white p-5" aria-labelledby="user-activity-heading">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-widest text-gray-600">Support &amp; troubleshooting</p>
        <h2 id="user-activity-heading" className="text-2xl">User Activity</h2>
        <p className="mt-2 max-w-4xl text-sm">Account, journey and Compass activity correlated by Firebase UID. Private Compass text is loaded only when an administrator explicitly opens a conversation. Times use your browser&apos;s local timezone.</p>
      </div>
      <button className={button} disabled={busy} onClick={() => void refresh()}>{busy ? 'Working…' : 'Refresh activity'}</button>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-lg border p-4"><p className="text-sm text-gray-600">Firebase accounts</p><p className="text-2xl font-semibold">{rows.length}</p></article>
      <article className="rounded-lg border p-4"><p className="text-sm text-gray-600">Users with saved Compass messages</p><p className="text-2xl font-semibold">{compassUsers}</p></article>
      <article className="rounded-lg border p-4"><p className="text-sm text-gray-600">Dashboard refreshed</p><p className="text-sm font-semibold">{when(generatedAt)}</p></article>
    </div>

    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">Find a user
        <input className="mt-1 block min-w-72 rounded border p-2" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, email, Firebase UID, platform" />
      </label>
      <p className="text-sm text-gray-600">{visible.length} matching user{visible.length === 1 ? '' : 's'}</p>
    </div>

    {message ? <p role="status" className="rounded border p-3">{message}</p> : null}

    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">iPurpose users and recent product activity</caption>
        <thead className="bg-gray-50"><tr>
          {['User', 'Registered', 'Last sign-in', 'Platform', 'Compass activity', 'Last Compass activity', 'Troubleshoot'].map(label => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}
        </tr></thead>
        <tbody>{visible.map(row => <tr key={row.uid} className="border-t align-top">
          <td className="p-3"><strong>{row.name || 'Name not recorded'}</strong><span className="block">{row.email || 'Email not recorded'}</span><small className="block max-w-64 break-all text-gray-600">{row.uid}</small></td>
          <td className="whitespace-nowrap p-3">{when(row.registeredAt)}</td>
          <td className="whitespace-nowrap p-3">{when(row.lastSignInAt)}</td>
          <td className="p-3 capitalize">{row.platform}</td>
          <td className="p-3"><strong>{row.compass.storedMessageCount}</strong> saved messages<br/><span className="text-gray-600">{row.compass.conversationCount} conversation{row.compass.conversationCount === 1 ? '' : 's'} · {row.compass.trackedSessionCount} tracked session{row.compass.trackedSessionCount === 1 ? '' : 's'}</span></td>
          <td className="whitespace-nowrap p-3">{when(latestCompass(row))}</td>
          <td className="p-3"><button className={button} disabled={busy} onClick={() => void inspect(row.uid)}>Inspect</button></td>
        </tr>)}</tbody>
      </table>
    </div>

    {!visible.length ? <p>No users match this search.</p> : null}

    {detail ? <section className="space-y-5 rounded-xl border-2 border-[#4B4E6D] p-5" aria-labelledby="user-detail-heading">
      <div className="flex flex-wrap justify-between gap-3">
        <div><h3 id="user-detail-heading" className="text-xl font-semibold">{detail.user.name || detail.user.email || detail.user.uid}</h3><p className="text-sm text-gray-600">{detail.user.email || 'No email'} · {detail.user.uid}</p></div>
        <button className={button} onClick={() => { setDetail(null); setConversation(null); }}>Close</button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border p-3"><p className="text-xs uppercase text-gray-600">Account created</p><p className="font-semibold">{when(detail.user.registeredAt)}</p></article>
        <article className="rounded-lg border p-3"><p className="text-xs uppercase text-gray-600">Last sign-in</p><p className="font-semibold">{when(detail.user.lastSignInAt)}</p></article>
        <article className="rounded-lg border p-3"><p className="text-xs uppercase text-gray-600">Route before Compass</p><p className="font-semibold">{detail.journey.routeBeforeCompass || 'Not tracked in that app version'}</p></article>
        <article className="rounded-lg border p-3"><p className="text-xs uppercase text-gray-600">Route after Compass</p><p className="font-semibold">{detail.journey.routeAfterCompass || 'Not tracked in that app version'}</p></article>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border p-4">
          <h4 className="font-semibold">Clarity Check</h4>
          <p className="mt-2 text-sm"><strong>Started:</strong> {started(detail.journey.clarity)}</p>
          <p className="text-sm"><strong>Completed:</strong> {completed(detail.journey.clarity)}</p>
          <p className="mt-2 text-xs text-gray-600">A saved Clarity submission is treated as completion evidence. Older app versions may not have recorded an opening/start event.</p>
        </article>
        <article className="rounded-lg border p-4">
          <h4 className="font-semibold">Purpose Check</h4>
          <p className="mt-2 text-sm"><strong>Started:</strong> {started(detail.journey.purpose)}</p>
          <p className="text-sm"><strong>Completed:</strong> {completed(detail.journey.purpose)}</p>
          <p className="mt-2 text-xs text-gray-600">A saved Firebase purposeProfile is treated as completion evidence. Older app versions may not have recorded an opening/start event.</p>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <article className="rounded-lg border p-3"><p className="text-sm text-gray-600">Saved Compass messages</p><p className="text-xl font-semibold">{detail.user.compass.storedMessageCount}</p></article>
        <article className="rounded-lg border p-3"><p className="text-sm text-gray-600">Conversations</p><p className="text-xl font-semibold">{detail.user.compass.conversationCount}</p></article>
        <article className="rounded-lg border p-3"><p className="text-sm text-gray-600">Tracked Compass sessions</p><p className="text-xl font-semibold">{detail.user.compass.trackedSessionCount}</p></article>
        <article className="rounded-lg border p-3"><p className="text-sm text-gray-600">Tracked Compass time</p><p className="text-xl font-semibold">{duration(detail.user.compass.totalTrackedDurationMs)}</p></article>
      </div>

      {detail.user.compass.storedMessageCount > 0 && detail.user.compass.trackedSessionCount === 0 ? <p className="rounded border bg-amber-50 p-3 text-sm">Historical Compass conversations exist for this user, but precise enter/exit/session duration and route history were not tracked by the app version they used. Conversation timestamps and saved messages remain available.</p> : null}

      <div className="overflow-x-auto">
        <h4 className="mb-2 font-semibold">Recent Compass conversations</h4>
        <p className="mb-3 text-xs text-gray-600">Conversation text is private user content. Open it only when needed for support, troubleshooting, safety, or an authorized product investigation.</p>
        <table className="w-full text-left text-sm"><thead><tr>{['Conversation ID', 'Messages', 'Started', 'Last message', 'Private content'].map(label => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>{detail.recentConversations.map(item => <tr key={item.id} className="border-t"><td className="max-w-64 break-all p-2">{item.id}</td><td className="p-2">{item.messageCount}</td><td className="whitespace-nowrap p-2">{when(item.createdAt)}</td><td className="whitespace-nowrap p-2">{when(item.updatedAt)}</td><td className="p-2"><button className={button} disabled={conversationBusyId !== null} onClick={() => void viewConversation(item.id)}>{conversationBusyId === item.id ? 'Loading…' : 'View conversation'}</button></td></tr>)}</tbody></table>{!detail.recentConversations.length ? <p className="text-sm">No saved Compass conversations.</p> : null}
      </div>

      {conversation ? <section className="space-y-3 rounded-xl border bg-gray-50 p-4" aria-label="Private Compass conversation">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold">Private Compass conversation</h4><p className="text-xs text-gray-600">{conversation.conversationId} · {conversation.messages.length} saved messages</p></div><button className={button} onClick={() => setConversation(null)}>Hide conversation</button></div>
        {conversation.messages.map(item => <article key={item.id} className="rounded-lg border bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{item.role === 'user' ? 'User' : 'Compass'} · {when(item.createdAt)}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.content || '[Empty message]'}</p></article>)}
        {!conversation.messages.length ? <p>No saved messages were found in this conversation.</p> : null}
      </section> : null}

      <div className="overflow-x-auto"><h4 className="mb-2 font-semibold">Tracked activity timeline</h4><table className="w-full text-left text-sm"><thead><tr>{['Time', 'Event', 'Platform', 'Route', 'Previous route', 'Session', 'Duration / exit reason'].map(label => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>{detail.recentEvents.map(item => <tr key={item.id} className="border-t"><td className="whitespace-nowrap p-2">{when(item.at)}</td><td className="p-2">{item.type.replaceAll('_', ' ')}</td><td className="p-2 capitalize">{item.platform}</td><td className="p-2">{item.route || '—'}</td><td className="p-2">{item.previousRoute || '—'}</td><td className="max-w-56 break-all p-2">{item.sessionId || '—'}</td><td className="p-2">{item.durationMs !== null ? duration(item.durationMs) : item.reason || '—'}</td></tr>)}</tbody></table>{!detail.recentEvents.length ? <p className="text-sm">No detailed activity events were recorded by this user&apos;s app version.</p> : null}</div>
    </section> : null}
  </section>;
}
