# CODEX DIRECTIVE — iPurpose Institutional Licensing: Technical Readiness & Minimum Licensable Product (Phase 0)
**Date:** 2026-11-17
**Status:** Engineering task brief for Codex on founder's Mac; not a command to deploy.
**Owner:** Codex/assigned engineer (execution). Founder CEO (product and release approval). ChatGPT (strategy/claims/curriculum coordination). Claude (branding/asset concepts).
**Code repository:** `polishedaffairsllc-byte/ipurpose-next`.
**Strategy source:** https://github.com/polishedaffairsllc-byte/ipurpose-next/pull/105 (draft; do **not** merge as a side effect of this task).
**Related existing tasks:** #108 technical readiness; #114 minimum licensable program; Claude creative issues #116–#118.
**Primary principle:** **Reuse what we already have. No new institutional SaaS platform, LMS/SSO integration, paid ads or consumer funnel redesign in Phase 0.**

## 1. Situation and decision
iPurpose's priority *commercial hypothesis* is licensing a bounded, non-clinical, institution-delivered Decision-to-Action program built on **Soul → Systems → AI™**, not selling app seats to students one by one. Its first product should be a **zero-integration curriculum package** usable by a university, workforce nonprofit or entrepreneurship cohort through existing instructors and LMS/classroom processes.

Suggested initial internal commercial scopes (UNVALIDATED—not live pricing or billing):
- 8-week institution-delivered cohort license: $3,500, up to 40 adults.
- Annual one-site license: $12,000, up to 250 adults (future, contingent).
- Managed 8-week pilot: $7,500 (separate high-service offer).
- University of Ghana proposal already promised an 8-week **fee-waived** pilot for up to 40 consenting students age 18+. **Do not change the offer, its site, emails, or any calendar/send workflow.** Institution has not approved the pilot.

Goal now: **Determine precisely which reusable capabilities/assets exist; produce a no-production-change technical readiness report and safe minimal content-delivery plan.** Avoid building infrastructure for hypothetical features or buyer requirements.

## 2. First action: protect the working environment
1. Inspect repository/worktree state, `git status`, remotes, branches, most recent commits, pending PRs, and existing tests. Preserve *all* pre-existing uncommitted edits, user files, and worktrees. Do not reset, clean, checkout on top of dirty changes, force-push, or overwrite. Use a separate isolated worktree/branch based on current remote main for analysis if needed.
2. Read the actual strategy and licensing docs from the **draft PR #105 branch**, not merely main: `strategy/20261117-institutional-pilot/docs/institutional-pilot-operating-plan-20261117.md`, `docs/institutional-licensing-offer-and-product-spec-20261117.md`, `docs/institutional-price-evidence-and-population-brief-20261117.md`, `docs/ug-pilot-charter-discussion-draft-20261117.md`, `docs/claude-creative-handoff-20261117.md`. Treat these as planning inputs, not already shipped capabilities.
3. Confirm PR #104 (customer-entry fixes with small-business positioning) remains **unmerged and unreleased** before recommending a deployment. Its copy conflicts with proposed institutional focus; report, don't merge.

## 3. Phase 0 audit — source-of-truth feature matrix
Inspect actual **main** implementations and tests (server/web/mobile), not only docs. For each required institutional deliverable, classify **SHIPPED & VERIFIED / PRESENT BUT UNVERIFIED / PARTIAL / ABSENT / NEEDS APPROVAL**. For every positive claim cite exact file/function/test and commit/branch; for each gap note the smallest safe fix and effort estimate.

Required matrix areas:
- Existing Clarity Check: entry, questions, result persistence/export, labels, required email gate, consent and retention; avoid claiming validated psychometrics.
- Existing mobile/web Compass and onboarding; native build status vs app-store approval; welcome emails only if current code and provider evidence support claims.
- Program assets already in repo: Week 1–2, eight-week roadmap, user prompts, reusable PDF/doc exports, existing licensed resources, slide or workbook templates; report missing assets honestly.
- Course delivery path: **document-only handoff** in PDF plus editable formats; document access control/versioning; facilitator vs participant separation; accessibility standards; whether partner can place materials in Canvas/Moodle/Blackboard/Google Classroom without any technical integration. *Never claim an LMS integration or SCORM exists without testing it.*
- Optional existing hosted web/app experience as **future add-on**, clearly separate from baseline paper/workbook course.
- Assessment/check-in: baseline/exit original 5-item reflection (not validated diagnosis); capture only voluntary non-sensitive data; participant-owned Decision-to-Action Plan.
- Institutional reporting: only de-identified/aggregated metrics with explicit cohort denominators, attrition, small-cell suppression, no instructor access to private personal reflections without an authorized role and consent.
- Data flows: Firebase/Firestore/Resend/GA4/third-party AI/service integrations, local data and logs, account erasure/export; identify data controller/processor uncertainty and student privacy review gates.
- Security, WCAG/accessibility, keyboard/mobile PDF usability, localization/Ghana context; do not assert external compliance certification.
- Pricing/contract entitlement: whether current checkout and subscription architecture can represent a B2B license; inventory only, **no payment collection changes**.
- Operational support: who would support partner facilitators, release cadence, document revision, issue/incident path and audit trail.

The objective is to decide whether the first license should be **100% curriculum files**, with optional iPurpose web access later, so technical cost stays minimal.

## 4. Deliverables now — no production changes
**A. Actual implemented-vs-missing matrix** with file pointers, test status and exact branch/commit, plus "what the institution can do on day one / what it cannot."

**B. Minimum Licensable Product (MLP) packaging plan**, not the final complete course: structured folder/file manifest for 8-week facilitator and participant packs; template/export options (accessible PDF and editable source), version header, branded cover placeholder, "internal draft" watermark, safe generic institution-neutral content; process for ingesting approved Claude designs without inventing training content. Identify what must be supplied by curriculum writer and approved before any customer-facing use.

**C. Synthetic cohort walkthrough** (no real users, staff, student records, sending emails, or writes to production): describe/test how a hypothetical cohort of up to 40 adults could receive a workbook, complete baseline, create a Decision-to-Action Plan, and return *aggregate* results using institution-controlled collection and a separate evaluation spreadsheet. If local mock tests are feasible, run and record exact commands and results; otherwise give blocking prerequisites and manual QA steps.

**D. Prioritized implementation backlog**:
- P0: blockers to a safe document-only institutional pilot / privacy/brand/licensing restrictions;
- P1: useful next features only after a buyer validates need (versioned exports, limited secure facilitator assets);
- P2: hosted cohort access, SSO, LMS integration, licensing seat enforcement, institutional dashboards (explicitly deferred unless evidence demands them).
List estimated engineering effort, non-engineering owner, external approvals, dependency, and expected direct recurring costs. No speculative rewrite.

**E. A concise handoff to Claude/ChatGPT/founder** specifying exactly what templates/materials are needed, recommended file formats and naming conventions, objective review criteria.

**F. Summary report** in `docs/institutional-technical-readiness-20261117.md` and (if appropriate) a technical-only draft PR from an isolated branch against main. No private data, access tokens, personal contact lists, or institution-specific secrets in repo.

## 5. Explicit prohibitions and approval gates
- **Do not deploy, merge PRs, update live website copy, change production environment variables, billing, Stripe, Firebase rules, email automations, Google/Meta ads, scheduled university sends, outreach queues or student data.**
- Do not send emails, invite students, publish a university-branded course, sign agreements, claim accreditation, or change previously offered University of Ghana pilot terms.
- Do not represent unbuilt facilitator content, app features, institutional dashboards, academic efficacy, GDPR/Ghana Act 843 compliance, or contract rights as complete.
- No institution-facing data collection or participant processing until written institution authorization, qualified privacy/legal review, relevant data handling agreements, and verified safe technical controls.
- Brand assets and participant-facing pedagogy need founder/content approval. Do not alter Soul → Systems → AI™ or make new claims.
- Avoid overwriting work from Claude. Do not ask Claude to implement code or ask Codex to redesign presentations. Codex owns engineering architecture and safe packaging after source assets are approved.
- Keep user data private; any tests should use synthetic values; no real payment/email provider calls.
- No spending or tool/hosting subscription purchases without founder approval.

## 6. Acceptance criteria / decision
**Phase 0 is done when**:
1. An evidence-linked, recent-code feature matrix exists and identifies all unverified assumptions;
2. A minimal zero-integration document delivery plan and file manifest exists;
3. Synthetic-only acceptance test plan shows how staff deliver and measure one pilot without private participant data in iPurpose;
4. Technical/security/accessibility gaps have P0/P1/P2 classifications with dependencies and effort;
5. Main, production, existing app releases, GitHub schedules and institutional outreach remain unchanged;
6. Founder has a single, concrete **GO to prototype / HOLD for legal or content / STOP** recommendation.

**Do not move into full build, institutional licensing enforcement, native-app development, live testing or deployment until the founder approves a separately scoped Phase 1.**

## 7. Collaborator boundaries
**Founder:** authorizes positioning, institutional commitments, pricing, licensing rights, budget and production.
**ChatGPT:** maintains operating plan, market positioning, research/evaluation boundaries and curriculum architecture during active sessions.
**Claude:** drafts institutional messaging, editable sales designs, facilitator and learner visual templates. Separate creative handoff in PR #105.
**Codex:** verifies current code, produces readiness analysis, tests safely, maps asset formats and packaging, and later implements only specifically approved features.
**Qualified reviewers:** legal/privacy/accessibility/evaluation when appointed. An AI-generated checklist is not a substitute for required institutional or legal approval.

Return an actionable report with exact paths and evidence, and surface blockers; do not ask the founder to locate files already available in the repository or rerun tests that you can run yourself.
