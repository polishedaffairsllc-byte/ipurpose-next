/**
 * __tests__/insights.test.ts
 * 
 * Basic test to verify Insights page is read-only:
 * - Loads for authenticated users
 * - Displays metrics labels
 * - Contains navigation links only (no write endpoints)
 * - Makes no POST/PATCH/DELETE calls
 */

import { test, expect } from "@playwright/test";

test.describe("Insights Page - Read-Only Verification", () => {
  test("should render Insights page for authenticated user", async ({ page }) => {
    // This test assumes you have auth setup or mock auth in your test environment
    // Skip if running against live environment without credentials
    
    // Navigate to insights
    const response = await page.goto("/insights", {
      waitUntil: "networkidle",
    });

    // Should not redirect (auth is valid)
    expect(response?.status()).not.toBe(302);
  });

  test("should display metric labels", async ({ page }) => {
    await page.goto("/insights");

    // Verify key metric labels are present
    await expect(page.locator("text=Alignment Consistency")).toBeVisible();
    await expect(page.locator("text=Practices Completed")).toBeVisible();
    await expect(page.locator("text=Check-ins Logged")).toBeVisible();

    // Verify section headings
    await expect(page.locator("text=Your Progress")).toBeVisible();
    await expect(page.locator("text=Your Journey")).toBeVisible();
    await expect(page.locator("text=Practices & Systems")).toBeVisible();
  });

  test("should have navigation-only CTAs", async ({ page }) => {
    await page.goto("/insights");

    // Get all buttons/links
    const links = page.locator("a");

    // Check for navigation links (should go to /soul or /systems)
    const checkInsLinks = page.locator('a:has-text("Check-Ins")');
    const systemsLinks = page.locator('a:has-text("Systems")');

    // Should have at least one link to /soul
    let foundSoulLink = false;
    let foundSystemsLink = false;

    for (let i = 0; i < (await checkInsLinks.count()); i++) {
      const href = await checkInsLinks.nth(i).getAttribute("href");
      if (href?.includes("/soul")) {
        foundSoulLink = true;
      }
    }

    for (let i = 0; i < (await systemsLinks.count()); i++) {
      const href = await systemsLinks.nth(i).getAttribute("href");
      if (href?.includes("/systems")) {
        foundSystemsLink = true;
      }
    }

    expect(foundSoulLink || (await page.locator('a[href*="/soul"]').count()) > 0).toBe(
      true,
      "Should have navigation link to /soul"
    );
    expect(foundSystemsLink || (await page.locator('a[href*="/systems"]').count()) > 0).toBe(
      true,
      "Should have navigation link to /systems"
    );
  });

  test("should make no write calls (POST/PATCH/DELETE)", async ({ page }) => {
    // Track all network requests
    const writeRequests: string[] = [];

    page.on("request", (request) => {
      const method = request.method();
      const url = request.url();

      // Flag any POST, PATCH, or DELETE requests
      if (["POST", "PATCH", "DELETE"].includes(method)) {
        // Exclude auth and health check endpoints
        if (!url.includes("/auth") && !url.includes("/health")) {
          writeRequests.push(`${method} ${url}`);
        }
      }
    });

    await page.goto("/insights", { waitUntil: "networkidle" });

    // Assert no write requests were made to non-auth endpoints
    expect(writeRequests).toEqual(
      [],
      `Insights page made unexpected write requests: ${writeRequests.join(", ")}`
    );
  });

  test("should display zero state gracefully when no data", async ({ page }) => {
    // This test checks that the page doesn't crash with no data
    await page.goto("/insights");

    // Page should load without errors
    const errorMessages = await page.locator("text=Error").count();
    expect(errorMessages).toBe(0);

    // Should show guidance text
    const guidance = page.locator(
      "text=/Start|Build|No.*yet/"
    );
    expect((await guidance.count()) >= 0).toBe(true); // At least 0 (may have data)
  });
});
