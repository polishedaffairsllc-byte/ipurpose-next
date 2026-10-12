# Phase 0 — Operational Verification Log

Date: 2026-10-11 (America/New_York)

## Deployment

- Production deployment containing PR #81 / merge commit `80e54adad09fdfe7e25a9d3c17d3e262bd5c4846` was verified READY in Vercel.
- Production alias includes `ipurposesoul.com`.

## Owner-verified live checks

The iPurpose owner reported personally completing the following live checks on 2026-10-11 and reported that all passed:

- normal public visit appeared in GA4 Realtime;
- `?ipurpose_qa=1` visit did not appear;
- same browser revisited without the QA parameter remained excluded;
- `/admin` generated no GA4 data while the launch-metrics dashboard remained usable;
- full mobile Clarity Check start and completion fired successfully;
- owner-exclusion coverage was verified on both phone and computer.

These items are recorded as **owner-verified**, not independently re-performed by the repository automation.

## Gate 3 baseline reporting policy

- Weekly YouTube reporting uses GA4 website traffic carrying the canonical YouTube UTM tags.
- A YouTube Studio standard description-link click count is not part of the baseline because Studio does not expose that metric for ordinary external description URLs.

## Live outbound-link spot check

Performed 2026-10-11 before the four-week baseline was formally logged.

- **Email:** a live iPurpose Clarity Check results email contained working iPurpose links but those transactional links were not UTM-tagged. No recent UTM-tagged campaign email was available in the connected mailbox to verify.
- **QR:** the stored `iPurpose-website-QR.png` decodes to `https://ipurposesoul.com` with no UTM parameters. The previously planned `/app` destination currently returns 404 and should not be treated as a live baseline destination.
- **YouTube Shorts:** a live Short URL was located, but the currently published external description link could not be inspected through the available connected/public sources, so its UTM placement was not independently verified.

## Baseline status

Owner-operated Gate 1, mobile Clarity, and owner-exclusion checks are verified by owner report. Deployment is live. Gate 3's measurement contract and weekly GA4 YouTube policy are in place. However, live placement of controlled campaign UTMs is not yet fully verified across Shorts, QR, and campaign email. Therefore the official four-week baseline start should remain pending until the outbound-link placement gap is either corrected or explicitly accepted as a baseline limitation.

## Baseline change-control rule

During the official four-week baseline, do not change the Clarity Check, CTAs, or tracking setup without the owner's explicit approval.
