# Activation A Implemented

**Date:** January 28, 2026  
**Scope:** Activation A (Saved Insight) instrumentation and idempotent activation inference. Minimal server-side changes only.

## What Changed
- Added server-side structured `lab_save` events (success/failure) for identity, meaning, and agency save routes.
- Added content metrics: word count bucket (no raw text), char count derived, content hash for dedupe, meaningful flag (word_count >= 25 OR char_count >= 140).
- Added one-time `activation_a_reached` emission and activation record per unique meaningful save (dedupe: uid + lab_id + prompt_id + content_hash).
- Added Firestore logging collections: `lab_events` and `activation_a_states` (server-side only; no UI changes).

## Event Payload Examples
- Success `lab_save`:
```json
{
  "event": "lab_save",
  "uid": "user123",
  "sessionId": "unknown",
  "labId": "identity",
  "promptId": "identity_primary",
  "wordCountBucket": "25-49",
  "environment": "production",
  "success": true,
  "entitlementTier": "FREE",
  "contentHash": "<sha256>",
  "meaningful": true
}
```
- Failure `lab_save` (validation):
```json
{
  "event": "lab_save",
  "uid": "user123",
  "sessionId": "unknown",
  "labId": "meaning",
  "promptId": "meaning_primary",
  "wordCountBucket": "0",
  "environment": "production",
  "success": false,
  "entitlementTier": "FREE",
  "errorCode": "VALIDATION_ERROR",
  "contentHash": "empty",
  "meaningful": false
}
```
- `activation_a_reached` (emitted once per unique meaningful save):
```json
{
  "event": "activation_a_reached",
  "uid": "user123",
  "sessionId": "unknown",
  "labId": "agency",
  "promptId": "agency_primary",
  "wordCountBucket": "50-99",
  "environment": "production",
  "success": true,
  "entitlementTier": "FREE",
  "contentHash": "<sha256>",
  "meaningful": true
}
```

## How to Test (Local)
- Authenticated: save a lab with >25 words; expect 200/201 and Firestore `lab_events` entry with `success=true`, bucket >= "25-49"; `activation_a_reached` created once.
- Duplicate save (same content): `lab_events` logs another `lab_save`, but no new `activation_a_reached` doc/event.
- Empty/short save: API returns 400; `lab_events` contains `success=false` with `errorCode=VALIDATION_ERROR` and bucket "0".
- Unauthorized: API 401; `lab_events` contains `success=false` with `errorCode=UNAUTHENTICATED`.
- Network/Server error: `lab_events` contains `success=false` with `errorCode=SERVER_ERROR`.

## Quick Verification Checklist (from QA plan)
- [ ] Auth user can save meaningful text; sees success response.
- [ ] `lab_events` has `lab_save success=true` with wordCountBucket >= "25-49".
- [ ] `activation_a_states` has one record per unique content hash; `activation_a_reached` emitted once.
- [ ] Empty input blocked; `lab_events` shows `success=false`, `VALIDATION_ERROR`.
- [ ] Unauthorized attempt logs `success=false`, `UNAUTHENTICATED`.
- [ ] No UI or routing changes observed.
