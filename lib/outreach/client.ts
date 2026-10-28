// First-party delivery is independent of GA readiness/consent and never changes GA parameters.
import { proposalByPath, type Proposal } from './registry';
type Params = Record<string, string | number | boolean>;
const KEYS = ['ipurpose_outreach_internal_v1', 'ipurpose_internal_traffic', 'ipurpose_qa_traffic'];
function internal(params: Params, proposal: Proposal) {
  const query = new URLSearchParams(window.location.search);
  if (params.traffic_type === 'internal' || params.debug_mode === true || query.get('preview') === '1' || query.get('ipurpose_qa') === '1' || query.get('utm_source')?.toLowerCase() === 'codex_qa') {
    try { window.localStorage.setItem('ipurpose_outreach_internal_v1', '1'); } catch { /* Optional. */ }
    return true;
  }
  try { return [...KEYS, ...(proposal.internalStorageKeys || [])].some(key => window.localStorage.getItem(key) === '1'); } catch { return false; }
}
export function createOutreachLogger() {
  let visit: { id: string; sequence: number; number: number; recipient: string } | undefined;
  return (name: string, params: Params) => {
    try {
      const proposal = proposalByPath(window.location.pathname);
      if (!proposal || !Object.hasOwn(proposal.events, name)) return;
      const type = proposal.events[name];
      const recipient = proposal.id;
      if (!visit || type === 'page_view' || visit.recipient !== recipient) {
        visit = { id: crypto.randomUUID(), sequence: 0, number: Number(params.visit_number) || 1, recipient };
      }
      const query = new URLSearchParams(window.location.search);
      const outreach = query.get('outreach');
      const isInternal = internal(params, proposal);
      const body = {
        event_id: crypto.randomUUID(), session_id: visit.id, client_timestamp: new Date().toISOString(),
        proposal_id: proposal.id, source_event_name: name,
        page_path: window.location.pathname, visit_number: visit.number, sequence: ++visit.sequence,
        traffic_type: isInternal ? 'internal' : 'external', debug_mode: params.debug_mode === true,
        ...(type === 'slide_view' ? { slide_number: params.slide_number } : {}),
        ...(type === 'deck_interaction' ? { interaction_type: params.interaction_type } : {}),
        ...(type === 'contact_click' && params.method === 'mailto' ? { method: 'mailto' } : {}),
        ...(outreach && /^[A-Za-z0-9_-]{24,96}$/.test(outreach) ? { outreach_id: outreach } : {}),
      };
      const encoded = JSON.stringify(body);
      // Beacon has a small bounded payload and survives navigation. Retry fallback uses the same event ID.
      if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/outreach/event', new Blob([encoded], { type: 'application/json' }))) return;
      void fetch('/api/outreach/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: encoded, keepalive: true, credentials: 'same-origin' }).catch(() => {});
    } catch { /* Storage, UUID, network or ledger failure must never affect the viewer or GA4. */ }
  };
}
