import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emitLaunchEvent } from '../lib/launch-metrics/events';

test('launch metrics are suppressed for known internal and QA browsers', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const sent: unknown[][] = [];
  const local = new Map<string, string>();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { pathname: '/', search: '' },
      localStorage: {
        getItem: (key: string) => local.get(key) ?? null,
        setItem: (key: string, value: string) => local.set(key, value),
      },
      sessionStorage: { getItem: () => null, setItem: () => undefined },
      gtag: (...args: unknown[]) => sent.push(args),
      dataLayer: [],
    },
  });

  try {
    local.set('ipurpose_internal_traffic', '1');
    assert.equal(emitLaunchEvent('clarity_check_start', 'internal-attempt'), false);
    assert.equal(sent.length, 0);

    local.clear();
    window.location.search = '?ipurpose_qa=1';
    assert.equal(emitLaunchEvent('clarity_check_start', 'qa-attempt'), false);
    assert.equal(sent.length, 0);

    window.location.search = '';
    window.location.pathname = '/admin/launch-metrics';
    assert.equal(emitLaunchEvent('clarity_check_complete', 'admin-attempt'), false);
    assert.equal(sent.length, 0);
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
