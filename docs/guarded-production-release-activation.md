# Single-path production release controls

**Status: pending repository administrator configuration.** This document is the source of truth for activation.

## Architecture
Codex branch → pull request → GitHub required checks and human approval → protected `main` → **existing Vercel Git integration** → production domain. There must be no competing GitHub Actions production deployment job.

Vercel project `ipurpose-next` is linked to GitHub `polishedaffairsllc-byte/ipurpose-next`. Vercel production history contains successful `main` releases and rollback candidates. GitHub branch metadata returned `protected: false` on 2026-11-18; rulesets list was empty. Rechecked during Level 2A implementation: still `protected: false`, and no rulesets. This is a **hard activation blocker**; do not enable unattended merges or deployments. Vercel's connected project was verified, but Git production-branch configuration has not been independently confirmed.

## Changes prepared in PR #124
- Removed the newly introduced duplicate manual Vercel deployment workflow.
- Added a scheduled read-only homepage availability monitor; GitHub Actions failures should be surfaced by the existing alert process.
- The PR branch removes the optional-token `Deploy to Vercel` job from `.github/workflows/ci.yml`, eliminating that competing deployment path **if and when this PR is merged**. Do not merge until Vercel Git production branch `main` is independently verified.

## Repository administrator action required
1. Open `https://github.com/polishedaffairsllc-byte/ipurpose-next/settings/branches` (or repository Rules → Rulesets).
2. Protect `main`: require PRs, at least one human approval, dismiss stale approvals, require up-to-date branches and these exact passing checks:
   - `Verify Secrets & Repository Safety`
   - `Firestore alignment regression tests`
   - `Install, Lint, Type Check, Build & Test`
   - `Verify Repository & Type Safety`
   - `Tests, types, lint and unsigned mobile exports`
3. Prevent force pushes and deletion; limit bypasses and direct pushes.
4. Confirm the protection is enforced with a non-admin test and that the repository plan supports the configured protections.
5. Verify Vercel's production branch is `main`, with Git integration enabled and preview deployments on PRs.
6. Confirm Vercel's deployment protection and fork authorization settings; test a safe preview and rehearse rollback.
7. Merge this PR only after CI passes, review is complete, and release controls are enforced.

## Bounded autonomy
Codex may autonomously create branches, implement changes, run tests, and open PRs. Sensitive changes (auth, consent/privacy, payments, user data, database migrations, secrets, infrastructure) require human review. A merge is a production release event, not an unrestricted bot operation.

## Operational response
The monitor runs twice hourly and checks only HTTP availability, not business transactions. A failed check requires diagnosis and, if caused by a recent deployment, an authorized Vercel rollback. This monitor does not automatically roll back or guarantee functional correctness.

## Level 2A verification status
- Confirmed: Vercel team project is GitHub-linked to this repository; latest deployment record reports READY and production target.
- Confirmed: this PR removes the duplicate CI deployment job on its branch, but main still contains it until merge.
- Not confirmed: enforced protected main, required-check rules, Vercel Git production branch, negative authorization tests, rollback rehearsal.
- Release automation remains **disabled**. A successful CI run does not override the blockers above.


## Verification update — November 18, 2026 (after ruleset activation)
- GitHub ruleset #27598298 (`iPurpose Production Protection`) exists, is active, and targets `~DEFAULT_BRANCH` (currently `main`). The branch API reports `protected: true`.
- The ruleset requires PRs, strict up-to-date status checks from GitHub Actions for the five named CI checks, blocks non-fast-forward pushes and deletions, has no bypass actors, and requires zero approving reviews.
- All five required CI checks passed on the latest commit of this draft PR (`b875ccf4abf90e48898e32d011b80790d481f72d`).
- Vercel's linked project has a READY production deployment from `main` SHA `1f92b56ed560ab62557515e92ea550c5c6701992`; rollback candidates exist. A later READY production deployment has no Git metadata, so **single-path production release is not yet demonstrated**. Investigate manual/CLI production deployments and project Git production-branch settings before activation.
- **Remaining hard gates:** verify GitHub ruleset enforcement by non-admin negative test; confirm production branch and no competing production deployment mechanisms; exercise safe preview and rollback; implement independently enforced, fail-closed low-risk auto-merge gate; audit logging, kill switch and notifications.
- Zero required reviews is not a substitute for the independent risk gate. **No unattended merge or deployment authorization is active.**
