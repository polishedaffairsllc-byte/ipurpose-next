# Single-path production release controls

**Status: branch protection verified; unattended release remains disabled pending enforcement tests and trusted controller integration.**

## Architecture
Codex branch → pull request → GitHub required checks + independently trusted risk-based authorization → protected `main` → **existing Vercel Git integration** → production domain. There must be no competing GitHub Actions production deployment job.

Vercel project `ipurpose-next` is linked to GitHub `polishedaffairsllc-byte/ipurpose-next`. GitHub ruleset #27598298 is active and `main` reports `protected: true`. Vercel's Git-based production deployment is from `main` and carries the public-domain aliases; a separate CLI production-targeted deployment carries none. Vercel's project production-branch setting has not been independently exposed by the connected project response.

## Changes prepared in PR #124
- Removed the newly introduced duplicate manual Vercel deployment workflow.
- Added a scheduled read-only homepage availability monitor; GitHub Actions failures should be surfaced by the existing alert process.
- The PR branch removes the optional-token `Deploy to Vercel` job from `.github/workflows/ci.yml`, eliminating that competing deployment path **if and when this PR is merged**. Do not merge until Vercel Git production branch `main` is independently verified.

## Remaining release-activation acceptance tests
1. Run a safe, non-admin negative test proving a direct push to `main` is rejected; do not force-push or disrupt production.\n2. Verify Vercel project Git production branch configuration and audit all CLI production deployment/promotion credentials.\n3. Confirm preview deployment and production protection settings, perform non-public smoke and rollback rehearsal.\n4. Implement trusted release controller on protected code, bound to exact PR head SHA, required checks, independently verified risk and an emergency-stop control.\n5. Prove failed-check, stale-SHA, unknown-change, kill-switch and credential-bypass cases are blocked.\n6. Confirm logs, alerts and operational rollback ownership; activate only after all gates pass.

## Bounded autonomy
Codex may autonomously create branches, implement changes, run tests, and open PRs. Sensitive changes (auth, consent/privacy, payments, user data, database migrations, secrets, infrastructure) require stronger independent authorization or founder approval. Founder authorized self-approval for routine changes only after trusted release gates are verified. A merge is a production release event, not an unrestricted bot operation.

## Operational response
The monitor runs twice hourly and checks only HTTP availability, not business transactions. A failed check requires diagnosis and, if caused by a recent deployment, an authorized Vercel rollback. This monitor does not automatically roll back or guarantee functional correctness.

## Level 2A verification status\n- Confirmed: protected `main` with strict five-check ruleset, no bypass actors; Vercel Git-sourced public production deployment from `main`.\n- Confirmed: draft PR #124 removes competing CI deployment job on its branch; it remains on `main` until this PR merges.\n- Not confirmed: non-admin negative test, complete CLI/promotion authority, safe rollback rehearsal, trusted release controller and live kill switch.\n- Release automation remains **disabled**.\n\n## Verification update — November 18, 2026 (after ruleset activation)
- GitHub ruleset #27598298 (`iPurpose Production Protection`) exists, is active, and targets `~DEFAULT_BRANCH` (currently `main`). The branch API reports `protected: true`.
- The ruleset requires PRs, strict up-to-date status checks from GitHub Actions for the five named CI checks, blocks non-fast-forward pushes and deletions, has no bypass actors, and requires zero approving reviews.
- All five required CI checks passed on the latest commit of this draft PR (`b875ccf4abf90e48898e32d011b80790d481f72d`).
- Vercel's linked project has a READY production deployment from `main` SHA `1f92b56ed560ab62557515e92ea550c5c6701992`; rollback candidates exist. A later READY production deployment has no Git metadata, so **single-path production release is not yet demonstrated**. Investigate manual/CLI production deployments and project Git production-branch settings before activation.
- **Remaining hard gates:** verify GitHub ruleset enforcement by non-admin negative test; confirm production branch and no competing production deployment mechanisms; exercise safe preview and rollback; implement independently enforced, fail-closed low-risk auto-merge gate; audit logging, kill switch and notifications.
- Zero required reviews is not a substitute for the independent risk gate. **No unattended merge or deployment authorization is active.**

## Vercel deployment-source investigation — November 18, 2026
- Deployment `dpl_Ftrgzo89jRjjjQBNdjjsQaDjjdAT` is `source: cli`, `target: production`, `READY`, and has **no aliases**. This is an alternate path to create a production-targeted build, even though it did not take over the public domains.
- Deployment `dpl_HtEjqmes5KYoRRxKzS3DpohfekGS` is `source: git`, `target: production`, `READY`, with GitHub `main` SHA `1f92b56ed560ab62557515e92ea550c5c6701992` and the production-domain aliases.
- Conclusion: the Git release path serves public domains in the examined records, but CLI production builds are possible. GitHub rulesets do **not** control Vercel CLI credentials. Inventory and revoke/limit any unused `VERCEL_TOKEN` and Vercel project deployment credentials outside the approved release workflow; verify project permissions before allowing unattended production promotion. Do not revoke tokens blindly: inventory dependencies first.
- A live rollback was **not** performed; candidate availability is not a rollback rehearsal.
