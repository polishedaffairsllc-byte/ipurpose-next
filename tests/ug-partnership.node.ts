import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUGPreviewEnabled, ugConfig } from '../lib/partnerships/ug';
import { partnershipEventName } from '../lib/partnerships/presentation';
import { createSDSNEventSender } from '../lib/partnerships/sdsn-analytics';
import { getLaunchMeasurementIds } from '../lib/launch-metrics/config';

test('UG page is available in previews/development and fails closed in production', () => {
  assert.equal(isUGPreviewEnabled('preview', 'production'), true);
  assert.equal(isUGPreviewEnabled('production', 'production'), false);
  assert.equal(isUGPreviewEnabled('production', 'development'), false);
  assert.equal(isUGPreviewEnabled('', 'production'), false);
  assert.equal(isUGPreviewEnabled('development', 'development'), true);
});

test('UG translates all template events without changing the SDSN defaults', () => {
  for (const suffix of ['page_view', 'deck_start', 'slide_view', 'deck_interaction', 'deck_complete', 'pdf_download', 'visit_ipurpose_click', 'contact_click', 'video_click', 'overview_download']) {
    assert.equal(partnershipEventName(`sdsn_${suffix}`, 'ug'), `ug_${suffix}`);
    assert.equal(partnershipEventName(`sdsn_${suffix}`), `sdsn_${suffix}`);
  }
  assert.equal(ugConfig.slides.length, 8);
  assert.equal(ugConfig.videoUrl, undefined);
});

test('UG events wait for existing GA4 readiness and honor existing disable flags', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const commands: unknown[][] = [];
  const browser = Object.assign(new EventTarget(), {
    __ipurposeGA4Ready: false,
    gtag: (...args: unknown[]) => commands.push(args),
  }) as unknown as EventTarget & Record<string, unknown>;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  try {
    const send = createSDSNEventSender();
    const params = { recipient_id: ugConfig.slug, deck_variant: ugConfig.deckVariant, traffic_type: 'internal', debug_mode: true };
    send('ug_page_view', params);
    assert.equal(commands.length, 0);
    browser.__ipurposeGA4Ready = true;
    browser.dispatchEvent(new Event('ipurpose:ga4-ready'));
    assert.deepEqual(commands, [['event', 'ug_page_view', { ...params, send_to: getLaunchMeasurementIds() }]]);
    for (const id of getLaunchMeasurementIds()) browser[`ga-disable-${id}`] = true;
    send('ug_contact_click', params);
    assert.equal(commands.length, 1, 'Existing exclusion flags must still suppress delivery');
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
