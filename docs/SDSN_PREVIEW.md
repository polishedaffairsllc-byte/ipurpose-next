# SDSN presentation previews

Scope: Ghana (`ghana-jh`), Africa (`africa-lm`), and Global (`global-partnership`) are enabled under `/partnerships/sdsn/`. Unknown slugs return 404. All three use one unchanged approved viewer/page template and a typed recipient config in `lib/partnerships/sdsn.ts`. Phase 2 is preview only: do not merge or deploy to production.

## Assets

The supplied ZIP contains 12 original 2881 × 1620 PNGs. The supplied master PDF is 12 pages at 960.009 × 540 points with selectable text and vector artwork; its embedded raster objects are individual decorative/brand elements, not flattened low-resolution slide pages. We use the supplied PNG exports at 1280, 1920, and 2880px, WebP quality 90, without enlargement. The deck artwork is unchanged. All 36 responsive WebPs total 4,161,086 bytes (3.97 MiB); the PDF is 293,744 bytes. The browser loads a selected source for the current slide and preloads one next slide. Thumbnail requests occur only when opened. No Canva URLs remain.

Regenerate with `node scripts/prepare-sdsn-slides.mjs /absolute/path/to/original/slides ghana-jh`. Sharp is already present in the Next.js lockfile. Ghana's 12 source slide hashes are unique. The rebuilt Africa/Global source PNG hashes exactly match Ghana at slides 2, 4, 9, 10, and 12; those config entries reference the existing Ghana files directly, preserving Ghana's URLs and bytes. Slides 1, 3, 5, 6, 7, 8, and 11 are unique for each new recipient. Slide 11 shares a title, not its artwork. Pass the original Ghana PNG directory as the script's third argument to verify and skip identical sources during regeneration.

## Review and analytics

Append `?preview=1` to the review URL. This persists a browser-local internal-traffic flag and includes `traffic_type: internal` plus `debug_mode: true` on each SDSN event. Internal events are also printed as JSON in the browser console, prefixed `[SDSN]`. To review as an external visitor, use a fresh browser profile or remove `sdsn_internal_v1` from that origin's localStorage. Preview and production origins have separate storage.

The page uses the existing `trackEvent` helper and existing GA4 installation. No tracking service was added. Page/visit events survive unavailable localStorage, initial GA script timing, and React's development effect replay. Slide views are de-duplicated per page visit; completion emits once at 10/12 viewed slides or after the final slide remains visible for five seconds. Hiding the tab cancels that final-slide timer and pauses playback. Playback resumes only through Play.

Register GA4 event-scoped custom dimensions: `recipient_id`, `deck_variant`, `slide_number`, `interaction_type`, `visit_number`, `traffic_type`. The iPurpose Web GA4 property's internal-traffic filter remains in Testing at the owner's request until all three presentations are complete. Live GA4 receipt was verified separately from the code checks (see below).

Events: `sdsn_page_view`, `sdsn_deck_start`, `sdsn_slide_view`, `sdsn_deck_interaction`, `sdsn_deck_complete`, `sdsn_pdf_download`, `sdsn_visit_ipurpose_click`, `sdsn_contact_click` (`method: mailto`). Every event includes recipient slug and deck variant, with no recipient name/email event parameter.

## Behavior

Desktop starts automatic playback unless reduced motion is enabled or the document starts hidden. Mobile starts paused. Per-slide dwell seconds: 8, 14, 20, 14, 18, 20, 20, 18, 14, 20, 18, 20. All manual navigation pauses; the final slide never loops. Reduced motion disables automatic playback and transitions. Keyboard: arrows navigate, Space toggles playback, F toggles fullscreen, Escape exits. Focused buttons retain normal Space behavior. Fullscreen uses the native API and falls back to a fixed viewport overlay when unavailable/rejected, with focus containment and body scroll locking. Actual iOS Safari needs a device check; desktop emulation alone cannot certify that platform.

Each PDF download uses its matching supplied rebuilt master. Ghana's PDF remains unchanged; Africa and Global use their new `*_Master.pdf` files. The contact CTA is a mailto to the specified founder address with the approved prefilled subject. The wordmark and Visit iPurpose open the main site in a new tab.

## Changes outside the partnerships paths

- `app/layout.tsx`: wraps existing background, pixel initializer, auth provider, and navigation in `SiteChrome`.
- `app/components/SiteChrome.tsx`: omits those elements only for SDSN routes; the existing customer page layout is preserved for other paths. Existing GA4 remains in the root.
- `next.config.ts`: adds `X-Robots-Tag: noindex, nofollow, noarchive` for all `/partnerships/*` paths, including deck assets.
- `scripts/prepare-sdsn-slides.mjs`: repeatable asset preparation.
- This handoff document.

No sitemap, robots.txt, public navigation, authentication rules, or database schema was changed. All page styles and theme tokens are scoped under `.sdsn-page`.

## Verification performed

- `npx tsc --noEmit`: passed.
- `CI=true node node_modules/next/dist/bin/next build` with bundled Node 24: passed, including static Ghana generation. The initial normal local build encountered malformed Firebase service-account data from the project's downloaded Development configuration; CI mode is the repository's existing supported path for builds without Firebase initialization. No credential or Firebase code was changed.
- Lighthouse accessibility: 100/100, zero failed audits.
- Chromium browser checks at CSS viewport widths 1440, 1024, and 390: no horizontal overflow; stage begins in the first viewport; mobile transport controls remain one row with 44px targets and a fullscreen hint.
- Native fullscreen, previous/next, keyboard arrows, play/pause, thumbnail selection, segmented progress selection, and no looping at the last slide: checked in-browser. Autoplay timestamps show slide-one advancing after 8 seconds, slide two after 14, and slide three after 20.
- Console confirmed page/start/slide/interaction/completion/download events and internal flags. Final-slide completion emitted after five seconds. Event payloads can be inspected by filtering `[SDSN]` in the browser console on `?preview=1` visits.
- Downloaded PDF successfully. Contact address/subject and external target attributes checked against rendered link destinations. No email was sent.
- Actual iOS Safari, reduced-motion OS behavior, and explicit Chrome 200% zoom remain platform-specific checks. Internal-traffic filter activation is deferred until all three presentations are complete.

## Tracking correction

SDSN events now wait for the existing GA4 config commands to be queued before calling the existing tracking helper, and explicitly use the project's deduplicated GA4 measurement IDs through `send_to`. This prevents initial page/slide events from depending on the Ads tag's default routing before GA4 is initialized. The existing owner/admin/QA disable flags are respected. `[SDSN delivery]` console messages distinguish queuing to the Google tag from property-level receipt; they are not proof of network delivery or GA4 ingestion.

Regression checks: `node --import tsx --test tests/sdsn-analytics.node.ts tests/internal-analytics-exclusion.node.ts tests/launch-metrics.node.ts` (10 passed), TypeScript, and full CI-mode build passed. Five fresh events were verified in iPurpose Web GA4 DebugView (property 525662576, stream G-FX51XM1DVS), including `recipient_id=ghana-jh`; the corresponding collection request returned HTTP 204. The owner confirmed tracking works. An active internal-traffic filter, browser privacy protection, or checking another property may hide debug activity; the code does not bypass those protections or change property settings.

## Merge validation dependency repair

The existing production dependency audit failed on both main and this branch. To clear that gate, the lockfile now resolves Next.js 16.4.3, MCP server/core 2.3.0, Zod 4.6.6, DOMPurify 3.4.17, and Firebase's existing Undici override 6.29.1. No audit rules or exceptions were broadened. The unchanged audit passes with its pre-existing exact gRPC exception (four affected package nodes); eight moderate findings remain informational. The ten MCP authentication/transport regressions pass with `node --conditions=react-server --import tsx --test tests/launch-metrics-mcp.node.ts`, and TypeScript passes.

## Phase 2 implementation

Africa and Global use the exact requested recipient copy, slide titles, contact subjects, and `deck_variant` values. The viewer, page template, CTA constants, CSS, and all Ghana files are unchanged. New original PNGs are 2881 × 1620; seven unique slides per recipient are converted to the same 1280/1920/2880px WebP pipeline at quality 90 without upscaling (21 new WebPs per recipient). Both rebuilt PDFs are 12-page vector/text masters.

Phase 2 changes outside `/partnerships`: `lib/partnerships/sdsn.ts` recipient config/shared asset mapping; `scripts/prepare-sdsn-slides.mjs` optional SHA-256 reuse check; this document; and `tests/production-baseline.spec.ts`, which now verifies emitted module classes and actual theme CSS instead of requiring the former Next.js CSS class-name format. The security dependency repair above was already on the branch when Phase 2 began. No analytics property/filter settings were changed.
