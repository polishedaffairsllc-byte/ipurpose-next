import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../content/purpose/source.md', import.meta.url), 'utf8');
const chunks = source.split(/^## PAGE \d+:.*\n/m).slice(1);
const pages = [];
const normalize = (value) => value.replace(/^\|[-| ]+\|\s*$/gm, '').replace(/\s+/g, ' ').trim();
function markdown(block) {
  switch (block.type) {
    case 'paragraph': return block.text;
    case 'h2': return `## ${block.text}`;
    case 'h3': return `### ${block.text}`;
    case 'quote': return `> ${block.text}`;
    case 'list': return block.items.map((text, index) => `${block.ordered ? `${index + 1}.` : '-'} ${text}`).join('\n');
    case 'table': return [block.headers, ...block.rows].map((row) => `| ${row.join(' | ')} |`).join('\n');
    default: throw new Error(`Unsupported block: ${block.type}`);
  }
}
for (const chunk of chunks) {
  const slug = chunk.match(/\*\*Slug:\*\* `\/purpose\/(.*?)`/)[1];
  const file = await readFile(new URL(`../content/purpose/${slug}.ts`, import.meta.url), 'utf8');
  const page = JSON.parse(file.split('const page = ')[1].split(' satisfies PurposePage;')[0]);
  assert.equal(page.title, chunk.match(/\*\*Title tag:\*\* (.*)/)[1]);
  assert.equal(page.description, chunk.match(/\*\*Meta description:\*\* (.*)/)[1]);
  const original = chunk.split('\n---')[0].split(`# ${page.heading}\n`)[1];
  const rebuilt = [...page.body.map(markdown), `## ${page.cta.heading}`, ...page.cta.body.map(markdown), ...(page.cta.label ? [`**[${page.cta.label}]**`] : []), ...page.afterCta.map(markdown)].join('\n');
  assert.equal(normalize(rebuilt), normalize(original), `${slug}: copy changed`);
  assert.equal(new Set(page.related).size, 3);
  assert(!page.related.includes(slug));
  if (slug !== 'what-is-my-purpose') assert(page.related.includes('what-is-my-purpose'));
  pages.push(page);
}
assert.equal(pages.length, 7);
assert.equal(new Set(pages.map((page) => page.title)).size, 7);
assert.equal(new Set(pages.map((page) => page.description)).size, 7);
const slugs = new Set(pages.map((page) => page.slug));
for (const page of pages) {
  for (const slug of page.related) assert(slugs.has(slug));
  for (const [, href] of JSON.stringify(page).matchAll(/\]\(([^)]+)\)/g)) assert(slugs.has(href.replace('/purpose/', '')), href);
}
console.log('PASS: exact source copy, metadata, CTA labels and all purpose links for seven articles.');

if (!process.env.BASE_URL) process.exit(0);
const base = process.env.BASE_URL.replace(/\/$/, '');
const out = process.env.PURPOSE_ARTIFACTS || '/private/tmp/purpose-verification';
await mkdir(out, { recursive: true });
const paths = ['/purpose', ...pages.map((page) => `/purpose/${page.slug}`)];
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
for (const path of paths) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  assert.equal(new URL(response.url).pathname, path, `${path}: unexpected redirect`);
  assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `${path}: noindex response header`);
  const html = await response.text();
  assert(html.includes('id="purpose-content"'), `${path}: no server-rendered main`);
  assert(html.includes('<h1'), `${path}: no server-rendered heading`);
  assert(html.includes(`href="https://ipurposesoul.com${path}"`), `${path}: canonical missing`);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /name="twitter:card" content="summary"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((match) => JSON.parse(match[1]));
  assert(schemas.some((schema) => schema['@type'] === 'BreadcrumbList'));
  const article = pages.find((page) => path.endsWith(`/${page.slug}`));
  if (article) {
    assert.equal(decode(html.match(/<title>(.*?)<\/title>/s)[1]), article.title);
    assert.equal(decode(html.match(/name="description" content="(.*?)"/s)[1]), article.description);
    assert(schemas.some((schema) => schema['@type'] === 'Article' && schema.headline === article.heading));
    const breadcrumb = schemas.find((schema) => schema['@type'] === 'BreadcrumbList' && schema.itemListElement.length === 3);
    assert.deepEqual(breadcrumb?.itemListElement.map((item) => item.name), ['Home', 'Purpose', article.heading]);
    assert.deepEqual(breadcrumb.itemListElement.map((item) => item.position), [1, 2, 3]);
    assert.equal(breadcrumb.itemListElement[2].item, `https://ipurposesoul.com${path}`);
    if (article.cta.label) {
      assert(html.includes(`data-purpose-cta="${article.slug}"`));
    } else {
      const articleHtml = html.match(/<article>([\s\S]*?)<\/article>/)?.[1];
      assert(articleHtml, `${path}: article missing`);
      assert(!articleHtml.includes('data-purpose-cta='), `${path}: unexpected CTA`);
      assert(!articleHtml.includes('href="/clarity-check"'), `${path}: unexpected article Clarity Check link`);
    }
  }
  await writeFile(`${out}/${path.split('/').pop()}.html`, html);
  console.log(`PASS: ${path} returns 200 with server-rendered content, metadata and JSON-LD.`);
}
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
for (const path of paths) assert(sitemap.includes(`<loc>https://ipurposesoul.com${path}</loc>`));
const missing = await fetch(`${base}/purpose/not-a-real-article`);
assert.equal(missing.status, 404);
console.log('PASS: all eight sitemap URLs and unknown-slug 404.');
for (const path of ['/', '/clarity-check', '/images/my-logo.png']) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, `Shared destination: ${path}`);
  await response.body?.cancel();
}
console.log('PASS: shared Home and Clarity Check links and social image resolve.');

if (process.env.BROWSER_CHECK !== '1') process.exit(0);
const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Never send verification clicks to real analytics destinations.
    await context.route(/google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr/, (route) => route.abort());
    for (const path of paths) {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
      await page.locator('main h1').waitFor();
      await page.locator('header a[href="/"]').first().waitFor();
      await page.waitForFunction(() => typeof window.gtag === 'function' && !!document.querySelector('#ga4-config'));
      assert.equal(await page.locator('main h1').count(), 1);
      const headings = await page.locator('main h1, main h2, main h3').evaluateAll((elements) => elements.map((element) => Number(element.tagName[1])));
      assert(headings.every((level, index) => index === 0 || level <= headings[index - 1] + 1), `${path}: heading level skipped`);
      const unnamedLinks = await page.locator('main a').evaluateAll((elements) => elements.filter((element) => !(element.getAttribute('aria-label') || element.textContent).trim()).length);
      assert.equal(unnamedLinks, 0);
      assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px overflow: ${path}`);
      if (path.includes('life-purpose-vs-goals')) {
        const region = page.getByRole('region', { name: /Purpose and goals comparison/ });
        if (width === 390) assert(await region.evaluate((el) => el.scrollWidth > el.clientWidth));
        await region.screenshot({ path: `${out}/table-${width}.png` });
      }
      if (path === '/purpose' || path.endsWith('what-is-my-purpose') || path.endsWith('life-purpose-vs-goals') || path.endsWith('find-purpose-when-stuck') || path.endsWith('purpose-into-action')) {
        await page.screenshot({ path: `${out}/${path.split('/').pop()}-${width}.png`, fullPage: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${out}/${path.split('/').pop()}-top-${width}.png` });
        if (path !== '/purpose') await page.locator('aside[aria-labelledby="related-pages"]').screenshot({ path: `${out}/${path.split('/').pop()}-related-${width}.png` });
      }
      // Stub the existing helper's sink; confirm event parameters before navigation.
      await page.evaluate(() => { window.__purposeEvents = []; window.gtag = (...args) => window.__purposeEvents.push(args); });
      const cta = page.locator('main [data-purpose-cta]');
      if (path.endsWith('find-purpose-when-stuck')) {
        assert.equal(await cta.count(), 0);
        assert.equal(await page.locator('main a[href="/clarity-check"]').count(), 0);
        const nextLink = page.locator('article > div').getByRole('link', { name: 'How to Turn Your Purpose Into Action', exact: true });
        assert.equal(await nextLink.getAttribute('href'), '/purpose/purpose-into-action');
        await nextLink.evaluate((el) => el.addEventListener('click', (event) => event.preventDefault()));
        await nextLink.click();
        await nextLink.focus();
        await page.keyboard.press('Enter');
        assert(await page.evaluate(() => !window.__purposeEvents.some((args) => args[1] === 'purpose_cta_click')));
        await page.locator('section[aria-labelledby="purpose-cta-heading"]').screenshot({ path: `${out}/find-purpose-when-stuck-closing-${width}.png` });
        await nextLink.locator('..').screenshot({ path: `${out}/find-purpose-when-stuck-next-${width}.png` });
        console.log(`PASS: ${width}px page 6 has no article CTA/link/event and preserves its next-page link.`);
        continue;
      }
      const slug = await cta.getAttribute('data-purpose-cta');
      await cta.evaluate((el) => el.addEventListener('click', (event) => event.preventDefault()));
      await page.keyboard.press('Tab');
      await cta.focus();
      assert(await cta.evaluate((element) => document.activeElement === element && getComputedStyle(element).outlineStyle !== 'none' && parseFloat(getComputedStyle(element).outlineWidth) >= 2), `${path}: CTA keyboard focus is not visible`);
      await cta.click();
      const event = await page.evaluate(() => window.__purposeEvents.find((args) => args[1] === 'purpose_cta_click'));
      assert.equal(event?.[2]?.page_slug, slug);
      assert.equal(event?.[2]?.link_url, '/clarity-check');
      assert.equal(event?.[2]?.page_path, path);
      assert.equal(event?.[2]?.cta_text, await cta.innerText());
      await page.evaluate(() => { window.__purposeEvents = []; });
      await cta.focus();
      await page.keyboard.press('Enter');
      assert(await page.evaluate(() => window.__purposeEvents.some((args) => args[1] === 'purpose_cta_click')), `${path}: keyboard activation missing`);
      if (path === '/purpose' || path.endsWith('what-is-my-purpose') || path.endsWith('life-purpose-vs-goals') || path.endsWith('find-purpose-when-stuck') || path.endsWith('purpose-into-action')) {
        await page.mouse.move(0, 0);
        await cta.locator('..').screenshot({ path: `${out}/${path.split('/').pop()}-cta-${width}.png` });
      }
      assert.equal(await cta.getAttribute('href'), '/clarity-check');
    }
    assert.deepEqual(errors, [], `Browser exceptions at ${width}px`);
    await context.close();
    console.log(`PASS: all eight pages at ${width}px; no page errors or horizontal overflow; six article CTAs and the hub CTA carry the correct slug; page 6 has no CTA event.`);
  }
} finally {
  await browser.close();
}
