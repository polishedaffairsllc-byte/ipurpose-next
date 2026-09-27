# Launch-cost audit validation

Run September 27, 2026 in an isolated worktree from `main` at `6473818`, Node **20.20.2**, using each package's locked dependencies (`npm ci --ignore-scripts`). No lockfile, deployment configuration, production credentials, dashboard settings, or original checkout changes included. All provider boundaries in new tests are mocked; Firebase integration tests use the demo project's local emulators.

| Check / command | Result |
| --- | --- |
| Root `npx tsc --noEmit` | **PASS**, including rerun after edits/build. |
| Root `npm run lint` | **FAIL (exit 2)**: ESLint 9.39.5 config references `react-hooks/exhaustive-deps` for a file set where the `react-hooks` plugin is not registered. Reproduced with unchanged `tests/launch-metrics-feed.test.cjs`; existing configuration issue. Not corrected in this cost-hardening PR. |
| `npx eslint app/api/ai/route.ts app/api/ai/stream/route.ts app/api/gpt/utils/openai-client.ts app/api/gpt/utils/rate-limiter.ts` | **PASS**, 0 errors / 3 pre-existing warnings (unused catch variable, two `any` timestamp casts). Full lint is still failing, not waived by this focused result. |
| `node --import tsx --test tests/onboarding.node.ts tests/account-deletion.node.ts tests/launch-metrics.node.ts tests/launch-metrics-feed.test.cjs tests/launch-cost-risk.test.cjs` | **PASS 38/38** (includes existing root script suites and 6 new hardening cases). |
| `node --conditions=react-server --import tsx --test tests/launch-metrics-mcp.node.ts` | **PASS 10/10**. |
| Mobile `npm run typecheck` | **PASS**. |
| Mobile `npm run lint` | **PASS**. Latest merged main declares no mobile test script; the Playwright timezone tests exercise shared/mobile helpers. |
| Functions `npx tsc --noEmit` | **PASS**. |
| Functions `npm test` | **PASS 7/7**. |
| `firebase emulators:exec --config firebase.metrics-test.json --project demo-ipurpose-metrics --only firestore,auth 'npm --prefix functions run test:emulator'` | **PASS 8/8**, including real concurrent Firestore creates and nurture deduplication. Initial sandbox attempt could not bind localhost; authorized rerun passed. These are existing metrics tests, **not** proof that the deferred GPT limiter is atomic. |
| `CI=true npm run build` (default Turbopack) | **INCOMPLETE**: stalled at optimized build for over five minutes locally; stopped only this audit's build processes. No build/configuration workaround committed. |
| `CI=true NEXT_TELEMETRY_DISABLED=1 npm run build -- --webpack` | **PASS**; existing middleware-deprecation, relative Turbopack-root and dependency Edge-runtime warnings. CI skips Firebase Admin initialization; this proves local compilation, not deployed integrations. |
| `CI=true NEXT_TELEMETRY_DISABLED=1 npx playwright test` | **PASS: 8 passed, 6 skipped** against the local production build. Skips require `FOUNDER_SESSION_COOKIE` / `INSIGHTS_SESSION_COOKIE` and were not exercised with production identities. |
| `node tests/launch-metrics.browser.mjs` | **PASS**, existing real-component fixture verifies rendering, chosen-week action, CSV download, narrow layout, empty state, logout/authorization and errors, with Firebase mocked and external browser requests blocked. |
| `npm audit --omit=dev --audit-level=high` (existing CI gate) | **PASS (exit 0)**; 8 moderate dependency findings, no high/critical findings. Existing Firebase Admin/Google SDK transitive `uuid` advisory chain; no dependency upgrade attempted. |
| `git diff --check` | **PASS**. |

The new six tests cover database-read/init/reset failures, corrupt counters, unchanged quota denials, one OpenAI attempt for 429/500 responses, timeout configuration, no generation for unauthenticated/denied callers, awaited usage recording before persistence (including save failure), and a raw-stream abort deadline. They do not simulate real OpenAI billing or certify distributed quota enforcement.

No load test, paid generation, real signup, outgoing email/payment, provider dashboard mutation, deployment, or merge was performed. Physical-device/provider smoke tests and manual billing-control evidence remain owner requirements before October 1. Standalone scripts that send real email or call paid APIs were not used as test suites.
