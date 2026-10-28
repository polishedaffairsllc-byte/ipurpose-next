import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL;
test.skip(!baseURL, 'Set BASE_URL to the reviewed Vercel preview.');
const adsId = 'AW-17993147612';
const webId = 'G-FX51XM1DVS';

for (const [route, prefix, recipient, variant] of [
  ['/partnerships/sdsn/ghana-jh', 'sdsn', 'ghana-jh', 'ghana'],
  ['/partnerships/sdsn/africa-lm', 'sdsn', 'africa-lm', 'africa'],
  ['/partnerships/sdsn/global-partnership', 'sdsn', 'global-partnership', 'global'],
  ['/partnerships/ug/careers-counselling', 'ug', 'ug-careers-counselling', 'ug'],
]) {
  test(`${route}: no Google Ads tag/config; existing GA4 collection still works`, async ({ page, context }) => {
    const adsRequests: string[] = [];
    const receipts: Array<Record<string, string>> = [];
    context.on('request', request => {
      if (request.url().includes(adsId)) adsRequests.push(request.url());
    });
    context.on('response', response => {
      const request = response.request();
      const url = new URL(request.url());
      if (!url.hostname.endsWith('google-analytics.com') || url.pathname !== '/g/collect' || response.status() !== 204) return;
      for (const line of request.postData()?.split('\n') ?? ['']) {
        const params = { ...Object.fromEntries(url.searchParams), ...Object.fromEntries(new URLSearchParams(line.trim())) };
        if (params.tid === webId && params.en?.startsWith(`${prefix}_`)) receipts.push(params);
      }
    });
    const response = await page.goto(`${baseURL}${route}?preview=1`, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await page.waitForFunction(() => window.__ipurposeGA4Ready === true);
    await expect(page.locator('.sdsn-current')).toHaveClass(/sdsn-ready/);
    await page.getByRole('button', { name: 'Next slide', exact: true }).click();
    await expect(page.locator('.sdsn-counter strong')).toHaveText('02');
    // Flush the real browser's collection batch on visibility change.
    const blank = await context.newPage();
    await blank.bringToFront();
    await expect.poll(() => receipts.some(p => p.en === `${prefix}_page_view`), { timeout: 25_000 }).toBe(true);
    await expect.poll(() => receipts.some(p => p.en === `${prefix}_slide_view` && p['epn.slide_number'] === '2'), { timeout: 25_000 }).toBe(true);
    await blank.close();
    expect(adsRequests).toEqual([]);
    expect(await page.locator('script#google-ads-config').count()).toBe(0);
    expect(await page.locator(`script[src*="${adsId}"]`).count()).toBe(0);
    const configs = await page.evaluate(() => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'config').map(args => args[1]));
    expect(configs).toContain(webId);
    expect(configs).not.toContain(adsId);
    for (const receipt of receipts) {
      expect(receipt['ep.recipient_id']).toBe(recipient);
      expect(receipt['ep.deck_variant']).toBe(variant);
      expect(receipt.tt || receipt['ep.traffic_type']).toBe('internal');
      expect(receipt['ep.debug_mode']).toBe('true');
    }
    expect(receipts.some(p => p.en === `${prefix}_page_view` && Number(p['epn.visit_number']) >= 1)).toBe(true);
    expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
  });
}

for (const route of ['/', '/program', '/login']) {
  test(`${route}: normal site retains the original Ads tag/config`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => { if (request.url().includes(adsId)) requests.push(request.url()); });
    await page.goto(`${baseURL}${route}?ipurpose_qa=1`, { waitUntil: 'networkidle' });
    await expect.poll(() => requests.some(url => url.includes(`/gtag/js?id=${adsId}`))).toBe(true);
    const configs = await page.evaluate(() => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'config' && args[1] === 'AW-17993147612'));
    expect(configs).toHaveLength(1);
    expect(configs[0][2]).toEqual({ allow_google_signals: true, allow_ad_personalization_signals: true });
  });
}
