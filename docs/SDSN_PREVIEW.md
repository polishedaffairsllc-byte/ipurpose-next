# SDSN Ghana presentation preview

Scope: Ghana (`/partnerships/sdsn/ghana-jh`) only. `africa-lm`, `global-partnership`, and unknown slugs return 404. There is one viewer and a typed recipient config in `lib/partnerships/sdsn.ts`. Keep the other variants disabled until Ghana is approved and their own assets are supplied.

## Assets

The supplied ZIP contains 12 original 2881 × 1620 PNGs. The supplied master PDF is 12 pages at 960.009 × 540 points with selectable text and vector artwork; its embedded raster objects are individual decorative/brand elements, not flattened low-resolution slide pages. We use the supplied PNG exports at 1280, 1920, and 2880px, WebP quality 90, without enlargement. The deck artwork is unchanged. All 36 responsive WebPs total 4,161,086 bytes (3.97 MiB); the PDF is 293,744 bytes. The browser loads a selected source for the current slide and preloads one next slide. Thumbnail requests occur only when opened. No Canva URLs remain.

Regenerate with `node scripts/prepare-sdsn-slides.mjs /absolute/path/to/original/slides ghana-jh`. Sharp is already present in the Next.js lockfile. Ghana's 12 source slide hashes are unique. No Africa/Global deck was supplied, so cross-variant hash comparison and shared-slide extraction must wait for those sources; do not assume matching slide numbers mean identical artwork.

## Review and analytics

Append `?preview=1` to the review URL. This persists a browser-local internal-traffic flag and includes `traffic_type: internal` plus `debug_mode: true` on each SDSN event. Internal events are also printed as JSON in the browser console, prefixed `[SDSN]`. To review as an external visitor, use a fresh browser profile or remove `sdsn_internal_v1` from that origin's localStorage. Preview and production origins have separate storage.

The page uses the existing `trackEvent` helper and existing GA4 installation. No tracking service was added. Page/visit events survive unavailable localStorage, initial GA script timing, and React's development effect replay. Slide views are de-duplicated per page visit; completion emits once at 10/12 viewed slides or after the final slide remains visible for five seconds. Hiding the tab cancels that final-slide timer and pauses playback. Playback resumes only through Play.

Register GA4 event-scoped custom dimensions: `recipient_id`, `deck_variant`, `slide_number`, `interaction_type`, `visit_number`, `traffic_type`. Configure the property's internal-traffic filter for `traffic_type = internal` (test the filter before activating). Console verification proves the emitted payloads; GA4 ingestion/DebugView and filter configuration require property access and are not claimed by the code checks.

Events: `sdsn_page_view`, `sdsn_deck_start`, `sdsn_slide_view`, `sdsn_deck_interaction`, `sdsn_deck_complete`, `sdsn_pdf_download`, `sdsn_visit_ipurpose_click`, `sdsn_contact_click` (`method: mailto`). Every event includes recipient slug and deck variant, with no recipient name/email event parameter.

## Behavior

Desktop starts automatic playback unless reduced motion is enabled or the document starts hidden. Mobile starts paused. Per-slide dwell seconds: 8, 14, 20, 14, 18, 20, 20, 18, 14, 20, 18, 20. All manual navigation pauses; the final slide never loops. Reduced motion disables automatic playback and transitions. Keyboard: arrows navigate, Space toggles playback, F toggles fullscreen, Escape exits. Focused buttons retain normal Space behavior. Fullscreen uses the native API and falls back to a fixed viewport overlay when unavailable/rejected, with focus containment and body scroll locking. Actual iOS Safari needs a device check; desktop emulation alone cannot certify that platform.

The PDF download uses the supplied Ghana master; Africa/Global PDF links remain absent. The contact CTA is a mailto to the specified founder address with the approved prefilled subject. The wordmark and Visit iPurpose open the main site in a new tab.

## Changes outside the partnerships paths

- `app/layout.tsx`: wraps existing background, pixel initializer, auth provider, and navigation in `SiteChrome`.
- `app/components/SiteChrome.tsx`: omits those elements only for SDSN routes; the existing customer page layout is preserved for other paths. Existing GA4 remains in the root.
- `next.config.ts`: adds `X-Robots-Tag: noindex, nofollow, noarchive` for all `/partnerships/*` paths, including deck assets.
- `scripts/prepare-sdsn-slides.mjs`: repeatable asset preparation.
- This handoff document.

No sitemap, robots.txt, public navigation, authentication rules, database schema, or production deployment was changed. All page styles and theme tokens are scoped under `.sdsn-page`.

## Verification performed

- `npx tsc --noEmit`: passed.
- `CI=true node node_modules/next/dist/bin/next build` with bundled Node 24: passed, including static Ghana generation. The initial normal local build encountered malformed Firebase service-account data from the project's downloaded Development configuration; CI mode is the repository's existing supported path for builds without Firebase initialization. No credential or Firebase code was changed.
- Lighthouse accessibility: 100/100, zero failed audits.
- Chromium browser checks at CSS viewport widths 1440, 1024, and 390: no horizontal overflow; stage begins in the first viewport; mobile transport controls remain one row with 44px targets and a fullscreen hint.
- Native fullscreen, previous/next, keyboard arrows, play/pause, thumbnail selection, segmented progress selection, and no looping at the last slide: checked in-browser. Autoplay timestamps show slide-one advancing after 8 seconds, slide two after 14, and slide three after 20.
- Console confirmed page/start/slide/interaction/completion/download events and internal flags. Final-slide completion emitted after five seconds. Event payloads can be inspected by filtering `[SDSN]` in the browser console on `?preview=1` visits.
- Downloaded PDF successfully. Contact address/subject and external target attributes checked against rendered link destinations. No email was sent.
- Actual iOS Safari, reduced-motion OS behavior, and GA4 property-level ingestion/filter activation remain review checks; they are implemented or documented but not certified by desktop emulation.
