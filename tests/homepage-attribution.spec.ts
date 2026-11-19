import { expect, test } from '@playwright/test';

test('homepage first-touch campaign survives navigation to Clarity', async ({ page }) => {
  const campaign = {
    utm_source: 'youtube',
    utm_medium: 'organic_video',
    utm_campaign: 'clarity_check',
    utm_content: 'homepage_test',
    utm_term: null,
  };
  const storedCampaign = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('ipurpose_utm') ?? 'null'));

  await page.addInitScript(() => sessionStorage.setItem('splashSeen', 'true'));
  await page.goto('/?utm_source=youtube&utm_medium=organic_video&utm_campaign=clarity_check&utm_content=homepage_test');
  await expect.poll(storedCampaign).toEqual(campaign);
  await page.goto('/clarity-check');
  await expect.poll(storedCampaign).toEqual(campaign);
  await page.goto('/clarity-check-quiz');
  await expect(page).toHaveURL(/\/clarity-check-quiz(?:\?|$)/);
  await expect.poll(storedCampaign).toEqual(campaign);
  await page.goto('/?utm_source=email&utm_campaign=other');
  await expect.poll(storedCampaign).toEqual(campaign);
});

test('homepage renders when first-touch storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('splashSeen', 'true');
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'ipurpose_utm') throw new DOMException('Storage unavailable', 'SecurityError');
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ipurpose_utm') throw new DOMException('Storage unavailable', 'SecurityError');
      setItem.call(this, key, value);
    };
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?utm_source=youtube');
  await expect(page.getByRole('heading', { name: /Helping people orient themselves/i })).toBeVisible();
  expect(errors).toEqual([]);
});
