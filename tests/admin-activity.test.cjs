/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness intentionally transpiles and isolates server modules. */
const assert = require('node:assert/strict');
const test = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Run the real service/HTTP code with in-memory Firebase boundaries. Never uses credentials.
const cache = new Map();
const firestore = { FieldPath: { documentId: () => '__name__' }, FieldValue: { delete: () => '__delete__', serverTimestamp: () => 'now' } };
function load(file) {
  file = path.resolve(__dirname, '..', file);
  if (cache.has(file)) return cache.get(file).exports;
  const fixtureModule = { exports: {} }; cache.set(file, fixtureModule);
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', source)(id => {
    if (id === 'firebase-admin/firestore') return firestore;
    if (id.startsWith('.')) return load(path.resolve(path.dirname(file), `${id}.ts`));
    return require(id);
  }, fixtureModule, fixtureModule.exports);
  return fixtureModule.exports;
}
const { createActivityService, targetOf, assertPurgeAllowed } = load('lib/admin-activity/service.ts');
const { activityHandler } = load('lib/admin-activity/http.ts');
const { canDeliverQueuedEmail } = load('lib/admin-activity/emailGuard.ts');
const target = { kind: 'accounts', id: 'test-user' };
function harness(extra = {}) {
  let revision = 1;
  const writes = [];
  const docs = new Map(Object.entries({
    'users/test-user': { email: 'test@example.com' },
    'users/test-user/accelerator/registration': { email: 'test@example.com' },
    'leads/lead-a': { email: ' Test@Example.com ', timestamp: '2026-09-20', source: 'welcome_popup' },
    'clarityCheckSubmissions/check-a': { uid: 'test-user', email: 'test@example.com', scores: { totalScore: 42 } },
    'clarityCheckSubmissions/anonymous': { scores: { totalScore: 21 } },
    'emailTasks/task-a': { email: 'test@example.com', submissionId: 'check-a', status: 'pending' },
    'infoSessionRegistrations/event-a': { email: 'TEST@example.com' },
    'cohort-registrations/cohort-a': { email: 'test@example.com' },
    'leads/real': { email: 'real@example.com' },
    'purchases/purchase-a': { uid: 'test-user', amount: 12000 },
    'community_posts/post-a': { authorUid: 'test-user', body: 'test' },
    'community_posts/post-a/comments/real': { authorUid: 'real-user', body: 'keep' },
    'analytics_weekly/week': { counts: { sign_up: 3 } },
    ...extra,
  }).map(([key, data]) => [key, { data, revision: revision++ }]));
  function snapshot(key) {
    const entry = docs.get(key);
    return { id: key.split('/').at(-1), exists: !!entry, ref: ref(key), data: () => entry?.data,
      updateTime: entry ? { toMillis: () => entry.revision, nanoseconds: entry.revision } : undefined };
  }
  function ref(key) {
    return { path: key, id: key.split('/').at(-1), parent: { id: key.split('/').at(-2) }, get: async () => snapshot(key),
      listCollections: async () => [...new Set([...docs.keys()].filter(item => item.startsWith(`${key}/`)).map(item => item.slice(key.length + 1).split('/')[0]))].map(name => query(`${key}/${name}`)) };
  }
  function query(collection, group = false, where = [], limit = Infinity, after = '') {
    return { doc: id => ref(`${collection}/${id}`),
      orderBy: () => query(collection, group, where, limit, after),
      limit: size => query(collection, group, where, size, after),
      startAfter: cursor => query(collection, group, where, limit, cursor),
      where: (field, op, value) => { assert.equal(op, '=='); return query(collection, group, [...where, [field, value]], limit, after); },
      get: async () => {
        const keys = [...docs.keys()].filter(key => (group ? key.split('/').at(-2) === collection : key.slice(0, key.lastIndexOf('/')) === collection)
          && key.split('/').at(-1) > after && where.every(([field, value]) => docs.get(key).data[field] === value)).sort().slice(0, limit);
        return { docs: keys.map(snapshot), size: keys.length, empty: !keys.length };
      } };
  }
  const db = { collection: name => query(name), collectionGroup: name => query(name, true), batch() {
    const operations = [];
    return { delete: (ref, pre) => operations.push(['delete', ref.path, null, pre]),
      update: (ref, data, pre) => operations.push(['update', ref.path, data, pre]),
      set: (ref, data) => operations.push(['set', ref.path, data]),
      async commit() {
        if (h.failBatch) throw new Error('private-credential-must-not-escape');
        for (const [, key, , pre] of operations) if (pre) assert.equal(docs.get(key)?.revision, pre.lastUpdateTime.toMillis());
        for (const [op, key, data] of operations) {
          writes.push([op, key]);
          if (op === 'delete') docs.delete(key);
          else docs.set(key, { data: { ...docs.get(key)?.data, ...data }, revision: revision++ });
        }
      } };
  } };
  const users = new Map([['admin', { uid: 'admin', email: 'admin@example.com', customClaims: { admin: true }, metadata: { creationTime: '2026-01-01' } }],
    ['test-user', { uid: 'test-user', email: 'test@example.com', metadata: { creationTime: '2026-09-20' } }]]);
  const auth = {
    async getUser(uid) { if (!users.has(uid)) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' }); return users.get(uid); },
    async getUserByEmail(email) { const value = [...users.values()].find(u => u.email?.toLowerCase() === email.toLowerCase()); if (!value) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' }); return value; },
    async listUsers(size, cursor) { const all = [...users.values()].sort((a, b) => a.uid.localeCompare(b.uid)); const start = Number(cursor || 0); return { users: all.slice(start, start + size), pageToken: start + size < all.length ? String(start + size) : undefined }; },
    async verifyIdToken(token, revoked) { assert.equal(revoked, true); if (token !== 'fixture-token') throw new Error('secret'); return { uid: 'admin', admin: true, auth_time: h.authTime }; },
    async updateUser(uid, data) { writes.push(['disable', uid]); Object.assign(users.get(uid), data); },
    async revokeRefreshTokens(uid) { writes.push(['revoke', uid]); },
    async deleteUser(uid) { if (h.failAuthDelete) throw new Error('private-auth-secret'); writes.push(['deleteUser', uid]); users.delete(uid); },
  };
  const service = createActivityService(db, auth);
  const h = { db, auth, service, docs, users, writes, failBatch: false, failAuthDelete: false, authTime: Math.floor(Date.now() / 1000),
    change(key, data) { docs.set(key, { data, revision: revision++ }); } };
  const handler = activityHandler(async () => ({ auth, service }));
  h.request = (body, token = 'fixture-token', suffix = '', origin) => handler(new Request(`https://ipurposesoul.com/api/admin/launch-activity${suffix}`, {
    method: body === undefined ? 'GET' : 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(origin ? { Origin: origin } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
  return h;
}

test('unauthenticated access rejects before loading Firebase; errors are private/no-store', async () => {
  const handler = activityHandler(() => { throw new Error('must not load'); });
  const response = await handler(new Request('https://ipurposesoul.com/api/admin/launch-activity'));
  assert.equal(response.status, 401); assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('invalid tokens and revoked admin permissions fail closed', async () => {
  const h = harness(); assert.equal((await h.request(undefined, 'wrong')).status, 401);
  h.users.get('admin').customClaims = {};
  assert.equal((await h.request()).status, 403); assert.deepEqual(h.writes, []);
});
test('all list categories paginate including legacy timestamp and undated records', async () => {
  const h = harness(Object.fromEntries(Array.from({ length: 201 }, (_, i) => [`leads/page-${String(i).padStart(3, '0')}`, { email: `p${i}@example.com` }])));
  let cursor; const seen = [];
  do { const page = await h.service.list('leads', cursor); seen.push(...page.rows); cursor = page.cursor; } while (cursor);
  assert.equal(seen.length, 203); assert.equal(new Set(seen.map(r => r.id)).size, 203);
  assert.equal(seen.find(r => r.id === 'lead-a').date, '2026-09-20T00:00:00.000Z');
  for (const kind of ['profiles', 'clarity', 'registrations', 'cohorts', 'emails']) assert.ok((await h.service.list(kind)).rows.length);
  assert.deepEqual(h.writes, []);
});
test('Auth users paginate and never expose hashes, tokens, or custom claims', async () => {
  const h = harness();
  for (let i = 0; i < 101; i++) h.users.set(`user-${i}`, { uid: `user-${i}`, metadata: {}, passwordHash: 'SECRET-HASH', customClaims: { secret: true } });
  const first = await h.service.list('accounts'); const second = await h.service.list('accounts', first.cursor);
  assert.equal(first.rows.length + second.rows.length, 103); assert.equal(JSON.stringify(first).includes('SECRET'), false);
  assert.equal(JSON.stringify(first).includes('customClaims'), false);
});
test('list input and target paths are restricted to known categories and single IDs', async () => {
  const h = harness();
  for (const value of [null, {}, { kind: 'purchases', id: 'x' }, { kind: 'accounts', id: '../admin' }, { kind: 'accounts', id: '..' }]) assert.throws(() => targetOf(value));
  await assert.rejects(h.service.list('purchases'), /Invalid page/);
});
test('preview is read-only and resolves linked mixed-case records, descendants, pending emails, and retained purchases', async () => {
  const h = harness(); const p = await h.service.preview('admin', target);
  assert.equal(p.email, 'test@example.com'); assert.equal(p.pendingEmails, 1);
  assert.ok(p.records.some(r => r.path === 'users/test-user/accelerator/registration'));
  assert.ok(p.records.some(r => r.path === 'infoSessionRegistrations/event-a'));
  assert.ok(p.records.some(r => r.path === 'purchases/purchase-a' && r.action === 'delink'));
  assert.ok(!p.records.some(r => r.path.includes('analytics_weekly') || r.path === 'leads/real' || r.path.endsWith('/comments/real')));
  assert.deepEqual(h.writes, []);
});
test('owner, self, custom-claim admins and protected profiles cannot be purged', async () => {
  for (const args of [['admin', 'admin', null], ['admin', 'other', 'mshmltn@gmail.com'], ['admin', 'other', 'renita@ipurposesoul.com'],
    ['admin', 'other', null, { customClaims: { admin: true } }], ['admin', 'other', null, undefined, { role: 'founder' }]]) assert.throws(() => assertPurgeAllowed(...args));
  const h = harness({ 'users/test-user': { email: 'test@example.com', admin: true } });
  await assert.rejects(h.service.preview('admin', target), /cannot be purged/); assert.deepEqual(h.writes, []);
});
test('anonymous checks are previewed individually without inventing an email/account', async () => {
  const h = harness(); const p = await h.service.preview('admin', { kind: 'clarity', id: 'anonymous' });
  assert.equal(p.uid, null); assert.equal(p.email, null); assert.equal(p.records.length, 1);
});
test('conflicting related UID/email and duplicate profiles block deletion', async () => {
  for (const extra of [{ 'leads/conflict': { email: 'test@example.com', uid: 'real-user' } }, { 'users/other': { email: 'test@example.com' } }]) {
    const h = harness(extra); await assert.rejects(h.service.preview('admin', target), /Conflicting|Manual review/); assert.deepEqual(h.writes, []);
  }
});
test('typed confirmation and preview fingerprint are required before any writes', async () => {
  const h = harness(); const p = await h.service.preview('admin', target);
  await assert.rejects(h.service.purge('admin', target, p.fingerprint, 'PURGE wrong'), /Confirmation/);
  h.change('leads/lead-a', { email: 'test@example.com', updated: true });
  await assert.rejects(h.service.purge('admin', target, p.fingerprint, p.confirmation), /records changed/);
  assert.deepEqual(h.writes, []);
});
test('new linked records invalidate preview', async () => {
  const h = harness(); const p = await h.service.preview('admin', target);
  h.change('emailTasks/new', { email: 'test@example.com', status: 'pending' });
  await assert.rejects(h.service.purge('admin', target, p.fingerprint, p.confirmation)); assert.deepEqual(h.writes, []);
});
test('confirmed purge disables/revokes login, atomically removes data, then deletes Auth; unrelated data remains', async () => {
  const h = harness(); const p = await h.service.preview('admin', target);
  const result = await h.service.purge('admin', target, p.fingerprint, p.confirmation);
  assert.equal(result.purged, true); assert.equal(result.pendingEmails, 1);
  assert.deepEqual(h.writes.slice(0, 2), [['disable', 'test-user'], ['revoke', 'test-user']]);
  assert.deepEqual(h.writes.at(-1), ['deleteUser', 'test-user']);
  assert.equal(h.users.has('test-user'), false); assert.equal(h.docs.has('emailTasks/task-a'), false);
  assert.equal(h.docs.has('leads/lead-a'), false); assert.equal(h.docs.has('clarityCheckSubmissions/check-a'), false);
  for (const key of ['leads/real', 'clarityCheckSubmissions/anonymous', 'analytics_weekly/week', 'community_posts/post-a/comments/real']) assert.ok(h.docs.has(key));
  assert.equal(h.docs.get('purchases/purchase-a').data.amount, 12000);
  assert.equal(h.docs.get('community_posts/post-a').data.authorUid, 'deleted-user');
  assert.ok(h.docs.has(`email_opt_outs/${Buffer.from('test@example.com').toString('base64')}`));
});
test('recent sign-in, current admin and same-origin checks protect mutation', async () => {
  const h = harness(); const p = await h.service.preview('admin', target);
  const body = { action: 'purge', target, fingerprint: p.fingerprint, confirmation: p.confirmation };
  h.authTime -= 301; assert.equal((await h.request(body)).status, 401);
  h.authTime = Math.floor(Date.now() / 1000); assert.equal((await h.request(body, 'fixture-token', '', 'https://evil.example')).status, 403);
  assert.deepEqual(h.writes, []);
});
test('partial failures never report success or expose private diagnostics; disabled account supports retry', async () => {
  const h = harness(); const p = await h.service.preview('admin', target); h.failBatch = true;
  const response = await h.request({ action: 'purge', target, fingerprint: p.fingerprint, confirmation: p.confirmation });
  assert.equal(response.status, 503); const text = await response.text(); assert.ok(!text.includes('credential')); assert.match(text, /did not finish/);
  assert.equal(h.users.get('test-user').disabled, true); assert.equal(h.docs.has('emailTasks/task-a'), true);
  h.failBatch = false; const retry = await h.service.preview('admin', target);
  assert.equal((await h.service.purge('admin', target, retry.fingerprint, retry.confirmation)).purged, true);
});
test('Auth deletion failure is recoverable from disabled Accounts even after activity was deleted', async () => {
  const h = harness(); const p = await h.service.preview('admin', target); h.failAuthDelete = true;
  await assert.rejects(h.service.purge('admin', target, p.fingerprint, p.confirmation), /did not finish/);
  assert.equal(h.users.get('test-user').disabled, true); h.failAuthDelete = false;
  const retry = await h.service.preview('admin', target); await h.service.purge('admin', target, retry.fingerprint, retry.confirmation);
  assert.equal(h.users.has('test-user'), false);
});
test('queue delivery re-check blocks deleted, non-pending and suppressed records and fails closed on errors', async () => {
  const h = harness(); const ref = h.db.collection('emailTasks').doc('task-a');
  assert.equal(await canDeliverQueuedEmail(h.db, ref, 'test@example.com'), true);
  h.change('emailTasks/task-a', { status: 'completed' }); assert.equal(await canDeliverQueuedEmail(h.db, ref, 'test@example.com'), false);
  h.docs.delete('emailTasks/task-a'); assert.equal(await canDeliverQueuedEmail(h.db, ref, 'test@example.com'), false);
  h.change('emailTasks/task-a', { status: 'pending' }); h.change(`email_opt_outs/${Buffer.from('test@example.com').toString('base64')}`, {});
  assert.equal(await canDeliverQueuedEmail(h.db, ref, 'test@example.com'), false);
  assert.equal(await canDeliverQueuedEmail(h.db, { get: async () => { throw new Error('private'); } }, 'test@example.com'), false);
});
test('oversized deletion refuses without partial writes', async () => {
  const h = harness(Object.fromEntries(Array.from({ length: 351 }, (_, i) => [`emailTasks/${i}`, { email: 'test@example.com' }])));
  await assert.rejects(h.service.preview('admin', target), /too large/); assert.deepEqual(h.writes, []);
});
test('endpoint authorizes successful list, preview and confirmed purge', async () => {
  const h = harness(); assert.equal((await h.request()).status, 200);
  const response = await h.request({ action: 'preview', target }); assert.equal(response.status, 200);
  const p = await response.json(); assert.deepEqual(h.writes, []);
  const deleted = await h.request({ action: 'purge', target, confirmation: p.confirmation, fingerprint: p.fingerprint });
  assert.equal(deleted.status, 200); assert.equal((await deleted.json()).purged, true);
});
