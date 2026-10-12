# Gate 3 — Attribution

Gate 3 establishes one consistent outbound-link contract so GA4 can attribute discovery traffic without relying on guesswork.

## Canonical destination

Default campaign destination: `https://ipurposesoul.com/clarity-check`

Use another destination only when the campaign explicitly points somewhere else, such as `/starter-pack`.

## Required UTM fields

Every iPurpose-controlled outbound campaign link must include all four fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

Do not publish manually improvised source or medium values when a canonical value below exists.

## Canonical source and medium values

| Source | Medium |
| --- | --- |
| `youtube` | `organic_video` |
| `instagram` | `organic_social` |
| `facebook` | `organic_social` |
| `linkedin` | `organic_social` |
| `email` | `email` |
| `event` | `offline` |
| `qr` | `offline` |
| `partner` | `referral` |

Campaign and content names are lowercase snake_case. The generator normalizes them automatically.

## Link generator

Use:

`node scripts/generate-campaign-link.mjs <source> <campaign> <content> [path]`

Examples:

- YouTube Short: `node scripts/generate-campaign-link.mjs youtube clarity_check signal_s2e1_short`
- Instagram post: `node scripts/generate-campaign-link.mjs instagram clarity_check signal_s2e1_post`
- Email: `node scripts/generate-campaign-link.mjs email nurture clarity_followup_01`
- Event QR: `node scripts/generate-campaign-link.mjs qr community_event fall_2026 /clarity-check`
- Starter Pack campaign: `node scripts/generate-campaign-link.mjs youtube starter_pack signal_s2e5_short /starter-pack`

The generator always uses the canonical customer-facing domain `ipurposesoul.com`.

## YouTube attribution

YouTube Studio does not provide a built-in click count for standard external URLs placed in video descriptions. Do not use a nonexistent Studio description-link click metric as a Gate 3 requirement.

For normal iPurpose YouTube attribution, use the UTM-tagged links generated above and measure the resulting website traffic in GA4. At minimum, review:

- sessions/users with `utm_source=youtube`;
- landing page;
- campaign and content values;
- Clarity Check starts/completions attributed to those sessions;
- Starter Pack visits or downstream purchase activity when relevant.

Because `utm_content` is unique to the video or placement, GA4 can distinguish traffic from individual Shorts or long-form videos as long as the published description link uses the generated URL.

If exact raw click counts are ever needed in addition to GA4 sessions, use an iPurpose-controlled redirect/custom shortlink or a dedicated third-party shortlink. That is optional and is not required to clear Gate 3.

## Weekly YouTube attribution record

Use the same reporting week as the launch metrics brief and record the GA4-attributed YouTube traffic that actually reached iPurpose.

**Baseline reporting policy:** the weekly YouTube measure is GA4 website traffic carrying the canonical YouTube UTM tags. A YouTube Studio description-link click count is not part of the baseline report.

Track:

- week starting;
- week ending;
- YouTube-attributed sessions/users;
- top `utm_content` video/placement;
- Clarity Check starts/completions from YouTube-attributed traffic where available;
- downstream Starter Pack activity where available;
- notes on description or pinned-comment link changes.

This is a website-attribution check, not a YouTube Studio description-link click report.

## Gate 3 completion criteria

Gate 3 is complete when:

1. the canonical UTM contract is documented;
2. controlled outbound links use generated UTMs consistently;
3. the attribution-link tests pass in CI;
4. YouTube attribution is measured through UTM-tagged website traffic in GA4, with optional shortlink tracking only if raw click counts are specifically needed.

A separate YouTube Studio description-link click metric is not required because YouTube Studio does not expose one for standard description URLs.
