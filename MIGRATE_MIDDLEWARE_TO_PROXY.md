# Migrating `middleware` to `proxy` (Next.js 16+)

Next.js 16 deprecated the `middleware` file convention in favor of the `proxy` capability. This document explains the recommended migration steps.

Why migrate
- Next.js warns about the deprecated `middleware` convention. Migrating avoids future breakage and aligns with the new proxy-first behavior.

High-level options
1. Minimal (keep behavior): leave `middleware.ts` as-is for now and mark migration as "planned". No functional change.
2. Medium (document + partial code): convert simple header-setting behavior using `next.config.js` `async headers()` or `rewrites()` where possible.
3. Full (recommended): implement a small Node/Edge proxy (e.g., `app/proxy.ts`) that performs routing and header manipulation according to Next's proxy docs.

Suggested approach (practical, low-risk):

- Keep the existing `middleware.ts` in place while you prepare a `proxy` implementation.
- Create `MIGRATE_MIDDLEWARE_TO_PROXY.md` (this file) and add a CI/issue to track the migration.
- When ready, implement a `proxy` that replicates the logic in `middleware.ts`.

Example: current `middleware.ts` behavior
- Sets `x-pathname` header
- In development sets `x-user-tier: DEEPENING`
- Matches all non-api/_next/static requests via `matcher`

Example `proxy` sketch (illustrative)

```ts
// app/proxy.ts (example sketch, not a drop-in)
import { NextRequest, NextResponse } from 'next/server';

export async function onProxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-user-tier', 'DEEPENING');
  }
  return response;
}

export const config = {
  // configure proxy matcher and options per Next docs
};
```

Notes and references
- Next.js proxy docs: https://nextjs.org/docs/messages/middleware-to-proxy
- Test locally after migration: `npm run dev` and spot-check gated pages.

If you want, I can open a PR that:
- Adds `app/proxy.ts` with a conservative translation of `middleware.ts` logic, and
- Disables `middleware.ts` (or keeps it behind a feature flag) until you've validated the proxy behavior.

Reply with `PR` if you'd like me to implement the proxy translation and open a commit in this repo.
