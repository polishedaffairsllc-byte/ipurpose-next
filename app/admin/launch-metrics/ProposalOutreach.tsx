'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ProposalOutreach.module.css';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { eventLabel, OUTREACH_TIMEZONE, type OutreachFilters, type ProposalSummary } from '@/lib/outreach/model';
import { PROPOSALS, type Proposal } from '@/lib/outreach/registry';
import { activityFields, activityStatus, latestExternalInitiative } from '@/lib/outreach/activity';
import type { OutreachReport } from '@/lib/outreach/service';
import type { HistoryReport } from '@/lib/outreach/history';
export type OutreachPanelData = OutreachReport & { historical: HistoryReport };
const button = 'rounded border px-3 py-2 disabled:opacity-50';
const selectionKey = 'ipurpose_outreach_initiative_v1';
const formatTime = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { timeZone: OUTREACH_TIMEZONE, dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '—';
const attributedRecipientLabel = (initiative: Proposal, recipientKey?: string) => recipientKey ? initiative.recipients?.[recipientKey] || recipientKey : null;

function InitiativeActivityCard({ initiative, summary, data, onSelect, loading }: {
  initiative: Proposal; summary?: ProposalSummary; data: OutreachPanelData | null; onSelect: (id: string) => void; loading: boolean;
}) {
  const history = data?.historical;
  const engagement = history?.available ? history.engagement?.find(row => row.initiativeId === initiative.id) : undefined;
  const historical = history?.available ? [...history.rows, ...(history.unclassifiedRows || [])].filter(row => row.proposal_id === initiative.id) : [];
  const ga4Counts = historical.reduce<Record<string, number>>((counts, row) => { counts[row.event_type] = (counts[row.event_type] || 0) + row.count; return counts; }, {});
  const recipientNames = [...new Set([
    ...(data?.recentEvents || []).filter(event => event.proposal_id === initiative.id).map(event => attributedRecipientLabel(initiative, event.recipient_key)),
    ...historical.map(event => attributedRecipientLabel(initiative, event.recipient_key)),
  ].filter((name): name is string => Boolean(name)))];
  return <article className={styles.activityCard} data-testid="outreach-activity-card" aria-busy={loading}>
    <label className={styles.selector}>Initiative<select aria-label="Outreach initiative" value={initiative.id} onChange={event => onSelect(event.target.value)}>
      {PROPOSALS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select></label>
    <div className={styles.cardBody}>
      <h3 id="outreach-initiative-title">{initiative.label}</h3>
      {initiative.organization && <p className={styles.organization}>{initiative.organization}</p>}
      <p className={styles.status} aria-live="polite">{loading ? 'Loading activity…' : !data ? 'Activity unavailable' : activityStatus(summary, data.externalOnly === false)}</p>
      <p className={styles.coverage}>First-party activity for the selected period. GA4 historical aggregates are shown separately.</p>
      {initiative.recipients && <p className={styles.coverage}><strong>Recipient link activity:</strong> {recipientNames.length ? recipientNames.join(', ') : 'No attributed recipient link activity yet.'}</p>}
      <dl className={styles.metrics}>{activityFields(initiative, summary, engagement).map(field => <div key={field.id}>
        <dt>{field.label}</dt><dd>{!data ? '—' : field.kind === 'time' ? formatTime(field.value as string | null) : typeof field.value === 'boolean' ? field.value ? 'Yes' : 'No' : field.value ?? '—'}</dd>
      </div>)}</dl>
      {!!historical.length && <div className={styles.ga4Summary}>
        <h4>GA4 historical events — aggregate / delayed</h4>
        <p>{historical.some(row => row.traffic_type === 'unknown') ? 'Includes unclassified traffic; not confirmed external visits. ' : ''}Not added to first-party visits or metrics.</p>
        <dl>{Object.entries(ga4Counts).map(([type, count]) => <div key={type}><dt>{eventLabel({ event_type: type })}</dt><dd>{count}</dd></div>)}</dl>
      </div>}
    </div>
  </article>;
}

export function ProposalOutreachPanel({ data, filters, onFilters, refresh, busy, error }: {
  data: OutreachPanelData | null; filters: OutreachFilters; onFilters: (value: OutreachFilters) => void;
  refresh: () => void; busy: boolean; error: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    try { const stored = sessionStorage.getItem(selectionKey); return PROPOSALS.some(item => item.id === stored) ? stored : null; } catch { return null; }
  });
  const initiative = PROPOSALS.find(item => item.id === selectedId) || PROPOSALS.find(item => item.id === latestExternalInitiative(data?.proposals || [], data?.externalOnly !== false, PROPOSALS, data?.historical.available ? data.historical.rows : [])) || PROPOSALS[0];
  const select = (id: string) => { setSelectedId(id); try { sessionStorage.setItem(selectionKey, id); } catch { /* Session storage is optional. */ } };
  const history = data?.historical;
  const recent = data?.recentEvents.filter(event => event.proposal_id === initiative.id) || [];
  const historicalRows = history?.available ? [...history.rows, ...(history.unclassifiedRows || [])].filter(row => row.proposal_id === initiative.id) : [];
  return <section className={styles.panel} aria-labelledby="proposal-outreach-title">
    <header><h2 id="proposal-outreach-title" className="text-2xl font-semibold">Outreach / Proposal Activity</h2>
      <p className="mt-2 text-sm">Page opened means a page load, not an email open. Visits are anonymous browser visits unless a controlled personalized recipient link identifies which outreach link was used. GA4 historical data may be aggregate and delayed.</p>
      <p className="mt-1 text-sm">America/New_York · first-party timestamps include seconds · selected period only · {data?.environment || 'current environment'}</p></header>
    <div className={styles.controls}>
      <label>Period<select value={filters.window} onChange={event => onFilters({ ...filters, window: event.target.value as OutreachFilters['window'] })}><option value="today">Today</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option></select></label>
      <label className={styles.check}><input type="checkbox" checked={filters.includeInternal} onChange={event => onFilters({ ...filters, includeInternal: event.target.checked })}/>Include internal / QA activity</label>
      <button className={button} disabled={busy} onClick={refresh}>{busy ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    <p className="text-sm font-semibold">{filters.includeInternal ? 'External and internal / QA activity' : 'External activity only'}</p>
    {error && <p role="alert">{error}</p>}
    {data && <p className="text-sm">Updated {formatTime(data.generatedAt)} ET. Refreshes about every 30 seconds while this panel is visible.</p>}
    {data?.truncated && <p role="alert">The safety limit was reached. Counts and timelines are partial; choose a shorter period.</p>}
    <InitiativeActivityCard initiative={initiative} summary={data?.proposals.find(row => row.proposal_id === initiative.id)} data={data} onSelect={select} loading={!data && !error}/>
    <div><h3 className="text-lg font-semibold">{initiative.label} activity timeline</h3><p className="text-sm">Server receipt time, oldest first; event sequence preserves order within an anonymous visit. Visit numbers are local to a browser, not people counts. Recipient labels identify the personalized link used, not an email-open event.</p>
      <div className={styles.timelineSpace}>{!recent.length ? <p>No {filters.includeInternal ? '' : 'external '}activity recorded in this period.</p> : <ol className={styles.timeline}>{recent.map(event => {
        const recipientName = attributedRecipientLabel(initiative, event.recipient_key);
        return <li key={event.event_id}>
          <time dateTime={event.timestamp}>{formatTime(event.timestamp)} ET</time> — {eventLabel(event)} — Visit {event.visit_number}{recipientName ? ` — ${recipientName}` : ''}
          <span>{event.traffic_type} · first-party · exact · sequence {event.sequence} · anonymous visit {event.session_id.slice(0, 8)}{recipientName ? ' · personalized recipient link' : ''}{event.outreach_id ? ' · outreach ' + event.outreach_id.slice(0, 8) : ''}</span>
        </li>;
      })}</ol>}</div>
    </div>
    <details><summary>GA4 historical activity for {initiative.label}</summary>
      <p>{history?.limitation || 'GA4 data is aggregate and may be delayed; it does not identify individuals.'}</p>
      <div className={styles.timelineSpace}>{historicalRows.length ? <ol className={styles.timeline}>{historicalRows.map((event, index) => {
        const recipientName = attributedRecipientLabel(initiative, event.recipient_key);
        return <li key={index}>{event.localMinute.replace('T', ' ')} {event.timezone || '(property timezone unavailable)'} — {eventLabel(event)} — count {event.count}{recipientName ? ` — ${recipientName}` : ''}<span>GA4 historical · minute precision · {event.traffic_type}{recipientName ? ' · personalized recipient link' : ''}</span></li>;
      })}</ol> : <p>No historical events reported for this initiative and period.</p>}</div>
    </details>
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
  const authEpoch = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async signedIn => {
      const version = ++authEpoch.current;
      ++epoch.current;
      user.current = signedIn; setAllowed(false); setData(null); setBusy(false); setError('');
      if (!signedIn) return;
      try {
        const token = await signedIn.getIdTokenResult();
        if (active && version === authEpoch.current) setAllowed(token.claims.admin === true);
      } catch { /* Existing administrator sign-in messaging is rendered by the parent. */ }
    });
    const invalidate = () => { epoch.current += 1; authEpoch.current += 1; };
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
      if (!response.ok) {
        if (version === epoch.current && [401, 403].includes(response.status)) setData(null);
        throw new Error(result.error || 'Outreach activity unavailable.');
      }
      if (version === epoch.current) setData(result);
    } catch (failure) {
      if (version === epoch.current) setError(failure instanceof Error ? failure.message : 'Outreach activity unavailable.');
    } finally { if (version === epoch.current) setBusy(false); }
  }, [allowed, filters]);
  useEffect(() => {
    if (!allowed) return;
    const initial = setTimeout(() => { void load(); }, 0);
    const timer = setInterval(() => {
      // Re-read geometry after filter changes/resizing instead of retaining a stale observer flag.
      const bounds = container.current?.getBoundingClientRect();
      if (!document.hidden && bounds && bounds.bottom > 0 && bounds.top < window.innerHeight
        && bounds.right > 0 && bounds.left < window.innerWidth) void load();
    }, 30000);
    const invalidate = () => { epoch.current += 1; };
    return () => { invalidate(); clearTimeout(initial); clearInterval(timer); };
  }, [allowed, load]);
  if (!allowed) return null;
  return <div ref={container}><ProposalOutreachPanel data={data} filters={filters} onFilters={value => { setData(null); setFilters(value); }} refresh={() => void load()} busy={busy} error={error}/></div>;
}
