import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSDSNEventSender } from '../lib/partnerships/sdsn-analytics';
import { getLaunchMeasurementIds } from '../lib/launch-metrics/config';

test('initial SDSN events wait for GA4 config, then route once to GA4 destinations', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const target = new EventTarget();
  const commands: unknown[][] = [];
  const browser = Object.assign(target, {
    __ipurposeGA4Ready: false,
    gtag: (...args: unknown[]) => commands.push(args),
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  try {
    const send = createSDSNEventSender();
    const params = { recipient_id: 'ghana-jh', deck_variant: 'ghana', debug_mode: true };
    send('sdsn_page_view', params);
    send('sdsn_slide_view', { ...params, slide_number: 1 });
    assert.equal(commands.length, 0, 'Ads being ready is not GA4 readiness');
    for (const id of getLaunchMeasurementIds()) browser.gtag('config', id);
    browser.__ipurposeGA4Ready = true;
    target.dispatchEvent(new Event('ipurpose:ga4-ready'));
    const events = commands.filter(command => command[0] === 'event');
    assert.deepEqual(events.map(command => command[1]), ['sdsn_page_view', 'sdsn_slide_view']);
    for (const command of events) {
      const payload = command[2] as Record<string, unknown>;
      assert.deepEqual(payload.send_to, getLaunchMeasurementIds());
      assert.equal(payload.recipient_id, 'ghana-jh');
      assert.equal(payload.debug_mode, true);
    }
    target.dispatchEvent(new Event('ipurpose:ga4-ready'));
    assert.equal(commands.filter(command => command[0] === 'event').length, 2);
    send('sdsn_pdf_download', params);
    assert.equal(commands.at(-1)?.[1], 'sdsn_pdf_download');
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('SDSN delivery respects existing GA disable flags when the pending queue flushes', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const target = new EventTarget();
  const commands: unknown[][] = [];
  const browser = Object.assign(target, {
    __ipurposeGA4Ready: false,
    gtag: (...args: unknown[]) => commands.push(args),
  }) as unknown as EventTarget & Record<string, unknown>;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  try {
    const send = createSDSNEventSender();
    send('sdsn_page_view', { recipient_id: 'ghana-jh' });
    for (const id of getLaunchMeasurementIds()) browser[`ga-disable-${id}`] = true;
    browser.__ipurposeGA4Ready = true;
    target.dispatchEvent(new Event('ipurpose:ga4-ready'));
    send('sdsn_slide_view', { recipient_id: 'ghana-jh', slide_number: 2 });
    assert.equal(commands.length, 0);
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
