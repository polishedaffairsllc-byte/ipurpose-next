#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/firebase-imports"
COMMIT_MSG="fix: normalize firebase client import aliases (@/lib/firebase)"

git fetch origin main
git checkout -B "$BRANCH" origin/main

echo "Files that will be changed (if any):"
git grep -n --no-show-function "@/app/lib/firebase" || true

# Replace imports
git grep -l "@/app/lib/firebase" | xargs -r -n1 perl -pi -e 's#@/app/lib/firebase#@/lib/firebase#g' || true

# Type-check (fail fast if type errors)
npx tsc --noEmit

# Build check (non-fatal)
if ! npx next build; then
  echo "npx next build failed (check logs) — continuing so you can review changes"
fi

if ! git diff --quiet; then
  git add -A
  git commit -m "$COMMIT_MSG"
  git push --set-upstream origin "$BRANCH"
  echo "Branch pushed: $BRANCH"
  echo "Open a PR at: https://github.com/polishedaffairsllc-byte/ipurpose-next/compare/main...$BRANCH"
else
  echo "No changes made."
fi
