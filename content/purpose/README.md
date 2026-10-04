# Purpose content hub

The seven named `.ts` files contain editable copy and metadata. Each exports a
`PurposePage` checked by TypeScript. `index.ts` defines the reading order, with
`what-is-my-purpose` first. `source.md` is the unchanged supplied manuscript,
retained as the copy-verification baseline; it is not rendered directly.

## Editing

- Edit `title`, `description`, `heading`, `summary`, body blocks, or the `cta`
  fields in the relevant article file. The shared template requires no changes.
- Paragraphs and list items support inline `**strong**`, `*emphasis*`, and
  `[descriptive text](/purpose/slug)` links. Raw HTML is not supported.
- Tables use a `table` block with `headers` and `rows`; the template provides a
  keyboard-focusable, horizontally scrolling container on narrow screens.
- The `related` array contains three other article slugs. For non-cornerstone
  pages, include `what-is-my-purpose` and two siblings.
- When intentionally revising the manuscript, update `source.md` as well so
  the exact-copy check remains useful. It ignores whitespace and the Markdown
  table separator, but checks wording, headings, inline markup, metadata and CTA
  labels exactly.
- The hub's introductory copy and metadata are in `app/purpose/page.tsx`.

## Routing and analytics

The shared article route statically generates all seven slugs. Unknown slugs
return 404. The canonical URL follows the site's existing non-trailing-slash
convention. All article links and the hub are included in `app/sitemap.ts`.

`PurposeCta` links to `/clarity-check`, verified from the existing route and
metadata. Its `purpose_cta_click` event uses the existing `trackEvent` GA4 helper
with `page_slug`, `page_path`, `cta_text`, `link_url`, and beacon transport.
The hub sends `page_slug: "index"`. No new analytics library is required.

## Verification

```sh
node scripts/verify-purpose.mjs
BASE_URL=http://localhost:3100 node scripts/verify-purpose.mjs
BASE_URL=http://localhost:3100 BROWSER_CHECK=1 node scripts/verify-purpose.mjs
```

The first command checks exact copy and link integrity. The second checks all
eight HTTP routes, server-rendered HTML, metadata, JSON-LD, sitemap membership,
and a missing-slug 404. The third additionally uses the existing Playwright
installation to check mobile and desktop overflow, table scrolling, JavaScript
exceptions and the CTA event payload. Browser checks block external analytics;
test clicks do not submit assessment answers or send production analytics.
Saved HTML and screenshots default to `/private/tmp/purpose-verification`;
override with `PURPOSE_ARTIFACTS`.

## Editorial flags

- The expected `content/purpose/source.md` was absent. The supplied
  `ipurpose-purpose-hub-pages.md` attachment was copied there verbatim.
- Pages 2, 4 and 6 have only one inline sibling link. Page 5 has no inline
  cornerstone link, and page 7 has no inline sibling links. Related-page blocks
  supply the missing connections without altering the manuscript.
- The manuscript describes the Clarity Check as a guided/gentle conversation
  and suggests personal-values/mission reflection. The existing destination
  introduces a business-focused clarity assessment. That promise should be
  reviewed; the manuscript and assessment were left unchanged.
- The completion brief supplies Style Bible v5 palette, typography and CTA
  rules. Purpose-owned styles use Deep Indigo, Lavender Purple, Salmon Peach,
  and Light Mist Gray; headings use Italiana and body copy uses Marcellus.
  Shared site header/footer styling is preserved. Source CTA labels offer a
  next step; none promises income, speed or guaranteed transformation. They
  are not the verbatim reference CTA sentence, as explicitly permitted by the
  instruction to preserve page-specific button labels.
- The attachment's publishing notes suggest adding personal stories, client
  examples and author biographies. Those were not added because the request
  explicitly requires unchanged copy. Article schema does not invent an author.

## Publication

After merging and deploying, inspect the production URLs and sitemap in Search
Console. Submit or resubmit `https://ipurposesoul.com/sitemap.xml` if needed.
Use GA4 DebugView to confirm `purpose_cta_click`; register `page_slug` as a
custom dimension if you want it available in standard GA4 reports. Review the
editorial mismatch before publication.

## Styling decision

`app/globals.css` still uses the Tailwind 3 `@tailwind` directives, while the
installed PostCSS plugin is Tailwind 4. The global entry neither imports the
Tailwind 4 theme nor loads `tailwind.config.ts`. Browser inspection confirmed
that the hub's original unprefixed spacing, typography, and color utilities
were absent. Enabling these globally would restyle existing pages, outside the
Purpose scope.

`app/purpose/purpose.css` is therefore retained as a scoped CSS entry using the
same installed Tailwind/PostCSS compiler, the same `tailwind.config.ts`, and the
same design-token plugin. It is not a separate dependency or build pipeline.
The `purpose:` prefix prevents collisions with existing page utilities. It
imports theme and utilities without global Preflight, and resets margins only
inside `#purpose-content`. The sole supplemental token is Style Bible v5's
Light Mist Gray (#F5F7FA), which is absent from the older shared token file.

Maintenance tradeoff: Purpose classes retain a prefix and one CSS entry. When
the site's global Tailwind 4 migration is completed and regression-tested, that
entry/prefix can be consolidated. Fonts, spacing scales and existing color
tokens remain sourced from the shared design system.
