#!/usr/bin/env bash
# scripts/remove_dev_fallback_and_verify.sh
# Usage: ./scripts/remove_dev_fallback_and_verify.sh
# This script removes DEV_FALLBACK from .env.local, restarts the dev server, and checks admin status.

set -euo pipefail

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "No $ENV_FILE found in repo root. Please create one or set FIREBASE_SERVICE_ACCOUNT in your environment." >&2
  exit 1
fi

# Remove lines that set DEV_FALLBACK
cp "$ENV_FILE" "${ENV_FILE}.bak"
grep -v "^DEV_FALLBACK=" "${ENV_FILE}.bak" > "$ENV_FILE"

echo "Removed DEV_FALLBACK from $ENV_FILE (backup at ${ENV_FILE}.bak)"

# Restart dev server
pkill -f "next dev" || true
npm run dev > .dev.log 2>&1 &
DEV_PID=$!

echo "Started dev server with PID $DEV_PID"

# Wait for server to warm up
sleep 1

# Tail recent logs
echo "---- recent dev log ----"
tail -n 80 .dev.log

echo
# Check admin status
echo "Checking admin status..."
if curl -sS -i http://localhost:3000/api/admin/status | sed -n '1,120p'; then
  echo "Admin status checked."
else
  echo "Failed to reach /api/admin/status. Check .dev.log for errors." >&2
fi

# Test login endpoint with a dummy token (if admin is initialized this will create a real session cookie)
echo
echo "Testing POST /api/auth/login with dummy token..."
curl -sS -i -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"idToken":"testtoken"}' | sed -n '1,120p'

echo

echo "Done. If admin initialization fails, ensure FIREBASE_SERVICE_ACCOUNT is set in .env.local or as host secrets and restart/redeploy."