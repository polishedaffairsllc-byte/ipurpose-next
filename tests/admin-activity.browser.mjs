import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Isolated component verification: synthetic Firebase identity and HTTP responses only.
// No production credentials, real accounts, or live endpoints are used.
const root = fileURLToPath(new URL('../', import.meta.url));
const compiled = await build({
  stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import LaunchActivity from './app/admin/launch-metrics/LaunchActivity'; import styles from './app/admin/launch-metrics/metrics.module.css'; createRoot(document.getElementById('root')).render(<main className={styles.dashboard}><h1>Launch Metrics — test fixture</h1><LaunchActivity /></main>);`, resolveDir: root, loader: 'tsx' },
  bundle: true, write: false, outdir: '/fixture', platform: 'browser', jsx: 'automatic',
  plugins: [{ name: 'synthetic-auth', setup(builder) {
    builder.onResolve({ filter: /^(firebase\/auth|@\/lib\/firebaseClient)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path === 'firebase/auth'
      ? `export function onIdTokenChanged(auth, callback) { let active=true; window.fixtureSignOut=()=>callback(null); queueMicrotask(()=>{if(active) callback({getIdToken:async()=> 'synthetic-browser-token', getIdTokenResult:async()=>({claims:{admin:true}})});}); return ()=>{active=false;}; }`
      : `export function getFirebaseAuth(){return {};}`, loader: 'js' }));
  } }],
});
const js = compiled.outputFiles.find(file => file.path.endsWith('.js')).text;
const css = compiled.outputFiles.find(file => file.path.endsWith('.css')).text;
let purges = 0;
const records = [{ kind: 'accounts', id: 'fixture-user', email: 'dummy@example.com', name: 'Dummy test', date: '2026-09-20T12:00:00.000Z', source: null, status: 'unverified', score: null, identity: null }];
const server = createServer(async (req, res) => {
  if (req.url === '/fixture.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(js); }
  if (req.url === '/fixture.css') { res.setHeader('Content-Type', 'text/css'); return res.end(css); }
  if (req.url.startsWith('/api/admin/launch-activity')) {
    res.setHeader('Content-Type', 'application/json');
    assert.equal(req.headers.authorization, 'Bearer synthetic-browser-token');
    if (req.method === 'GET') return res.end(JSON.stringify({ rows: purges ? [] : records, cursor: null }));
    let text = ''; for await (const chunk of req) text += chunk;
    const body = JSON.parse(text);
    if (body.action === 'preview') return res.end(JSON.stringify({ target: body.target, uid: 'fixture-user', loginExists: true, email: 'dummy@example.com', fingerprint: 'fixture-fingerprint', confirmation: 'PURGE dummy@example.com', counts: { users: 1, leads: 1, clarityCheckSubmissions: 2, emailTasks: 6 }, pendingEmails: 6,
      records: [{ path: 'users/fixture-user', action: 'delete' }, { path: 'leads/fixture-lead', action: 'delete' }] }));
    assert.equal(body.action, 'purge'); assert.equal(body.confirmation, 'PURGE dummy@example.com'); assert.equal(body.fingerprint, 'fixture-fingerprint'); purges++;
    return res.end(JSON.stringify({ purged: true }));
  }
  res.setHeader('Content-Type', 'text/html');
  res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Activity fixture</title><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole('button', { name: 'Preview purge for dummy@example.com' }).click();
  const deletion = page.getByRole('button', { name: 'Permanently purge', exact: true });
  await deletion.waitFor(); assert.equal(await deletion.isDisabled(), true);
  await page.getByLabel('Type PURGE dummy@example.com').fill('PURGE wrong@example.com');
  await page.getByRole('checkbox').check(); assert.equal(await deletion.isDisabled(), true);
  await page.getByLabel('Type PURGE dummy@example.com').fill('PURGE dummy@example.com');
  assert.equal(await deletion.isEnabled(), true);
  await page.screenshot({ path: '/private/tmp/ipurpose-admin-activity-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/private/tmp/ipurpose-admin-activity-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click(); assert.equal(purges, 0);
  await page.getByRole('button', { name: 'Preview purge for dummy@example.com' }).click();
  await page.getByRole('checkbox').check();
  await page.getByLabel('Type PURGE dummy@example.com').fill('PURGE dummy@example.com');
  await deletion.click(); await page.getByText(/Purge completed\./).waitFor(); assert.equal(purges, 1);
  await page.getByText('No matching records in the loaded pages.').waitFor();
  await page.evaluate(() => window.fixtureSignOut());
  await page.getByRole('heading', { name: 'People & activity' }).waitFor({ state: 'hidden' });
  assert.deepEqual(errors, []);
  console.log('PASS: synthetic admin UI loads; typed confirmation + checkbox gate deletion; cancel performs no purge; confirmed purge performs exactly one; sign-out hides PII; zero page errors; desktop/mobile screenshots saved.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
