# Claude v2.2 Package — Final QA and Codex Phase 1 Handoff
**Date:** November 17, 2026
**Decision:** **GO to internal, isolated Weeks 1–2 document packaging and synthetic QA** only. **NO external distribution, production changes, live participants, full eight-week build, or licensing sale.**
**Source:** founder-uploaded `files (9).zip` (not yet committed to repo): 4 editable DOCX + 1 editable PPTX, plus five corresponding review PDFs. Packaging instructions remain in `docs/institutional-phase1-weeks1-2-prototype-scope-20261117.md`.

## What was directly inspected
- One-page institutional concept brief, three-page facilitator guide, three-page Week 1–2 participant workbook including 30 Values Cards, three-page Decision-to-Action workbook/summary, eight-slide institutional deck; PDFs and editable sources all open.
- The supplied PDFs have no text outside page bounds and no obvious clipped page content. The deck contains editable text shapes. All PDFs have **zero interactive AcroForm fields**. PDF structure exists, but tagging quality and accessible interaction were **not** certified.
- Week 1 three-candidate decision grid, alternative decision prompts, Week 2 values-sort handout, two strength/example spaces, 60-minute core and 90-minute optional facilitation, optional/private sharing, nonclinical disclaimers and DRAFT labeling are present.
- NACE/Strada cited as evidence of a career-guidance gap, **not** iPurpose efficacy.

## Important newly detected portability defect
The editing files reference Italiana, Marcellus and Source Sans 3; they are unavailable on the independent QA machine. Substituting default fonts materially changes the Word pagination:
| Editable document | Supplied review PDF | Re-rendered from DOCX with font substitution |
|---|---:|---:|
| Concept brief | 1 | **2** |
| Facilitator guide | 3 | **5** |
| Participant workbook | 3 | **5** |
| Decision-to-Action package | 3 | **4** |

Slides also shift under font fallback: in independent PPTX rendering, slide 6 header wraps into the gold rule and slide 7's Plan Completion card is cramped/overlapped. The supplied PDFs render correctly. **Codex must make editable files portable under approved font fallback OR clearly separate fixed PDF distribution copies from environment-sensitive editable masters.** Never distribute font binaries. Confirm actual document counts, readability and PowerPoint card/title clearances on the target office environment.

## Ghana charter reconciliation — small remaining content edits
The one-page summary now carries decision, 1–2 pathways, one verified source, reason, first action/date/support, obstacle/response, optional AI note and next step. The original proposed UG charter also expects:
- participant strengths or needs/constraints explicitly present on the final summary (currently only in worksheets),
- an action **within 14 days**, and
- a clear human help/referral contact approved by UG, beyond generic support.
Add condensed appropriate fields or record a founder-approved exception. No partner content or student data without approval; existing fee-waived scope unchanged.

## Other Phase 1 acceptance gates
- PDF fields absent: export genuine tested fillable PDFs if contracted/specified, or accurately label current PDFs *printable* and provide Word-editable versions. Do **not** advertise them as digitally fillable yet.
- DOCX automated a11y audit reports medium-level unmarked table-header findings; many are layout tables. Review semantics and table structure manually, and complete actual screen-reader/PDF tagging/tab order testing before external delivery.
- Distinguish structural and printable accessibility from device/LMS integration; neither LMS nor mobile use is verified by these assets.
- Include actual file inventory, checksums/versions, reproducible exports and independent render comparison; use synthetic data only.
- Keep the contact `renita@ipurposesoul.com` temporary and the generic 20-minute CTA internal until founder confirms. Third-font exception requires founder brand approval.
- No live deployment, code changes, university email schedule changes, legal licensing, payment, user data, app/student accounts, buyer promises or Weeks 3–8 build.

## Owners and outcome
Claude: editable canonical copy/design and any content correction, without external send.
ChatGPT: Ghana/claims/content QA.
Codex: isolated v0.1 packaging, format fallback, real form/accessibility tests, syntax/visual QA, synthetic walkthrough, P0/P1/P2 findings.
Founder: design/font/contact scope approvals and later external release.

**Codex Phase 1 return:** versioned two-week prototype with editable + fixed printable files, test log, fallback behavior demonstration, gaps/limits register, and specific GO/HOLD recommendation for controlled buyer concept review. Do not call this an institutional-ready license yet.
