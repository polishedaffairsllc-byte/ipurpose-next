# Deployment Checklist — iPurpose

This checklist collects the remaining tasks to consider before declaring the site "finished" and deploying to production.

1) Create required Firestore composite index(es)
   - Open the URL in `FIRESTORE_INDEX_INSTRUCTIONS.md` and create the suggested index for project `ipurpose-mvp`.
   - Wait for indexing to complete before heavy runtime testing.

2) Add required secrets to GitHub Actions (see `DEPLOYMENT_SECRETS.md`)
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `RESEND_API_KEY`

3) CI / Tests
   - CI now runs `npm ci`, `npm audit --audit-level=high`, `npm run build`, and Playwright tests.
   - Fix any audit or test failures shown in GitHub Actions logs.

4) Local development hygiene
   - Use Node 20 locally to match `package.json` engines: `nvm install 20 && nvm use 20`.
   - Run `npm install` and `npm run build` locally to reproduce CI issues.
   - Run `npx playwright install --with-deps` and `npx playwright test` to run E2E tests locally.

5) Vulnerability fixes
   - If `npm audit` reports high severity vulnerabilities, run `npm audit fix` and evaluate any remaining issues.
   - For transitive or unavoidable vulnerabilities, consider patching or upgrading the dependent package.

6) Review proxy/middleware migration
   - We added `app/proxy.ts` and preserved the original `middleware.ts` in `middleware.legacy.ts`.
   - Verify behavior of gated routes in a staging environment before removing `middleware.legacy.ts`.

7) Environment and feature verification
   - Populate `.env.local` locally for manual testing (Firebase, OpenAI, Stripe keys).
   - Validate key flows: login, starter-pack entitlement, Stripe checkout, AI pages.

8) Deployment
   - If deploying to Vercel: connect the repo to Vercel and set the same environment variables in Vercel's dashboard.
   - Alternatively, configure a deploy job in CI that uses `VERCEL_TOKEN` (or `FIREBASE_TOKEN`) to deploy automatically.

9) Final smoke tests
   - After deploy, run a small smoke test suite or use Playwright to verify critical paths in production.

If you want, I can:
- Open a PR to enable an automatic deploy step (Vercel/Firebase) that triggers on `main` when secrets exist.
- Attempt to fix any `npm audit` issues automatically in a branch, run tests in CI, and prepare a PR with the fixes.

Reply with the next action you want me to take (deploy PR, fix audits, or run more repository changes) and I will proceed.
