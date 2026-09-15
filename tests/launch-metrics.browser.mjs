// UI-only fixtures: real dashboard components, mocked Firebase boundary, no production requests.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const fixture = {
  schemaVersion: 1, weekStart: '2026-09-07', weekEnding: '2026-09-13',
  counts: { first_open: 10, sign_up: 105, clarity_check_start: 7, clarity_check_complete: 2, email_signup: 1 },
  byPlatform: Object.fromEntries(['Android', 'iOS', 'web'].map(platform => [platform, { first_open: 0, sign_up: 0, clarity_check_start: 0, clarity_check_complete: 0, email_signup: 0 }])),
  rates: { installToRegistration: 50, registrationToClarityStart: 140, clarityStartToCompletion: 28.6, installToCompletion: 20 },
  computedAt: '2026-09-15T00:00:00Z', reportingTimezone: 'America/New_York', property: 'properties/514773870',
};
const mock = `
  window.metricsTest = { role: 'admin', rows: ${JSON.stringify([fixture])}, calls: [], fail: false, delay: false };
  const state = window.metricsTest;
  export const getFirebaseAuth = () => ({});
  export const getApp = () => ({});
  export const getFunctions = () => ({});
  export function onIdTokenChanged(_auth, callback) {
    state.changeRole = role => {
      state.role = role;
      callback(role === 'anonymous' ? null : { uid: 'fixture', getIdTokenResult: async () => ({ claims: { admin: role === 'admin' } }) });
    };
    queueMicrotask(() => state.changeRole(state.role));
    return () => {};
  }
  export const httpsCallable = (_functions, name) => async data => {
    state.calls.push({ name, data });
    if (state.fail) throw new Error('Fixture permission denied');
    if (name === 'runLaunchMetricsNow') return { data: { skipped: true, weekEnding: data.weekEnding || '2026-09-13' } };
    if (state.delay) return new Promise(resolve => { state.resolveRead = () => resolve({ data: state.rows }); });
    return { data: state.rows };
  };
`;
const bundle = await build({
  stdin: { contents: `import { createRoot } from 'react-dom/client'; import Dashboard from './app/admin/launch-metrics/LaunchMetricsClient'; createRoot(document.getElementById('root')).render(<Dashboard />);`, loader: 'tsx', resolveDir: process.cwd() },
  bundle: true, write: false, outdir: 'test-results/metrics-browser', jsx: 'automatic', platform: 'browser',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'firebase-test-boundary', setup(context) {
    context.onResolve({ filter: /^(firebase\/(app|auth|functions)|@\/lib\/firebaseClient)$/ }, () => ({ path: 'firebase-boundary', namespace: 'fixture' }));
    context.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: mock, loader: 'js' }));
  } }],
});
const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).text;
const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).text;
const server = createServer((req, res) => {
  res.setHeader('Content-Type', req.url === '/bundle.js' ? 'text/javascript' : 'text/html');
  res.end(req.url === '/bundle.js' ? js : `<!doctype html><html><head><style>body{margin:0;background:#faf8fc;font-family:Arial,sans-serif} ${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.getByRole('button', { name: 'Export CSV' }).waitFor();
  assert.equal(await page.getByRole('table').count(), 1);
  assert.equal(await page.getByRole('img', { name: 'Weekly launch event counts' }).count(), 1);
  assert.ok((await page.locator('main').innerText()).includes('50%'));
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/launch-metrics-admin.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  assert.ok(download.suggestedFilename().endsWith('.csv'));
  assert.ok((await readFile(await download.path(), 'utf8')).includes('2026-09-13'));
  await page.getByLabel('Week ending Sunday (optional)').fill('2026-09-06');
  await page.getByRole('button', { name: 'Compute week' }).click();
  await page.getByRole('status').filter({ hasText: 'snapshot preserved' }).waitFor();
  assert.equal(await page.evaluate(() => window.metricsTest.calls.find(call => call.name === 'runLaunchMetricsNow').data.weekEnding), '2026-09-06');
  console.log('PASS: real dashboard renders, computes a chosen week, reports idempotency and downloads CSV.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/launch-metrics-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  console.log('PASS: narrow layout has no page-wide horizontal overflow.');

  await page.evaluate(() => { window.metricsTest.rows = []; });
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByText('No weekly snapshots yet. Compute', { exact: false }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Export CSV' }).isDisabled(), true);
  console.log('PASS: empty data is explicit and export is disabled.');

  await page.evaluate(() => { window.metricsTest.delay = true; window.metricsTest.changeRole('admin'); });
  await page.getByRole('status').filter({ hasText: 'Loading weekly' }).waitFor();
  await page.waitForFunction(() => typeof window.metricsTest.resolveRead === 'function');
  await page.evaluate(() => { window.metricsTest.changeRole('anonymous'); window.metricsTest.resolveRead(); });
  await page.getByText('Administrator access is required.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('table').count(), 0);
  const calls = await page.evaluate(() => window.metricsTest.calls.length);
  await page.evaluate(() => window.metricsTest.changeRole('member'));
  await page.getByText('Administrator access is required.', { exact: false }).waitFor();
  assert.equal(await page.evaluate(() => window.metricsTest.calls.length), calls);
  console.log('PASS: logout discards delayed results; non-admins never request metrics.');

  await page.evaluate(() => { window.metricsTest.fail = true; window.metricsTest.delay = false; window.metricsTest.changeRole('admin'); });
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('table').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Try again' }).count(), 1);
  assert.deepEqual(errors, []);
  console.log('PASS: server errors clear protected data, offer retry, and cause no browser exceptions.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
