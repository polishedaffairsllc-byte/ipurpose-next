import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createOutreachLogger } from '../lib/outreach/client';
import { outreachSchema } from '../lib/outreach/model';
import { proposalById } from '../lib/outreach/registry';

const baseUgEvent = () => ({
  proposal_id: 'ug-careers-counselling',
  source_event_name: 'ug_page_view',
  event_id: randomUUID(),
  session_id: randomUUID(),
  client_timestamp: '2026-10-30T16:00:00.000Z',
  page_path: '/partnerships/ug/careers-counselling',
  visit_number: 1,
  sequence: 1,
  traffic_type: 'external' as const,
  debug_mode: false,
});

test('University of Ghana recipient attribution accepts only controlled recipient keys', () => {
  assert.deepEqual(proposalById('ug-careers-counselling')?.recipients, {
    setordzie: 'Dr. Gladys Setordzie',
    ben_naimah: 'Rev. Dr. Bridget Ben-Naimah',
    paintsil: 'Edwina Paintsil',
  });
  assert.equal(outreachSchema.safeParse({ ...baseUgEvent(), recipient_key: 'setordzie' }).success, true);
  assert.equal(outreachSchema.safeParse({ ...baseUgEvent(), recipient_key: 'ben_naimah' }).success, true);
  assert.equal(outreachSchema.safeParse({ ...baseUgEvent(), recipient_key: 'paintsil' }).success, true);
  assert.equal(outreachSchema.safeParse({ ...baseUgEvent(), recipient_key: 'arbitrary-person' }).success, false);
});

test('client maps a controlled utm_content value into recipient_key and drops unknown values', () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const oldFetch = globalThis.fetch;
  const bodies: Array<Record<string, unknown>> = [];
  let search = '?utm_content=ben_naimah';
  const location = { pathname: '/partnerships/ug/careers-counselling', get search() { return search; } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    location,
    localStorage: { getItem: () => null, setItem: () => undefined },
  } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { sendBeacon: () => false } });
  globalThis.fetch = ((_url: string, options: RequestInit) => {
    bodies.push(JSON.parse(options.body as string));
    return Promise.resolve(new Response(null, { status: 204 }));
  }) as typeof fetch;

  try {
    const log = createOutreachLogger();
    log('ug_page_view', {});
    assert.equal(bodies[0].recipient_key, 'ben_naimah');

    search = '?utm_content=untrusted';
    log('ug_page_view', {});
    assert.equal(Object.hasOwn(bodies[1], 'recipient_key'), false);

    search = '?utm_content=paintsil';
    log('ug_page_view', {});
    assert.equal(bodies[2].recipient_key, 'paintsil');
  } finally {
    globalThis.fetch = oldFetch;
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor); else Reflect.deleteProperty(globalThis, 'window');
    if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor); else Reflect.deleteProperty(globalThis, 'navigator');
  }
});
