'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ProposalOutreach.module.css';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { eventLabel, OUTREACH_TIMEZONE, type OutreachFilters } from '@/lib/outreach/model';
import { PROPOSALS } from '@/lib/outreach/registry';
import type { OutreachReport } from '@/lib/outreach/service';
import type { HistoryReport } from '@/lib/outreach/history';
export type OutreachPanelData = OutreachReport & { historical: HistoryReport };
const button = 'rounded border px-3 py-2 disabled:opacity-50';
const formatTime = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { timeZone: OUTREACH_TIMEZONE, dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '—';

export function ProposalOutreachPanel({ data, filters, onFilters, refresh, busy, error }: {
  data: OutreachPanelData | null; filters: OutreachFilters; onFilters: (value: OutreachFilters) => void;
  refresh: () => void; busy: boolean; error: string;
}) {
  const history = data?.historical;
  const historicalRows = history?.available ? history.rows.filter(row =>
    (!filters.proposalId || row.proposal_id === filters.proposalId) && (filters.includeInternal || row.traffic_type === 'external')) : [];
  return <section className={styles.panel} aria-labelledby="proposal-outreach-title">
    <header><h2 id="proposal-outreach-title" className="text-2xl font-semibold">Proposal &amp; Partnership Outreach</h2>
      <p className="mt-2 text-sm">Page opened means the proposal page loaded. It does not mean an email was opened. Visits are anonymous; route activity does not identify a person.</p>
      <p className="mt-1 text-sm">America/New_York · timestamps include seconds · selected period only · {data?.environment || 'current environment'}</p></header>
    <div className={styles.controls}>
      <label>Period<select className="mt-1 block rounded border p-2" value={filters.window} onChange={event => onFilters({ ...filters, window: event.target.value as OutreachFilters['window'] })}><option value="today">Today</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option></select></label>
      <label>Proposal / recipient<select className="mt-1 block max-w-full rounded border p-2" value={filters.proposalId || ''} onChange={event => onFilters({ ...filters, proposalId: event.target.value || undefined })}><option value="">All proposals</option>{PROPOSALS.map(proposal => <option key={proposal.id} value={proposal.id}>{proposal.label} — {proposal.recipientId}</option>)}</select></label>
      <label className={styles.check}><input type="checkbox" checked={filters.includeInternal} onChange={event => onFilters({ ...filters, includeInternal: event.target.checked })}/>Include internal / QA activity</label>
      <button className={button} disabled={busy} onClick={refresh}>{busy ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    <p className="text-sm font-semibold">{filters.includeInternal ? 'External and internal / QA activity' : 'External activity only'}</p>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p role="status">Loading proposal activity…</p>}
    {data && <>
      <p className="text-sm">Updated {formatTime(data.generatedAt)} ET. Refreshes about every 30 seconds while this panel is visible.</p>
      {data.truncated && <p role="alert">The safety limit was reached. Counts and timelines are partial; choose a shorter period.</p>}
      <div className={styles.cards}>{data.proposals.map(proposal => <article className="min-w-0 rounded-lg border p-4" key={proposal.proposal_id}>
        <h3 className="text-lg font-semibold">{proposal.label} — {proposal.recipient_id}</h3><p className="text-sm">{proposal.organization}</p><p className="my-2 font-semibold">{proposal.status}</p>
        <dl className="space-y-2 text-sm">{[
          ['First visit', formatTime(proposal.firstVisit)], ['Most recent activity', formatTime(proposal.mostRecentActivity)],
          [filters.includeInternal ? 'Visits' : 'External visits', proposal.visits], ['Highest slide reached', proposal.highestSlide || '—'],
          ['Deck completed', proposal.completed ? 'Yes' : 'No'], ['PDF downloaded', proposal.pdfDownloaded ? 'Yes' : 'No'],
          ['Visit iPurpose clicked', proposal.visitIpurposeClicked ? 'Yes' : 'No'], ['Contact clicked', proposal.contactClicked ? 'Yes' : 'No'],
        ].map(([label, value]) => <div className="flex flex-wrap justify-between gap-x-3" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </article>)}</div>
      <div><h3 className="text-lg font-semibold">Activity timeline</h3><p className="text-sm">Server receipt time, oldest first; event sequence preserves order within a visit when delivery arrives out of order. Visit numbers are local to a browser and are not people counts.</p>
        {!data.recentEvents.length ? <p className="mt-3">No {filters.includeInternal ? '' : 'external '}activity recorded in this period.</p> : <ol className={styles.timeline}>{data.recentEvents.map(event => <li key={event.event_id} className="break-words border-l-2 pl-3 text-sm">
          <time dateTime={event.timestamp}>{formatTime(event.timestamp)} ET</time> — <strong>{PROPOSALS.find(proposal => proposal.id === event.proposal_id)?.label}</strong> — {eventLabel(event)} — Visit {event.visit_number}
          <span className="block text-xs">{event.traffic_type} · first-party · exact · sequence {event.sequence} · anonymous visit {event.session_id.slice(0, 8)}{event.outreach_id ? ` · outreach ${event.outreach_id.slice(0, 8)}` : ''}</span>
        </li>)}</ol>}
      </div>
      <details><summary className="cursor-pointer font-semibold">GA4 historical recovery — October 28, 2026</summary>
        <p className="my-3 text-sm">{history?.limitation}</p>
        {history?.available && <p className="text-sm">{history.rows.length} recovered minute buckets. Unclassified history is hidden by default and appears with the internal / QA toggle; it is never counted as confirmed external activity. Historical rows are separate from ledger summaries.</p>}
        {historicalRows.length ? <ol className={styles.timeline}>{historicalRows.map((event, index) => <li key={index} className="text-sm">{event.localMinute.replace('T', ' ')} {event.timezone || '(property timezone unavailable)'} — {event.recipient_id} — {eventLabel(event)} — count {event.count}<span className="block text-xs">GA4 historical · minute precision · {event.traffic_type}</span></li>)}</ol> : <p className="mt-2 text-sm">No reliably classified external historical rows available for this filter.</p>}
      </details>
    </>}
  </section>;
}
export default function ProposalOutreach() {
  const [allowed, setAllowed] = useState(false);
  const [data, setData] = useState<OutreachPanelData | null>(null);
  const [filters, setFilters] = useState<OutreachFilters>({ window: '7d', includeInternal: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const user = useRef<User | null>(null);
  const epoch = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  useEffect(() => {
    let active = true;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async signedIn => {
      const version = ++epoch.current;
      user.current = signedIn; setAllowed(false); setData(null); setError('');
      if (!signedIn) return;
      try {
        const token = await signedIn.getIdTokenResult();
        if (active && version === epoch.current) setAllowed(token.claims.admin === true);
      } catch { /* Existing administrator sign-in messaging is rendered by the parent. */ }
    });
    const invalidate = () => { epoch.current += 1; };
    return () => { active = false; invalidate(); unsubscribe(); };
  }, []);
  const load = useCallback(async () => {
    const signedIn = user.current;
    if (!signedIn || !allowed) return;
    const version = ++epoch.current;
    setBusy(true); setError('');
    try {
      const token = await signedIn.getIdToken();
      const params = new URLSearchParams({ window: filters.window, includeInternal: filters.includeInternal ? '1' : '0' });
      if (filters.proposalId) params.set('proposal', filters.proposalId);
      const response = await fetch(`/api/admin/proposal-outreach?${params}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Outreach activity unavailable.');
      if (version === epoch.current) setData(result);
    } catch (failure) {
      if (version === epoch.current) setError(failure instanceof Error ? failure.message : 'Outreach activity unavailable.');
    } finally { if (version === epoch.current) setBusy(false); }
  }, [allowed, filters]);
  useEffect(() => {
    if (!allowed) return;
    void load();
    const observer = new IntersectionObserver(entries => { visible.current = entries[0]?.isIntersecting || false; });
    if (container.current) observer.observe(container.current);
    const timer = setInterval(() => { if (visible.current && !document.hidden) void load(); }, 30000);
    const invalidate = () => { epoch.current += 1; };
    return () => { invalidate(); clearInterval(timer); observer.disconnect(); };
  }, [allowed, load]);
  if (!allowed) return null;
  return <div ref={container}><ProposalOutreachPanel data={data} filters={filters} onFilters={value => { setData(null); setFilters(value); }} refresh={() => void load()} busy={busy} error={error}/></div>;
}
