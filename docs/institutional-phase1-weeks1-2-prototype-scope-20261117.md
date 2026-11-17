# iPurpose — Phase 1 Weeks 1–2 Document Prototype: Scoped Implementation Gate
**Prepared:** 2026-11-17  
**Status:** PROPOSED SCOPE, NOT A PRODUCTION OR CUSTOMER DELIVERY AUTHORIZATION  
**Inputs:** User-shared Codex Phase 0 summary, Claude Creative Package Draft v2, internal PR #105 planning documents. Codex's full local report at `/Users/renita.hamilton/Documents/ChatGPT/Discoverability/docs/institutional-technical-readiness-20261117.md` was **not accessible** in this review and is **not** in GitHub as of this writing. Details below are to be reconciled with the full report before commitment.

## 1. Reported Phase 0 findings (not independently verified)
Codex reports GO to a limited Weeks 1–2 document prototype, reusing existing scripts, a student Decision-to-Action Plan, and original five-item check-in. The preferred minimum license is an eight-week PDF/editable curriculum delivered by the institution's own facilitators and systems. Prototype engineering effort estimated at 1–2 days with $0 incremental **monthly infrastructure**, excluding content, creative, review and labor costs. Reported tests: 73 web/backend, 29 native passed; web/native typechecks and unsigned mobile exports passed. Outstanding 981 web lint warnings, existing high-severity dependency advisory exception, privacy/legal/content approval, on-device QA, LMS and final-document accessibility checks. Source is a pasted status excerpt only; see full local Phase 0 report for severity, exact affected dependencies and pass logs.

## 2. Decision and ownership
**Recommendation:** GO to a limited isolated **document prototype** to evaluate ease of delivery, NOT to eight-week curriculum completion, institutional license sale, LMS/hosted integration, production release or student recruitment.
- **Founder / CEO (A):** approves scope, allowable expense, visual brand exception, and downstream customer-facing use.
- **Claude (R creative):** produces editable Week 1–2 facilitator and participant layouts with source copy, template and print proof; does not write technical pipelines or publish.
- **ChatGPT (R program/claims during active sessions):** ensures session goals/outcomes, approved wording, accurate references, plan form consistency and privacy/AI boundaries.
- **Codex (R technical upon founder go-ahead):** packages approved assets into versioned files, documents reproducible export and validates printed/interactive functionality. No live app changes.
- **Designated accessibility/privacy/program professionals (pending):** review suitability and safety before any live institution use.

## 3. Exact limited prototype contents
Create **one complete illustrative two-week institutional package** (not a full paid license or complete 8-week course):
`institutional-license-prototype-v0.1/`
- `README-START-HERE.md` — **DRAFT / INTERNAL** status, limitations, setup, who administers, what is participant-owned, who to contact for support, expected 60-minute core or optional 90-minute extended sessions.
- `facilitator/Week-01-Guide.(editable + PDF)`, `facilitator/Week-02-Guide.(editable + PDF)` — objectives, agenda/timing, step-by-step exercises, facilitation boundaries, optional/no-share alternate activity, handoff.
- `participants/Week-01-Worksheet.(editable + PDF)`, `participants/Week-02-Worksheet.(editable + PDF)` — original activities with writable space and clear instructions; no mandatory disclosure of values/reflections.
- `participants/Decision-to-Action-Working-Plan-2p.(editable + PDF)` — personal, private working worksheet (decision, alternatives, verified info, choice/reasons, action/date/support, obstacles, optional AI verification).
- `participants/Decision-to-Action-Summary-1p.(editable + PDF)` — single-page shareable summary retaining relevant University of Ghana pilot charter fields, participant-controlled sharing.
- `evaluation/Original-5-Item-Check-In.(editable + PDF)` — self-reported, **non-diagnostic, unvalidated** baseline/exit prompts, with voluntary participation and missing-data handling.
- `evaluation/Aggregate-Reporting-Template.(editable, no real records)` — fictional examples only; counts, denominators, dropouts and small-cell privacy rules pending review.
- `assets/brand-spec.md` — verified approved color references, display/headings, body font decision pending founder; do **not** distribute font files.
- `qa/RELEASE-CHECKLIST.md` — explicit labels for completed/not completed device/LMS/accessibility/security/legal and evidence per finding.

Format selection (DOCX/Google Docs/MD versus PPTX/accessible PDF) should prioritize **editable source and common institutional reader capability**, not creating live LMS integrations. PDF is review proof only; claimed fillable or tagged PDF accessibility must be actually tested.

## 4. QA and acceptance tests (synthetic only)
- Verify document bundle can be opened locally by a facilitator and participant and contains no hidden personal data, live credentials, unapproved logos/partners, or proprietary copied third-party assessment items.
- A non-founder facilitator can read the README and run a 60-minute Week 1 and Week 2 lesson from the guide without author intervention (dry run with synthetic example); provide a 90-minute optional extension only if authored and budgeted.
- Participant can select a meaningful decision, identify priorities privately, consider at least two possibilities, and produce a one-page plan summary. Individual completion is **measured**, never guaranteed.
- Ensure one-page summary retains charter intent: decision, reason, evidence/alternatives, action/date, potential obstacle, appropriate support and optional AI verification.
- Mark private workbook pages as **participant-owned offline worksheets, not automatically collected by iPurpose**. Do not claim the hosted Clarity/Compass systems do not collect data; differentiate this document-only version.
- Provide editable and print-proof outputs, readable print sizes, correct heading sequence, reflow and usable keyboard/tab order where applicable; actual assistive-technology QA is an explicit outstanding gate before external use.
- Synthetic check-in/report shows exact denominator and missingness, does not disclose individual reflections, and cannot be misconstrued as a validated psychological scale.
- Compare export result with approved creative brief, program outline and actual Codex full report. Preserve app, tests, university schedule, production and payment flows.

## 5. Security / build blockers
**Security:** Codex must identify affected dependency, advisory identifier, reachable/production relevance, mitigating controls, status/owner, and upgrade or documented exception before any relevant code-dependent delivery. A count of lint warnings is not proof of a failing release, but summarize the categories and identify any accessibility or safety-critical warnings. Nothing in the status summary verifies legal or final QA clearance.

**No net-new platform:** no institutional auth, SSO, roster import, subscriptions/Stripe, seat enforcement, institutional dashboards, direct student integrations or live AI processing in this phase. No live pilot data.

## 6. Deliverable and gate
Codex returns:
1. A reconciled actual-report assessment with current repo branch/commit and tested commands/results;
2. A versioned isolated **v0.1 internal two-week package** only from content signed off by founder/creative/program;
3. A working editable source + PDF proof for each component;
4. Synthetic walkthrough and QA/limitations register;
5. Engineering/time/cash cost summary and no-exposure declaration.

**Go to buyer review** only after founder signs content/brand, institutional use-rights copy is reviewed, accessibility/privacy risk for the prototype is understood, and a trusted prospective buyer agrees to see a **draft concept**, not a ready-to-license eight-week product. External partner delivery, actual licenses and live users require separate approvals.

## 7. Explicit prohibitions
Do not modify GitHub main, merge PRs #104/#105, overwrite Claude sources, deploy web/native, send scheduled/draft emails, alter institutional outreach queues, solicit actual student/claimant records, charge for a program not ready, imply accreditation/effectiveness, spend without approval, or treat this scope memo as a substitute for the Phase 0 full source report.
