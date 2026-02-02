const { chromium } = require("playwright");

const DEFAULT_URL = "http://localhost:3000/systems/calendar";
const TARGET_URL = process.env.CALENDAR_TEST_URL || DEFAULT_URL;
const DEBUG_BOX_SELECTOR = process.env.CALENDAR_DEBUG_BOX_SELECTOR || "div.bg-yellow-100";
const MOUNT_MARKER_SELECTOR = process.env.CALENDAR_MOUNT_MARKER_SELECTOR || "div.bg-blue-100";
const FIREBASE_SESSION = process.env.CALENDAR_SESSION_COOKIE;
const FOUNDER_COOKIE = process.env.CALENDAR_FOUNDER_COOKIE ?? "true";
const FORCED_TIER_HEADER = process.env.CALENDAR_FORCE_TIER_HEADER;
const FORCE_FOUNDER_HEADER = process.env.CALENDAR_FORCE_FOUNDER_HEADER === "true";

async function primeSessionCookies(page) {
  if (!FIREBASE_SESSION) return;
  const target = new URL(TARGET_URL);
  const cookies = [
    {
      name: "FirebaseSession",
      value: FIREBASE_SESSION,
      domain: target.hostname,
      path: "/",
      httpOnly: true,
      secure: target.protocol === "https:",
      sameSite: "Lax",
    },
  ];

  if (FOUNDER_COOKIE && FOUNDER_COOKIE !== "false") {
    cookies.push({
      name: "x-founder",
      value: FOUNDER_COOKIE,
      domain: target.hostname,
      path: "/",
      httpOnly: false,
      secure: target.protocol === "https:",
      sameSite: "Lax",
    });
  }

  if (process.env.CALENDAR_SESSION_DEV_COOKIE) {
    cookies.push({
      name: "FirebaseSessionDev",
      value: process.env.CALENDAR_SESSION_DEV_COOKIE,
      domain: target.hostname,
      path: "/",
      httpOnly: false,
      secure: target.protocol === "https:",
      sameSite: "Lax",
    });
  }

  await page.context().addCookies(cookies);
  console.log("Injected preview session cookies for auth bypass.");
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const consoleLogs = [];

    if (FORCED_TIER_HEADER || FORCE_FOUNDER_HEADER) {
      await page.route("**/*", (route) => {
        const headers = { ...route.request().headers() };
        if (FORCED_TIER_HEADER) headers["x-user-tier"] = FORCED_TIER_HEADER;
        if (FORCE_FOUNDER_HEADER) headers["x-founder"] = "true";
        route.continue({ headers });
      });
      console.log("Applied forced entitlement headers for preview bypass.");
    }

    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    console.log(`Target URL: ${TARGET_URL}`);
    await primeSessionCookies(page);
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });

    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      console.log("REMOTE QA BLOCKED — received /login redirect before Calendar page rendered. Unable to capture step evidence without credentials.");
      return;
    }

    await page.waitForSelector('[data-calendar-step="1"]', { timeout: 30000 });

    const stepSnapshots = [];

    async function snapshot(stepLabel) {
      const debugBox = await readTextOrFallback(page.locator(DEBUG_BOX_SELECTOR).first(), "[debug overlay disabled]");
      const mountMarker = await readTextOrFallback(page.locator(MOUNT_MARKER_SELECTOR).first(), "[mount marker hidden]");
      const step1Visible = (await page.locator('[data-calendar-step="1"]').count()) > 0;
      stepSnapshots.push({
        stepLabel,
        debugBox,
        mountMarker,
        step1Visible,
      });
    }

    async function clickStep(label) {
      const button = page.locator(`[data-step-nav="${label}"]`).first();
      await button.click();
      await page.waitForTimeout(600);
    }

    await snapshot("Initial (Step 1)");
    await clickStep(1);
    await snapshot("After clicking Step 1");
    await page.getByLabel("I added at least one of these blocks to my calendar").check();
    await page.waitForTimeout(400);

    await clickStep(2);
    await page.waitForSelector('[data-calendar-step="2"]', { timeout: 5000 });
    await snapshot("After clicking Step 2");

    const step2Styles = await page.$eval('[data-calendar-step="2"]', (el) => {
      const cs = window.getComputedStyle(el);
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        height: cs.height,
        overflow: cs.overflow,
        position: cs.position,
        zIndex: cs.zIndex,
      };
    });

    const step2UI = await page.$eval('[data-calendar-step="2"]', (el) => {
      const selectOptions = Array.from(el.querySelectorAll("select option"))
        .map((opt) => opt.textContent?.trim())
        .filter(Boolean);
      const numericInputs = Array.from(el.querySelectorAll('input[type="number"]')).length;
      const allowedDayButtons = Array.from(el.querySelectorAll("button"))
        .map((btn) => btn.textContent?.trim())
        .filter((text) => text && ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(text));
      const copyButtons = Array.from(el.querySelectorAll("button"))
        .map((btn) => btn.textContent?.trim())
        .filter((text) => text?.toLowerCase().includes("copy"));
      const requiredCheckboxLabel = el.querySelector('label input[type="checkbox"]')?.parentElement?.textContent?.trim();
      return {
        selectOptions,
        numericInputs,
        allowedDayButtons,
        copyButtons,
        requiredCheckboxLabel,
      };
    });

    await page.getByLabel("I applied at least one booking rule").check();
    await page.waitForTimeout(400);

    await clickStep(3);
    await page.waitForSelector('[data-calendar-step="3"]', { timeout: 5000 });
    await snapshot("After clicking Step 3");
    await page.getByLabel(/Create recurring/).check();
    await page.getByLabel(/Set status to Busy/).check();
    await page.waitForTimeout(400);

    await clickStep(4);
    await page.waitForSelector('[data-calendar-step="4"]', { timeout: 5000 });
    await snapshot("After clicking Step 4");

    console.log("\n=== Console Transcript ===");
    consoleLogs.forEach((line, idx) => {
      console.log(`${idx + 1}. ${line}`);
    });

    console.log("\n=== Step Snapshots ===");
    stepSnapshots.forEach((snap, idx) => {
      console.log(`Step ${idx + 1} (${snap.stepLabel})`);
      console.log(`  Debug Box: ${snap.debugBox}`);
      console.log(`  Mount Marker: ${snap.mountMarker}`);
      console.log(`  Step 1 Content Present: ${snap.step1Visible}`);
    });

    console.log("\n=== Step 2 Computed Styles ===");
    Object.entries(step2Styles).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log("\n=== Step 2 UI Elements Observed ===");
    console.log(`  Audience options: ${step2UI.selectOptions.join(", ")}`);
    console.log(`  Numeric inputs: ${step2UI.numericInputs}`);
    console.log(`  Allowed day buttons: ${step2UI.allowedDayButtons.join(", ")}`);
    console.log(`  Copy buttons: ${step2UI.copyButtons.join(", ")}`);
    console.log(`  Required checkbox label: ${step2UI.requiredCheckboxLabel}`);
  } catch (error) {
    console.error("❌ Test Error:", error.message);
    console.error(error.stack);
  } finally {
    if (browser) await browser.close();
  }
}

async function readTextOrFallback(locator, fallback) {
  if ((await locator.count()) === 0) return fallback;
  return (await locator.textContent())?.trim() || fallback;
}

main();
