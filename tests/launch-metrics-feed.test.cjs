const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Execute the actual route with only its Firebase boundary and environment replaced.
// This is a test fixture, never a deployment credential.
const TEST_TOKEN = 'test-only-launch-feed-token';
const source = readFileSync(path.join(__dirname, '../app/api/admin/launch-metrics-feed/route.ts'), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness({ token = TEST_TOKEN, rows = [], fail = false } = {}) {
  const calls = [];
  let limit;
  const query = {
    orderBy(field, direction) { calls.push(['orderBy', field, direction]); return this; },
    limit(value) { calls.push(['limit', value]); limit = value; return this; },
    async get() {
      calls.push(['get']);
      if (fail) throw new Error('private database diagnostic');
      const sorted = [...rows].sort((a, b) => b.weekEnding.localeCompare(a.weekEnding));
      return { docs: sorted.slice(0, limit).map(row => ({ data: () => row })) };
    },
  };
  const module = { exports: {} };
  const env = token === null ? {} : { LAUNCH_METRICS_FEED_TOKEN: token };
  const load = id => {
    if (id === 'node:crypto') return require(id);
    assert.equal(id, '@/lib/firebaseAdmin');
    calls.push(['firebaseAdmin']);
    return { firebaseAdmin: { firestore: () => ({
      collection(name) { calls.push(['collection', name]); return query; },
    }) } };
  };
  new Function('require', 'module', 'exports', 'process', output)(load, module, module.exports, { env });
  const request = (authorization, suffix = '') => module.exports.GET(new Request(
    `https://ipurposesoul.com/api/admin/launch-metrics-feed${suffix}`,
    { headers: authorization === undefined ? {} : { Authorization: authorization } },
  ));
  return { request, calls, route: module.exports };
}

test('missing, wrong, malformed, and query-string tokens return 401 before Firebase is touched', async () => {
  const h = harness();
  for (const header of [undefined, '', 'Bearer', 'Basic anything', 'Bearer wrong', `Bearer ${TEST_TOKEN.slice(0, -1)}x`, `Bearer ${TEST_TOKEN} extra`, `Bearer ${TEST_TOKEN},other`]) {
    const response = await h.request(header, `?token=${TEST_TOKEN}`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'Unauthorized' });
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.match(response.headers.get('www-authenticate'), /^Bearer /);
  }
  assert.deepEqual(h.calls, []);
});

test('an unset or empty environment token fails closed', async () => {
  for (const token of [null, '', '   ']) {
    const h = harness({ token });
    assert.equal((await h.request(`Bearer ${TEST_TOKEN}`)).status, 401);
    assert.deepEqual(h.calls, []);
  }
});

test('authorized reads use the existing query and return only the latest 52 dashboard snapshots', async () => {
  const rows = Array.from({ length: 55 }, (_, index) => {
    const end = new Date(Date.UTC(2025, 8, 7 + index * 7));
    const start = new Date(end.getTime() - 6 * 86400000);
    return {
      schemaVersion: 1, weekStart: start.toISOString().slice(0, 10), weekEnding: end.toISOString().slice(0, 10),
      computedAt: end.toISOString(), reportingTimezone: 'America/New_York', property: 'properties/525662576',
      counts: { first_open: 0, sign_up: 2, clarity_check_start: 3, clarity_check_complete: 1, email_signup: 1 },
      byPlatform: { Android: {}, iOS: {}, web: { sign_up: 2 } },
      rates: { installToRegistration: null, registrationToClarityStart: 0, clarityStartToCompletion: null, installToCompletion: null },
      internalNote: 'must not be returned',
    };
  });
  const h = harness({ rows });
  const response = await h.request(`Bearer ${TEST_TOKEN}`, '?limit=999');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('vary'), 'Authorization');
  const data = await response.json();
  const expected = [...rows].reverse().slice(0, 52).map(({ internalNote, ...snapshot }) => snapshot);
  assert.deepEqual(data, { count: 52, snapshots: expected });
  assert.deepEqual(h.calls, [['firebaseAdmin'], ['collection', 'analytics_weekly'], ['orderBy', 'weekEnding', 'desc'], ['limit', 52], ['get']]);
  assert.deepEqual(Object.keys(h.route).sort(), ['GET', 'dynamic', 'runtime']);
  assert.equal(h.route.dynamic, 'force-dynamic');
});

test('authorized reads return an empty collection without computing or writing a snapshot', async () => {
  const h = harness();
  const response = await h.request(`bearer ${TEST_TOKEN}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { count: 0, snapshots: [] });
});

test('database failures return a non-cacheable error without leaking diagnostics or the token', async () => {
  const response = await harness({ fail: true }).request(`Bearer ${TEST_TOKEN}`);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await response.json(), { error: 'Launch metrics unavailable' });
});
