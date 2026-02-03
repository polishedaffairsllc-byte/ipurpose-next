import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const FOUNDER_SESSION_COOKIE = process.env.FOUNDER_SESSION_COOKIE;
const FOUNDER_DEV_COOKIE = process.env.FOUNDER_SESSION_DEV_COOKIE;
const FOUNDER_VISIBLE_COOKIE = process.env.FOUNDER_VISIBLE_COOKIE ?? "true";

test.describe("Founder gating", () => {
  test.skip(!FOUNDER_SESSION_COOKIE, "FOUNDER_SESSION_COOKIE env var required for founder regression test");

  test.beforeEach(async ({ page }) => {
    const target = new URL(BASE_URL);
    const cookies = [
      {
        name: "FirebaseSession",
        value: FOUNDER_SESSION_COOKIE!,
        domain: target.hostname,
        path: "/",
        httpOnly: true,
        secure: target.protocol === "https:",
        sameSite: "Lax" as const,
      },
    ];

    if (FOUNDER_DEV_COOKIE) {
      cookies.push({
        name: "FirebaseSessionDev",
        value: FOUNDER_DEV_COOKIE,
        domain: target.hostname,
        path: "/",
        httpOnly: false,
        secure: target.protocol === "https:",
        sameSite: "Lax" as const,
      });
    }

    if (FOUNDER_VISIBLE_COOKIE && FOUNDER_VISIBLE_COOKIE !== "false") {
      cookies.push({
        name: "x-founder",
        value: FOUNDER_VISIBLE_COOKIE,
        domain: target.hostname,
        path: "/",
        httpOnly: false,
        secure: target.protocol === "https:",
        sameSite: "Lax" as const,
      });
    }

    await page.context().addCookies(cookies);
  });

  test("founder visiting gated route never sees enrollment gate", async ({ page }) => {
    await page.goto(`${BASE_URL}/soul`, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/enrollment-required/);
    await expect(page.getByText("Upgrade to Continue", { exact: false })).toHaveCount(0);
  });
});
