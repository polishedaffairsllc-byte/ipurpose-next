// Run against `next start`: NAV_BASE_URL=http://127.0.0.1:3100 node scripts/verify-public-header.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.NAV_BASE_URL || 'http://127.0.0.1:3100';
const output = path.resolve(process.env.NAV_REPORT_DIR || 'test-results/public-header');
const routes = process.env.NAV_ROUTES?.split(',') || ['/', '/discover', '/program', '/delete-account', '/about', '/clarity-check'];
const widths = [1440, 1024, 768, 390];
const completedStates = process.env.NAV_COMPLETED === undefined ? [false, true] : [process.env.NAV_COMPLETED === 'true'];
const signedInStates = process.env.NAV_SIGNED_IN === undefined ? [false, true] : [process.env.NAV_SIGNED_IN === 'true'];
const report = { baseURL, matrix: [], clicks: [], pageErrors: [], failures: [] };
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const save = () => writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
const headerFor = (page) => page.locator('header').filter({ has: page.locator('a[href="/"]') }).first();

async function openPage(page, route, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(baseURL + route, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, route);
  await headerFor(page).locator('a[href="/"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function inspect(page, header) {
  return header.evaluate((h) => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const elements = [...h.querySelectorAll('a, button')];
    const controls = elements.map((el) => {
      const rect = box(el);
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        label: el.textContent.trim() || el.getAttribute('aria-label'), href: el.getAttribute('href'),
        current: el.getAttribute('aria-current'), decoration: getComputedStyle(el).textDecorationLine,
        rect, reachable: !!hit && el.contains(hit),
      };
    });
    const overlaps = [];
    for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i].rect, b = controls[j].rect;
      if (Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1)
        overlaps.push([controls[i].label, controls[j].label]);
    }
    const next = h.nextElementSibling;
    const nextRect = next ? box(next) : null;
    return {
      viewport: document.documentElement.clientWidth, header: box(h), controls, overlaps,
      svg: h.querySelector('svg') ? box(h.querySelector('svg')) : null,
      contentOverlap: nextRect && nextRect.height > 0 ? nextRect.y < box(h).bottom - 1 : false,
      documentOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

try {
  for (const completed of completedStates) for (const signedIn of signedInStates) {
    const context = await browser.newContext();
    // This cookie exercises historical client-side menu rendering only. It is
    // not a real authenticated session and is never used for protected actions.
    if (signedIn) await context.addCookies([{ name: 'FirebaseSession', value: 'navigation-ui-fixture', url: baseURL }]);
    await context.addInitScript(({ completed }) => {
      sessionStorage.setItem('splashSeen', 'true');
      localStorage.setItem('clarityCheckCompleted', String(completed));
    }, { completed });
    const page = await context.newPage();
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    const expected = ['/', '/discover', '/about', ...(completed ? ['/program'] : []), '/clarity-check', ...(completed ? ['/starter-pack'] : []), signedIn ? '/dashboard' : '/login'];

    for (const route of routes) {
      await openPage(page, route);
      const header = headerFor(page);
      for (const width of widths) {
        const key = { route, width, completed, signedIn };
        try {
          await page.setViewportSize({ width, height: 900 });
          const toggle = header.getByRole('button', { name: 'Toggle menu' });
          if (width < 1024) {
            await toggle.waitFor();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
            await toggle.click();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
            assert.equal(await header.locator('nav').getAttribute('id'), await toggle.getAttribute('aria-controls'));
          } else {
            await header.locator('a[href="/discover"]').waitFor();
            assert.equal(await toggle.count(), 0);
          }
          const result = await inspect(page, header);
          assert.deepEqual(result.controls.filter(c => c.href).map(c => c.href), expected);
          for (const control of result.controls) {
            assert(control.rect.width > 0 && control.rect.height >= 44, `${control.label}: usable dimensions`);
            assert(control.rect.x >= -1 && control.rect.right <= result.viewport + 1, `${control.label}: horizontal clipping`);
            assert(control.reachable, `${control.label}: covered or offscreen`);
          }
          assert.deepEqual(result.overlaps, []);
          assert.equal(result.contentOverlap, false);
          const active = result.controls.filter(c => c.current === 'page');
          assert.deepEqual(active.map(c => c.href), expected.includes(route) ? [route] : []);
          for (const control of active) assert(control.decoration.includes('underline'));
          if (width < 1024) assert.deepEqual([result.svg.width, result.svg.height], [24, 24]);
          if ((completed && !signedIn) || (route === '/delete-account' && width === 1024))
            await page.screenshot({ path: path.join(output, `${route.slice(1) || 'home'}-${width}-${completed}-${signedIn}.png`) });
          if (width < 1024) {
            await toggle.click();
            assert.equal(await header.locator('nav').count(), 0);
            await toggle.press('Enter');
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
            await header.locator('nav a').first().focus();
            await page.keyboard.press('Escape');
            assert.equal(await header.locator('nav').count(), 0);
            assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
          }
          report.matrix.push({ ...key, status: 'passed', ...result });
        } catch (error) {
          report.failures.push({ ...key, error: error.message });
          await page.screenshot({ path: path.join(output, `failure-${route.slice(1) || 'home'}-${width}-${completed}-${signedIn}.png`) });
          // Recover cleanly so one failed scenario does not invalidate later routes.
          await openPage(page, route, width);
        }
        await save();
      }
      console.log(JSON.stringify({ route, completed, signedIn, passed: report.matrix.length, failures: report.failures.length }));
    }

    if (completed && !signedIn) for (const width of widths) for (const href of expected) {
      await openPage(page, '/delete-account', width);
      const header = headerFor(page);
      if (width < 1024 && href !== '/') await header.getByRole('button', { name: 'Toggle menu' }).click();
      const link = header.locator(`a[href="${href}"]`);
      // Check visibility before click; automatic scrolling must not hide clipping.
      const rect = await link.boundingBox();
      assert(rect.x >= 0 && rect.x + rect.width <= width + 1);
      await link.click();
      await page.waitForURL(baseURL + href, { waitUntil: 'domcontentloaded' });
      report.clicks.push({ width, href, status: 'passed' });
    }
    await context.close();
    await save();
  }
  assert.equal(report.matrix.length, routes.length * widths.length * completedStates.length * signedInStates.length);
  assert.equal(report.clicks.length, completedStates.includes(true) && signedInStates.includes(false) ? 7 * widths.length : 0);
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.failures, []);
  console.log(`PASS: ${report.matrix.length} route/width/state checks, ${report.clicks.length} link clicks, no page exceptions.`);
} finally {
  await save();
  await browser.close();
}
