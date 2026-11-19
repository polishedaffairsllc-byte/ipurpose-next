# Phase 0 — Operational Verification Log

Historical record for October 11, 2026 (America/New_York).

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

The owner verified these items on October 11.

## Gate 3 baseline reporting policy

- Weekly YouTube reporting uses GA4 website traffic carrying the canonical YouTube UTM tags.
- A YouTube Studio standard description-link click count is not part of the baseline because Studio does not expose that metric for ordinary external description URLs.

## Live outbound-link spot check

Performed 2026-10-11 before the four-week baseline was formally logged.

- **Email:** a live iPurpose Clarity Check results email contained working iPurpose links but those transactional links were not UTM-tagged. This is not a baseline limitation. The first campaign email must use the canonical email UTMs before distribution.
- **QR:** the stored `iPurpose-website-QR.png` decodes to `https://ipurposesoul.com` with no UTM parameters. The QR has not been distributed, so it is not sending traffic and does not affect the four-week baseline.
- **QR distribution rule:** **QR code must carry UTMs before first distribution.** Regenerate the QR using the canonical `utm_source=qr` naming before it is printed or shared. If its eventual destination changes when the apps go live, tag that final destination from its first scan.
- **QR baseline treatment:** QR scans are outside the initial four-week baseline. If the QR launches during the period, treat QR as a new channel with its own channel start date and mini-baseline rather than folding it into the Shorts/search baseline.
- **YouTube Shorts:** a live Short URL was located, but the currently published external description link could not be inspected through the available connected/public sources, so its UTM placement remains the only live placement still requiring owner confirmation.

## Baseline status

Owner-operated Gate 1, mobile Clarity, and owner-exclusion checks are verified by owner report. Deployment is live. Gate 3's measurement contract and weekly GA4 YouTube policy are in place. QR and campaign-email placement are no longer baseline blockers because neither is currently contributing campaign traffic to the baseline.

The October 11 log left the published Short’s use of canonical YouTube UTMs pending. October 12 through November 8, 2026 was the proposed four-week window, contingent on that confirmation. The October 11 evidence does not establish when the baseline began or whether it was completed.

The proposed change-control rule for that baseline required owner approval for changes to the Clarity Check, calls to action, or tracking during the measurement window.
