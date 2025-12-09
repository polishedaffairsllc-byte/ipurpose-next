#!/usr/bin/env bash
# scripts/set_github_secret.sh
# Usage: ./scripts/set_github_secret.sh /path/to/serviceAccountKey.json
# Requires the GitHub CLI (`gh`) and that you're authenticated and in the repo directory.

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/serviceAccountKey.json"
  exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

# Read file and set as repository secret
# This will prompt for repo selection if not run from a git clone of the repo
# and requires appropriate permissions.

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is not installed. Install it: https://cli.github.com/"
  exit 1
fi

# Use gh to set the secret; gh will encrypt it for the repo
gh secret set FIREBASE_SERVICE_ACCOUNT --body-file "$FILE"

echo "FIREBASE_SERVICE_ACCOUNT secret set. Verify in GitHub -> Settings -> Secrets and variables -> Actions."
