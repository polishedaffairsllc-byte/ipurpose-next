import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { promisify } from 'node:util';

// Verify rendered responses, including inherited metadata, before promoting a build.
// node scripts/verify-indexing.mjs [origin] [--vercel]
const origin = process.argv[2] || 'https://ipurposesoul.com';
const preferredOrigin = 'https://ipurposesoul.com';
const useVercel = process.argv.includes('--vercel');
const exec = promisify(execFile);
const failures = [];
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1].toLowerCase(), m[2].replaceAll('&amp;', '&')]));
}
async function request(path) {
  if (!useVercel) {
    const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(45000), headers: { 'User-Agent': 'Googlebot' } });
    return { status: response.status, body: await response.text(), type: response.headers.get('content-type'), xRobots: response.headers.get('x-robots-tag') || '' };
  }
  const { stdout } = await exec('vercel', ['curl', path, '--deployment', origin, '--', '--silent', '--show-error', '--include', '--max-time', '45', '--user-agent', 'Googlebot'], { maxBuffer: 8 * 1024 * 1024, timeout: 60000 });
  const boundary = stdout.indexOf('\r\n\r\n');
  const headers = stdout.slice(0, boundary);
  return { status: Number(headers.match(/HTTP\/\S+\s+(\d+)/)?.[1]), body: stdout.slice(boundary + 4), type: headers.match(/content-type:\s*([^\r\n]+)/i)?.[1], xRobots: headers.match(/x-robots-tag:\s*([^\r\n]+)/i)?.[1] || '' };
}
const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.status, 200, 'Sitemap must return 200 directly');
assert.match(sitemap.type || '', /xml/i);
assert.match(sitemap.body, /<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));
assert.ok(urls.length > 0);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
const sitemapPaths = new Set();
for (const url of urls) {
  const u = new URL(url);
  assert.equal(u.origin, preferredOrigin, `Nonpreferred sitemap URL: ${url}`);
  assert.equal(u.search + u.hash, '', `Tracking parameters in sitemap: ${url}`);
  sitemapPaths.add(u.pathname);
}
const required = ['/clarity-check-quiz', '/ai-blueprint', '/starter-pack', '/ipurpose-6-week'];
for (const path of required) assert.ok(sitemapPaths.has(path), `${path} missing from sitemap`);
const paths = new Set([...sitemapPaths, ...required, '/starter-pack/demo', '/login']);
async function findPages(directory, parts = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.includes('[')) await findPages(`${directory}/${entry.name}`, entry.name.startsWith('(') ? parts : [...parts, entry.name]);
    if (entry.name === 'page.tsx') paths.add(`/${parts.join('/')}`);
  }
}
await findPages(new URL('../app', import.meta.url).pathname);
let checked = 0;
let stagedNoindexHeaders = 0;
let redirectedOrMissing = 0;
const queue = [...paths];
async function worker() {
  while (queue.length) {
    const path = queue.shift();
    try {
      const r = await request(path);
      const tags = [...r.body.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map((m) => attributes(m[0]));
      const redirect = tags.some((a) => a['http-equiv']?.toLowerCase() === 'refresh');
      if (r.status !== 200 || redirect) {
        assert.ok(!sitemapPaths.has(path), `Sitemap URL ${path} returns ${r.status}${redirect ? ' with a client redirect' : ''}`);
        redirectedOrMissing++;
        continue;
      }
      const canonicals = tags.filter((a) => a.rel === 'canonical').map((a) => a.href);
      assert.equal(canonicals.length, 1, `${path}: expected exactly one canonical`);
      assert.equal(new URL(canonicals[0]).href, new URL(path, preferredOrigin).href, `${path}: incorrect canonical ${canonicals[0]}`);
      // Vercel intentionally sends noindex headers on unique staged deployment URLs.
      // Validate application metadata here; the promoted origin must also pass headers.
      if (useVercel && /noindex/i.test(r.xRobots)) stagedNoindexHeaders++;
      const robots = tags.filter((a) => ['robots', 'googlebot'].includes(a.name)).map((a) => a.content).join(',') + (useVercel ? '' : r.xRobots);
      if (sitemapPaths.has(path) || required.includes(path)) assert.doesNotMatch(robots, /noindex/i, `${path} must be indexable`);
      for (const m of r.body.matchAll(/<a\b[^>]*>/gi)) {
        const href = attributes(m[0]).href;
        if (!href) continue;
        const u = new URL(href, preferredOrigin + path);
        if (['ipurposesoul.com', 'www.ipurposesoul.com'].includes(u.hostname)) {
          assert.equal(u.origin, preferredOrigin, `${path}: nonpreferred internal link ${href}`);
          assert.notEqual(u.pathname, '/clarity-check-numeric', `${path}: redirected internal link ${href}`);
        }
      }
      checked++;
    } catch (error) { failures.push(`${path}: ${error.message}`); }
  }
}
await Promise.all(Array.from({ length: useVercel ? 4 : 6 }, worker));
console.log(JSON.stringify({ origin, sitemapUrls: urls.length, checked, redirectedOrMissing, stagedNoindexHeaders, failures }, null, 2));
assert.equal(failures.length, 0, 'Rendered indexing audit failed');
