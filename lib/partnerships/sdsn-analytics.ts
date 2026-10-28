import { createOutreachLogger } from '@/lib/outreach/client';
import { trackEvent } from '@/lib/analytics';
import { getLaunchMeasurementIds } from '@/lib/launch-metrics/config';

declare global {
  interface Window { __ipurposeGA4Ready?: boolean }
}

type Params = Record<string, string | number | boolean>;
const READY_EVENT = 'ipurpose:ga4-ready';

/** Hold initial events until the existing GA4 config commands are queued. */
export function createSDSNEventSender() {
  const logOutreach = createOutreachLogger();
  let pending: Array<{ name: string; params: Params }> = [];
  let listening = false;
  const send = (name: string, params: Params) => {
    const gaWindow = window as typeof window & Record<string, unknown>;
    const destinations = getLaunchMeasurementIds().filter(id => gaWindow[`ga-disable-${id}`] !== true);
    if (!destinations.length) return;
    // Explicit routing prevents Ads/default-group timing from swallowing GA4 events.
    trackEvent(name, { ...params, send_to: destinations });
    if (params.traffic_type === 'internal') {
      console.debug('[SDSN delivery]', name, JSON.stringify({ status: 'queued-to-gtag', measurement_ids: destinations }));
    }
  };
  const flush = () => {
    if (!window.__ipurposeGA4Ready) return;
    window.removeEventListener(READY_EVENT, flush);
    listening = false;
    const events = pending;
    pending = [];
    for (const event of events) send(event.name, event.params);
  };
  return (name: string, params: Params) => {
    if (typeof window === 'undefined') return;
    logOutreach(name, params);
    if (window.__ipurposeGA4Ready) { send(name, params); return; }
    // Bounded memory if GA4 is blocked, excluded, or unconfigured.
    if (pending.length < 256) pending.push({ name, params });
    if (!listening) {
      window.addEventListener(READY_EVENT, flush);
      listening = true;
    }
  };
}

export const trackSDSNEvent = createSDSNEventSender();
