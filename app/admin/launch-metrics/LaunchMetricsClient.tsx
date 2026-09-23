'use client';

import { useEffect, useRef, useState } from 'react';
import { getApp } from 'firebase/app';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { addCounts, emptyCounts, EVENTS, type Counts, type WeeklyMetrics } from '@/functions/src/model';
import { downloadWeeklyMetrics } from '@/lib/launch-metrics/exportCsv';
import { LaunchMetricsChart, labels } from './LaunchMetricsChart';
import styles from './metrics.module.css';

type State = { status: 'checking' | 'denied' | 'loading' | 'ready' | 'error'; rows: WeeklyMetrics[]; message?: string };
const messageOf = (error: unknown) => error instanceof Error ? error.message : 'Unable to load Launch Metrics.';

export default function LaunchMetricsClient() {
  const [state, setState] = useState<State>({ status: 'checking', rows: [] });
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const [ending, setEnding] = useState('');
  const generation = useRef(0);
  const currentUser = useRef<User | null>(null);
  const requestId = useRef(0);
  const alive = useRef(false);

  useEffect(() => {
    let active = true;
    alive.current = true;
    let unsubscribe = () => {};
    try {
      unsubscribe = onIdTokenChanged(getFirebaseAuth(), async user => {
        const version = ++generation.current;
        currentUser.current = user;
        setNotice('');
        setState({ status: user ? 'checking' : 'denied', rows: [] });
        if (!user) return;
        try {
          const token = await user.getIdTokenResult();
          if (!active || version !== generation.current) return;
          if (token.claims.admin !== true) { setState({ status: 'denied', rows: [] }); return; }
          setState({ status: 'loading', rows: [] });
          const result = await httpsCallable<undefined, WeeklyMetrics[]>(getFunctions(getApp()), 'getLaunchMetrics')();
          if (active && version === generation.current) setState({ status: 'ready', rows: result.data });
        } catch (error) {
          if (active && version === generation.current) setState({ status: 'error', rows: [], message: messageOf(error) });
        }
      });
    } catch (error) {
      queueMicrotask(() => { if (active) setState({ status: 'error', rows: [], message: messageOf(error) }); });
    }
    return () => { active = false; alive.current = false; unsubscribe(); };
  }, []);

  async function refresh(run = false) {
    if (running || !currentUser.current || state.status !== 'ready') return;
    const version = generation.current;
    const id = ++requestId.current;
    setRunning(true); setNotice('');
    try {
      if (run) {
        const result = await httpsCallable<{ weekEnding?: string }, { skipped: boolean; weekEnding: string }>(getFunctions(getApp()), 'runLaunchMetricsNow')(ending ? { weekEnding: ending } : {});
        if (!alive.current || version !== generation.current) return;
        setNotice(result.data.skipped ? `Week ending ${result.data.weekEnding} already exists; snapshot preserved.` : `Saved week ending ${result.data.weekEnding}.`);
      }
      const result = await httpsCallable<undefined, WeeklyMetrics[]>(getFunctions(getApp()), 'getLaunchMetrics')();
      if (alive.current && version === generation.current) setState({ status: 'ready', rows: result.data });
    } catch (error) {
      if (alive.current && version === generation.current) setState({ status: 'error', rows: [], message: messageOf(error) });
    } finally { if (alive.current && id === requestId.current) setRunning(false); }
  }

  const rows = state.rows;
  const cumulative = rows.reduce((sum, row) => addCounts(sum, row.counts), emptyCounts());
  return <main className={styles.dashboard}>
    <a href="/">← iPurpose home</a>
    <header><p className="text-sm uppercase tracking-widest">iPurpose · Administration</p><h1 className="mt-2 text-4xl font-italiana">Launch Metrics</h1></header>
    {['checking', 'loading'].includes(state.status) && <p role="status">{state.status === 'checking' ? 'Checking administrator access…' : 'Loading weekly snapshots…'}</p>}
    {state.status === 'denied' && <p>Administrator access is required. <a className="underline" href="/login?next=/admin/launch-metrics">Sign in</a> with an administrator account.</p>}
    {state.status === 'error' && <div role="alert"><p>{state.message}</p><button className="mt-3 rounded border bg-white px-4 py-2" onClick={() => window.location.reload()}>Try again</button></div>}
    {state.status === 'ready' && <>
      <p className="text-sm">Completed Monday–Sunday weeks in America/New_York. Snapshots run Mondays at 8pm; recent GA4 data can still arrive later.</p>
      <div className={styles.controls}>
        <label className="text-sm">Week ending Sunday (optional)<input type="date" value={ending} onChange={event => setEnding(event.target.value)} className="mt-1 block rounded border p-2" /></label>
        <button disabled={running} onClick={() => void refresh(true)} className="rounded bg-[#4B4E6D] px-4 py-2 text-white disabled:opacity-50">{running ? 'Working…' : 'Compute week'}</button>
        <button disabled={running} onClick={() => void refresh()} className="rounded border px-4 py-2 disabled:opacity-50">Refresh</button>
        <button disabled={!rows.length} onClick={() => downloadWeeklyMetrics(rows)} className="rounded border px-4 py-2 disabled:opacity-50">Export CSV</button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {!rows.length && <p className="rounded-xl border bg-white p-6">No weekly snapshots yet. Compute the most recently completed week or choose a historical Sunday.</p>}
      <section aria-label="Summary" className="grid gap-4 md:grid-cols-3">
        <Card title="Latest recorded week" counts={rows[0]?.counts} date={rows[0]?.weekEnding} />
        <Card title="Previous recorded week" counts={rows[1]?.counts} date={rows[1]?.weekEnding} />
        <Card title={`Total across ${rows.length} displayed weeks`} counts={cumulative} />
      </section>
      <section className="rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl">Weekly trend</h2><LaunchMetricsChart rows={rows} /></section>
      {rows[0] && <section className="rounded-xl border bg-white p-5"><h2 className="text-xl">Native app ratios · {rows[0].weekEnding}</h2><p className="my-2 text-sm">Android and iOS only. Ratios compare event totals within the week, not a matched user cohort; repeats and returning users can make them exceed 100%.</p><dl className="grid gap-3 sm:grid-cols-2">{Object.entries(rows[0].rates).map(([key, value], i) => <div key={key}><dt>{['First open → Registration', 'Registration → Clarity start', 'Clarity start → Completion', 'First open → Completion'][i]}</dt><dd className="font-semibold">{value === null ? '—' : `${value}%`}</dd></div>)}</dl></section>}
      <section className="overflow-x-auto rounded-xl border bg-white p-5"><h2 className="mb-3 text-xl">Weekly records</h2><p className="mb-3 text-sm">Up to 52 snapshots. First opens mean initial app launches after installation, not all opens. Nurture enrollments are confirmed additions to the web email queue.</p><table className="w-full text-left text-sm"><caption className="sr-only">Exact weekly event counts</caption><thead><tr><th className="p-2">Week ending</th>{labels.map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.weekEnding} className="border-t"><th scope="row" className="p-2">{row.weekEnding}</th>{EVENTS.map(event => <td className="p-2" key={event}>{row.counts[event]}</td>)}</tr>)}</tbody></table></section>
    </>}
  </main>;
}

function Card({ title, counts, date }: { title: string; counts?: Counts; date?: string }) {
  return <article className="rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">{title}</h2>{date && <p className="mb-3 text-sm">Ending {date}</p>}{!counts ? <p>No data yet</p> : <dl className="mt-3 space-y-2 text-sm">{EVENTS.map((event, i) => <div key={event} className="flex justify-between gap-3"><dt>{labels[i]}</dt><dd className="font-semibold">{counts[event]}</dd></div>)}</dl>}</article>;
}
