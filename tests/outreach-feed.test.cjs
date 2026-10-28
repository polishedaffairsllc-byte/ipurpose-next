const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const source = readFileSync(path.join(__dirname, '../app/api/admin/launch-metrics-feed/route.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
test('actual existing owner feed includes generic outreach in v2; no OAuth or snapshot contract changes', async () => {
  const outreach = { generatedAt: '2026-10-28T16:00:00Z', timezone: 'America/New_York', externalOnly: true, proposals: [{ proposal_id: 'sdsn-ghana-jh', visits: 1 }], recentEvents: [{ proposal_id: 'sdsn-ghana-jh', source_event_name: 'sdsn_page_view', event_type: 'page_view', traffic_type: 'external', timestamp: '2026-10-28T15:00:00Z' }] };
  const mod = { exports: {} }; const calls = [];
  const db = { collection: () => ({ orderBy() { return this; }, limit() { return this; }, get: async () => ({ docs: [] }), count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }) }) };
  const load = id => {
    if (id === 'node:crypto') return require(id);
    if (id === '@/lib/firebaseAdmin') return { firebaseAdmin: { firestore: () => db, auth: () => ({ listUsers: async () => ({ users: [] }) }) } };
    if (id === '@/lib/admin-activity/service') return { createActivityService: () => ({ list: async () => ({ rows: [], cursor: null }) }) };
    if (id === '@/lib/launch-metrics/ga4Dashboard') return { getGa4Dashboard: async () => ({}) };
    if (id === '@/lib/outreach/service') return { readOutreach: async (database, filters) => { assert.equal(database, db); calls.push(filters); return outreach; } };
    if (id === '@/lib/outreach/history') return { getOutreachHistory: async () => ({ available: true, rows: [] }), historyForFilters: (history, filters) => { assert.equal(filters.includeInternal, false); return history; } };
    throw new Error('Unexpected boundary ' + id);
  };
  new Function('require', 'module', 'exports', 'process', output)(load, mod, mod.exports, { env: { LAUNCH_METRICS_FEED_TOKEN: 'fixture-only-token' } });
  const response = await mod.exports.GET(new Request('https://example.com/api/admin/launch-metrics-feed', { headers: { authorization: 'Bearer fixture-only-token', 'x-ipurpose-metrics-version': '2' } }));
  assert.equal(response.status, 200); const data = await response.json(); assert.deepEqual(data.outreach.proposals, outreach.proposals); assert.deepEqual(data.outreach.recentEvents, outreach.recentEvents); assert.deepEqual(calls, [{ window: '7d', includeInternal: false }]); assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
