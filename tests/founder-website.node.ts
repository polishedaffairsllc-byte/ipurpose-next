import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOUNDER_WEBSITE_URL, trackFounderWebsiteClick } from '../lib/founder-website';
import { getLaunchMeasurementIds } from '../lib/launch-metrics/config';

test('founder referral URL identifies the exact source link without personal information', () => {
  const url = new URL(FOUNDER_WEBSITE_URL);
  assert.equal(url.origin, 'https://mshmltn.com');
  assert.equal(url.pathname, '/');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    utm_source: 'ipurpose', utm_medium: 'referral',
    utm_campaign: 'founder_profile', utm_content: 'about_founder_link',
  });
});

test('counts each activation once per GA destination, respects exclusions, and tolerates blocked analytics', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const websiteId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-9D1QBMLNWK';
  const commands: unknown[][] = [];
  const local = new Map<string, string>();
  const browser: Record<string, any> = {
    __ipurposeGA4Ready: false,
    location: { pathname: '/about', search: '' },
    localStorage: { getItem: (key: string) => local.get(key) ?? null },
    gtag: (...args: unknown[]) => commands.push(args),
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  try {
    assert.equal(trackFounderWebsiteClick(), false, 'wait for the GA loader exclusion decision');
    browser.__ipurposeGA4Ready = true;
    assert.equal(trackFounderWebsiteClick(), true);
    assert.equal(trackFounderWebsiteClick(), true, 'repeat clicks count as clicks, not unique people');
    assert.equal(commands.length, 2);
    for (const command of commands) {
      assert.equal(command[0], 'event');
      assert.equal(command[1], 'founder_website_click');
      assert.deepEqual(command[2], {
        link_id: 'about_founder_website', link_url: FOUNDER_WEBSITE_URL,
        link_domain: 'mshmltn.com', source_page: '/about', outbound: true,
        transport_type: 'beacon', send_to: getLaunchMeasurementIds(),
      });
    }
    assert.equal(getLaunchMeasurementIds().length, 1, 'duplicate destination IDs collapse');
    for (const key of ['ipurpose_internal_traffic', 'ipurpose_qa_traffic']) {
      local.set(key, '1');
      assert.equal(trackFounderWebsiteClick(), false);
      local.clear();
    }
    for (const search of ['?ipurpose_qa=1', '?utm_source=codex_qa']) {
      browser.location.search = search;
      assert.equal(trackFounderWebsiteClick(), false);
    }
    browser.location.search = '';
    browser.location.pathname = '/admin/launch-metrics';
    assert.equal(trackFounderWebsiteClick(), false);
    browser.location.pathname = '/about';
    for (const id of getLaunchMeasurementIds()) browser[`ga-disable-${id}`] = true;
    assert.equal(trackFounderWebsiteClick(), false);
    for (const id of getLaunchMeasurementIds()) delete browser[`ga-disable-${id}`];
    assert.equal(commands.length, 2, 'excluded traffic never sends events');
    browser.gtag = () => { throw new Error('analytics blocked'); };
    assert.equal(trackFounderWebsiteClick(), false, 'tracking failure must not break navigation');
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
    if (websiteId === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = websiteId;
  }
});

test('server rendering does not send a click event', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'window');
  try { assert.equal(trackFounderWebsiteClick(), false); }
  finally { if (original) Object.defineProperty(globalThis, 'window', original); }
});
