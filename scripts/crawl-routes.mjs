#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { request } from "undici";
import pLimit from "p-limit";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const INVENTORY_PATH = process.env.INVENTORY_PATH || path.join(__dirname, "..", "SYSTEM_INVENTORY.md");
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
const SESSION_COOKIE = process.env.SESSION_COOKIE || "";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 10000);

// LOCKED DECISIONS (from SYSTEM_INVENTORY.md correction commit)
const EXPECTED_REDIRECTS = [
  { from: "/clarity-check-numeric", to: "/clarity-check", reason: "Decision #1: Canonical clarity check" },
  { from: "/ai", to: "/ai-tools", reason: "Decision #6: AI tools canonical hub" },
  { from: "/api/gpt", to: "/api/ai", reason: "Decision #4: AI API namespace canonical" },
  { from: "/api/gpt/stream", to: "/api/ai/stream", reason: "Decision #4: AI API namespace canonical" },
];

// Routes/APIs marked for removal (Decision #3, #6)
const APPROVED_FOR_REMOVAL = ["/legacy", "/development", "/ipurpose-6-week", "/test"];

// Core public/auth classifications (from locked decisions)
const PUBLIC_ROUTES = [
  "/",
  "/discover",
  "/about",
  "/program",
  "/orientation",
  "/ethics",
  "/clarity-check",
  "/clarity-check-numeric", // redirects to /clarity-check
  "/signup",
  "/login",
  "/starter-pack",
  "/ai-blueprint",
  "/info-session",
  "/contact",
  "/privacy",
  "/terms",
  "/google-review",
];

const AUTH_REQUIRED_ROUTES = [
  "/dashboard",
  "/labs",
  "/integration",
  "/community",
  "/profile",
  "/settings",
  "/onboarding",
  "/enrollment-required",
  "/soul",
  "/ai-tools",
  "/systems",
  "/insights",
  "/creation",
  "/interpretation",
  "/learning-path",
];

const INTERNAL_ROUTES = []; // No explicit internal routes in crawl (security by obscurity)

if (!BASE_URL) {
  console.error("Missing BASE_URL. Example: BASE_URL=https://<preview>.vercel.app npm run crawl");
  process.exit(1);
}

function readInventory(filePath) {
  try {
    const full = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(full)) throw new Error(`Inventory not found at ${full}`);
    return fs.readFileSync(full, "utf8");
  } catch (e) {
    console.warn(`⚠️  Could not read inventory: ${e.message}. Proceeding with fallback classifications.`);
    return "";
  }
}

function extractRoutesAndApis(md) {
  // Extract Route: `/...` format
  const routeRegex = /Route:\s*`(\/[^`\s]+)`/g;
  // Extract API: `/api/...` format
  const apiRegex = /API:\s*`(\/api\/[^`\s]+)`/g;
  // Also catch explicit API bullet formats like: - **POST /api/...**
  const apiBullet = /\*\*([A-Z]+)\s+(\/api\/[^\s*]+)\*\*/g;

  const routes = new Set();
  const apis = new Set();

  let m;
  while ((m = routeRegex.exec(md))) routes.add(m[1]);
  while ((m = apiRegex.exec(md))) apis.add(m[1]);
  while ((m = apiBullet.exec(md))) apis.add(m[2]);

  return { routes: [...routes].sort(), apis: [...apis].sort() };
}

function classifyRoute(route) {
  const isPublic = PUBLIC_ROUTES.some(prefix => route === prefix || route.startsWith(prefix + "/"));
  const isAuth = AUTH_REQUIRED_ROUTES.some(prefix => route === prefix || route.startsWith(prefix + "/"));
  const isInternal = INTERNAL_ROUTES.some(prefix => route === prefix || route.startsWith(prefix + "/"));
  const isLegacy = APPROVED_FOR_REMOVAL.some(prefix => route === prefix || route.startsWith(prefix + "/"));

  return { isPublic, isAuth, isInternal, isLegacy };
}

async function fetchUrl(url, opts = {}) {
  const headers = { ...opts.headers };
  if (SESSION_COOKIE && opts.useAuthCookie) {
    headers["cookie"] = SESSION_COOKIE;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await request(url, {
      method: opts.method || "GET",
      headers,
      maxRedirections: 0,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const location = res.headers.location || "";
    const status = res.statusCode;

    let body = "";
    try {
      const chunks = [];
      for await (const chunk of res.body) {
        chunks.push(chunk);
        if (Buffer.concat(chunks).length > 2000) break; // limit body capture
      }
      body = Buffer.concat(chunks).toString("utf-8").slice(0, 1500);
      if (Buffer.concat(chunks).length > 2000) body += "\n…(truncated)";
    } catch {}

    return { status, location, body, error: null };
  } catch (err) {
    return { status: 0, location: "", body: "", error: err.message };
  }
}

function normalizeLocation(loc) {
  if (!loc) return "";
  try {
    const u = new URL(loc, BASE_URL);
    return u.pathname;
  } catch {
    return loc;
  }
}

function expectedRedirectFor(route) {
  const match = EXPECTED_REDIRECTS.find(r => r.from === route);
  return match ? { to: match.to, reason: match.reason } : null;
}

async function checkRoute(route, mode) {
  // mode: "unauth" | "auth"
  const url = new URL(route, BASE_URL).toString();
  const useAuthCookie = mode === "auth";

  const { status, location, body, error } = await fetchUrl(url, { useAuthCookie });
  const locPath = normalizeLocation(location);

  const { isPublic, isAuth, isInternal, isLegacy } = classifyRoute(route);
  const expected = expectedRedirectFor(route);

  let ok = true;
  let expectation = "";
  let reason = "";

  if (error) {
    ok = false;
    expectation = `connection (got: ${error})`;
    reason = "Connection error";
  } else if (expected) {
    expectation = `301/302/307/308 → ${expected.to}`;
    ok = [301, 302, 307, 308].includes(status) && locPath === expected.to;
    reason = expected.reason;
  } else if (mode === "unauth") {
    if (isPublic) {
      expectation = "200 (public)";
      ok = status === 200;
      reason = "Public route should be accessible without auth";
    } else if (isAuth) {
      expectation = "redirect to /login (auth-required)";
      ok = [301, 302, 307, 308].includes(status) && locPath.startsWith("/login");
      reason = "Auth-required route should redirect to /login when unauthenticated";
    } else if (isInternal) {
      expectation = "401/403 or redirect (internal-only)";
      ok = [401, 403].includes(status) || ([301, 302, 307, 308].includes(status) && locPath.startsWith("/login"));
      reason = "Internal-only route should not be publicly accessible";
    } else if (isLegacy) {
      expectation = "404 or redirect (legacy)";
      ok = status === 404 || [301, 302, 307, 308].includes(status);
      reason = "Legacy route approved for removal";
    } else {
      expectation = "not 5xx (unclassified)";
      ok = status < 500 && status !== 0;
      reason = "Route classification missing; checking for server errors";
    }
  } else {
    // auth mode
    if (isPublic) {
      expectation = "200 (public)";
      ok = status === 200;
      reason = "Public route should be accessible";
    } else if (isAuth) {
      expectation = "200 (auth available)";
      ok = status === 200;
      reason = "Auth-required route should be accessible with valid session";
    } else if (isInternal) {
      expectation = "401/403 or redirect (internal-only)";
      ok = [401, 403].includes(status) || [301, 302, 307, 308].includes(status);
      reason = "Internal-only route should not be accessible (even with auth)";
    } else if (isLegacy) {
      expectation = "404 or redirect (legacy)";
      ok = status === 404 || [301, 302, 307, 308].includes(status);
      reason = "Legacy route approved for removal";
    } else {
      expectation = "not 5xx (unclassified)";
      ok = status < 500 && status !== 0;
      reason = "Route classification missing";
    }
  }

  return {
    type: "route",
    route,
    mode,
    url,
    status,
    location: locPath || "(no redirect)",
    ok,
    expectation,
    reason,
    snippet: ok ? "" : body,
  };
}

async function checkApi(apiPath) {
  const url = new URL(apiPath, BASE_URL).toString();

  const { status, location, body, error } = await fetchUrl(url, { useAuthCookie: false, method: "GET" });
  const locPath = normalizeLocation(location);

  let ok = true;
  let expectation = "";
  let reason = "";

  if (error) {
    ok = false;
    expectation = `connection (got: ${error})`;
    reason = "Connection error";
  } else {
    // APIs often return 405 on GET if POST-only; that's fine.
    // 404 is also acceptable (not yet implemented).
    ok = status < 500 && status !== 0;
    expectation = "not 5xx (405/404 ok)";
    reason = "API should not return 5xx errors";
  }

  return {
    type: "api",
    route: apiPath,
    mode: "unauth",
    url,
    status,
    location: locPath || "(no redirect)",
    ok,
    expectation,
    reason,
    snippet: ok ? "" : body,
  };
}

async function main() {
  console.log("🔍 iPurpose Route & API Crawler\n");
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`Inventory: ${INVENTORY_PATH}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Auth mode: ${SESSION_COOKIE ? "✅ enabled (SESSION_COOKIE provided)" : "❌ disabled"}\n`);

  const md = readInventory(INVENTORY_PATH);
  const { routes, apis } = extractRoutesAndApis(md);

  console.log(`📋 Found ${routes.length} routes and ${apis.length} APIs in inventory\n`);

  if (routes.length === 0 && apis.length === 0) {
    console.warn(
      "⚠️  No routes/APIs extracted from inventory. Using default classifications.\n"
    );
  }

  const allRoutes = [...new Set([...routes, ...PUBLIC_ROUTES, ...AUTH_REQUIRED_ROUTES, ...INTERNAL_ROUTES, ...APPROVED_FOR_REMOVAL])];
  const allApis = [...new Set([...apis])];

  const limit = pLimit(CONCURRENCY);
  const results = [];

  console.log(`🚀 Starting crawl (${allRoutes.length} routes + ${allApis.length} APIs)...\n`);

  // Unauth pass
  process.stdout.write("📍 Unauthenticated pass: ");
  const unAuthPromises = allRoutes.map(r =>
    limit(async () => {
      const res = await checkRoute(r, "unauth");
      process.stdout.write(res.ok ? "." : "F");
      return res;
    })
  );
  await Promise.all(unAuthPromises);
  console.log(" done");

  // Auth pass (if cookie provided)
  if (SESSION_COOKIE) {
    process.stdout.write("🔐 Authenticated pass: ");
    const authPromises = allRoutes.map(r =>
      limit(async () => {
        const res = await checkRoute(r, "auth");
        process.stdout.write(res.ok ? "." : "F");
        return res;
      })
    );
    await Promise.all(authPromises);
    console.log(" done");
  }

  // API pass
  process.stdout.write("🔌 API pass: ");
  const apiPromises = allApis.map(a =>
    limit(async () => {
      const res = await checkApi(a);
      process.stdout.write(res.ok ? "." : "F");
      return res;
    })
  );
  await Promise.all(apiPromises);
  console.log(" done\n");

  // Collect results
  const allResults = [
    ...unAuthPromises.map(p => p),
    ...(SESSION_COOKIE ? authPromises.map(p => p) : []),
    ...apiPromises.map(p => p),
  ];

  for (const p of allResults) {
    try {
      results.push(await p);
    } catch {}
  }

  const failures = results.filter(r => !r.ok);
  const successes = results.filter(r => r.ok);

  const report = {
    baseUrl: BASE_URL,
    inventoryPath: INVENTORY_PATH,
    timestamp: new Date().toISOString(),
    sessionCookie: SESSION_COOKIE ? "provided" : "none",
    counts: {
      total: results.length,
      successes: successes.length,
      failures: failures.length,
      routes: allRoutes.length,
      apis: allApis.length,
    },
    summary: {
      successRate: `${((successes.length / results.length) * 100).toFixed(1)}%`,
      publicRoutesChecked: allRoutes.filter(r => PUBLIC_ROUTES.some(p => r === p || r.startsWith(p + "/"))).length,
      authRoutesChecked: allRoutes.filter(r => AUTH_REQUIRED_ROUTES.some(p => r === p || r.startsWith(p + "/"))).length,
      legacyRoutesChecked: allRoutes.filter(r => APPROVED_FOR_REMOVAL.some(p => r === p || r.startsWith(p + "/"))).length,
    },
    failures: failures.map(f => ({
      type: f.type,
      route: f.route,
      mode: f.mode,
      status: f.status,
      expected: f.expectation,
      reason: f.reason,
      location: f.location,
      url: f.url,
    })),
    lockedDecisions: {
      "Decision #1": "Clarity Check: /clarity-check canonical, /clarity-check-numeric → 301",
      "Decision #4": "AI API: /api/ai/* canonical, /api/gpt/* → redirect (30-day sunset)",
      "Decision #6": "AI Routes: /ai-tools canonical, /ai → 301",
      legacyApprovedForRemoval: APPROVED_FOR_REMOVAL,
    },
  };

  // Save JSON report
  fs.writeFileSync("crawl-report.json", JSON.stringify(report, null, 2));
  console.log("📊 Report saved to crawl-report.json\n");

  // Pretty console summary
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║          🎯 ROUTE & API CRAWL SUMMARY                    ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log(`✅ Successes: ${successes.length}/${results.length} (${report.summary.successRate})`);
  console.log(`❌ Failures:  ${failures.length}/${results.length}\n`);

  console.log("📈 By Category:");
  console.log(`   • Public Routes:  ${allRoutes.filter(r => PUBLIC_ROUTES.some(p => r === p || r.startsWith(p + "/"))).length}`);
  console.log(`   • Auth Routes:    ${allRoutes.filter(r => AUTH_REQUIRED_ROUTES.some(p => r === p || r.startsWith(p + "/"))).length}`);
  console.log(`   • Legacy Routes:  ${allRoutes.filter(r => APPROVED_FOR_REMOVAL.some(p => r === p || r.startsWith(p + "/"))).length}`);
  console.log(`   • APIs:           ${allApis.length}\n`);

  if (failures.length > 0) {
    console.log("🔴 FAILURES DETECTED:\n");
    const grouped = {};
    failures.forEach(f => {
      const key = `${f.type}:${f.route}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(f);
    });

    Object.entries(grouped).slice(0, 20).forEach(([key, items]) => {
      console.log(`  ${key}`);
      items.forEach(f => {
        console.log(`    [${f.mode}] ${f.status} | Expected: ${f.expectation}`);
        console.log(`    Reason: ${f.reason}`);
        if (f.location !== "(no redirect)") console.log(`    Location: ${f.location}`);
      });
    });

    if (failures.length > 20) {
      console.log(`\n  ... and ${failures.length - 20} more failures (see crawl-report.json for full list)\n`);
    }

    process.exitCode = 1;
  } else {
    console.log("✅ ALL GREEN — All routes and APIs pass checks! 🚀\n");
    process.exitCode = 0;
  }
}

main().catch(err => {
  console.error("💥 Crawl error:", err);
  process.exit(1);
});
