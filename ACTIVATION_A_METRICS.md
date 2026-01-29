# Activation A Metrics — Saved Insight

**Date:** January 28, 2026  
**Scope:** KPIs and funnel for Activation A (no code/UI/routes).  

## KPI
- Activation A Rate: % of Explorers who record a successful `lab_save` (meaningful content) and transition to Activated within 7 days of first Explorer event.

## Funnel Steps
1) Explorer entry (labs/orientation/clarity page_view or lead_submit)
2) Lab prompt viewed (lab_open)
3) Lab save attempt (client initiation)
4) Lab save success (`lab_save success=true`)
5) Activation state inferred (Explorer → Activated)

## Drop-off Points
- Between Explorer entry and lab_open (did not start prompt)
- Between lab_open and save attempt (no input/overwhelm)
- Between save attempt and save success (validation/network/error)
- Post-save but no activation inference (duplicate/empty/failed inference)

## Dashboard Minimums
- Counts and rates for each funnel step.
- Time-to-activation (median) from first Explorer event.
- Error rates for save attempts (validation vs network/server).
- Duplicate/rapid save rate (for idempotency tuning).

## Guardrails
- Filter out empty/near-empty saves (define minimal content threshold).
- Deduplicate saves per session/content hash to avoid false activations.
- Exclude non-auth sessions (saves should be auth-only).
- Track environment to keep dev/stage noise out of prod KPIs.
