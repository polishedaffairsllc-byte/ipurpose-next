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

## YouTube weekly attribution record

YouTube Studio external-link clicks are a platform-side metric and cannot be reconstructed from GA4 alone. Record the number once weekly, using the same reporting week as the launch metrics brief.

Track:

- week starting
- week ending
- Shorts external-link clicks
- long-form external-link clicks, if available
- top linked video/content
- notes on description/pinned-comment changes

This is one weekly platform check, not a per-video manual test.

## Gate 3 completion criteria

Gate 3 is complete when:

1. the canonical UTM contract is documented;
2. controlled outbound links use generated UTMs consistently;
3. the attribution-link tests pass in CI;
4. YouTube Studio external-link clicks have a defined weekly recording process.

The first weekly YouTube click value becomes part of the baseline record; it does not block implementation of the UTM system itself.
