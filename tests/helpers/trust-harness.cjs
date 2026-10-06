/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function trustHarness() {
  const root = path.resolve(__dirname, '../..'); const cache = new Map(); const mocks = {};
  function load(relative) {
    const filename = path.resolve(root, relative); if (cache.has(filename)) return cache.get(filename).exports;
    const mod = { exports: {} }; cache.set(filename, mod);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
    function localRequire(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith('.') || id.startsWith('@/')) {
        const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
        const file = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync); if (file) return load(path.relative(root, file));
      }
      return require(id);
    }
    new Function('require', 'module', 'exports', output)(localRequire, mod, mod.exports); return mod.exports;
  }
  const db = new (load('tests/fakes/firestore.ts').FakeFirestore)();
  const calls = { leads: 0, notifications: [], authReads: 0 };
  let currentUser = { uid: 'person', email: 'a.b.c+tag@gmail.com', emailVerified: false };
  const auth = { getUser: async () => currentUser, getUserByEmail: async () => { calls.authReads++; if (!currentUser) throw { code: 'auth/user-not-found' }; return currentUser; } };
  const collection = db.collection.bind(db);
  db.collection = name => {
    const query = collection(name);
    query.add = async data => { const ref = query.doc('new-contact'); await ref.set(data); return ref; };
    return query;
  };
  const firestore = () => db.asFirestore(); firestore.FieldValue = { serverTimestamp: () => new Date() };
  const admin = { firebaseAdmin: { firestore, auth: () => auth } };
  for (const id of ['@/lib/firebaseAdmin', '../firebaseAdmin']) mocks[id] = admin;
  mocks['@/lib/leads'] = { processLead: async () => { calls.leads++; return { ok: true, id: 'lead' }; } };
  mocks['@/lib/firebase/requestAuth'] = { getRequestBearerAuth: async () => ({ attempted: true, uid: 'person' }) };
  mocks['next/headers'] = { cookies: async () => ({ get: () => undefined }) };
  mocks.resend = { Resend: class { emails = { send: async data => { calls.notifications.push(data); return { data: { id: 'provider' } }; } }; } };
  return { load, mocks, db, calls, setUser: user => { currentUser = user; } };
}
module.exports = { trustHarness };
