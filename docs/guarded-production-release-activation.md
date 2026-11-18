# Guarded production release activation checklist

Status: **NOT ENABLED for autonomous deployment.** This PR only introduces a manual release workflow and must not be merged before the repository administrator verifies controls.

## Evidence (2026-11-18)
- Level 2 draft pilot PR #122 passed all five required checks; it was not merged or deployed.
- Vercel project: `ipurpose-next` (`prj_dZRAfBhuw8HbTm4PiC5xnPHojz9M`), team `team_DxF0PzBzqRY4ya3khEQIC91h`.
- Vercel production deployment history and rollback candidates exist.
- GitHub rulesets API returned no visible rulesets; branch protection inspection returned HTTP 403 (integration lacks access).
- Existing `ci.yml` includes a `main` deploy job with `amondnet/vercel-action@v20`; determine whether this and Vercel Git integration cause duplicate deployment attempts.

## Required administrator verification before merge
1. Require all CI checks on `main` and a non-bypassable human review for sensitive changes; prohibit force pushes.
2. Create/configure the GitHub Actions `production` environment with required human reviewers and restrict deployment branches to `main`. Merely naming an environment in YAML does **not** configure protection.
3. Confirm `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are scoped appropriately and not exposed to untrusted PRs.
4. Confirm whether Vercel Git integration already deploys `main` to production. Consolidate duplicate release paths.
5. Ensure required check results belong to the exact approved commit SHA. The scaffold workflow currently checks only main HEAD identity, not check-run conclusions.
6. Test a release in a safe preview environment, smoke-check production after a separately approved release, and rehearse rollback.
7. Define an explicit low-risk change allowlist. Require human release authorization for identity/auth, privacy/consent, payments, user data, infrastructure, secrets, and database migrations.

## Workflow behavior
`guarded-production-release.yml` is **manual only** (`workflow_dispatch`), requires an exact 40-character main HEAD SHA, and references a GitHub `production` environment. It cannot itself establish reviewer protections. It uses explicit Vercel `--prod` flags. Do not run it before checks and environment configuration are verified.

## Future autonomous release
After the above gates are demonstrably enforced, replace manual dispatch with a narrowly scoped post-merge, required-check-verified release mechanism and automated health/rollback checks. Do not use a broad `push` trigger as a substitute for release authorization.
