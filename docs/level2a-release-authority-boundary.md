# Level 2A release authority boundary — implementation gate

**Current mode: OFF.** The trusted eligibility workflow is manual and read-only.
An eligible classifier result is NOT an approval, merge authorization, or release.

## Enforced today
- Production `main` requires PRs and six GitHub Actions checks, including the all-PR Vercel deployment-path audit.
- Level 2A workflow tokens have read-only permissions; default-off and emergency-stop gates reject unconfigured execution.
- New all-PR regression tests detect added Level 2A write privileges and unsafe deployment/merge commands.

## Not enforced yet — activation blockers
1. **Independent merge authority:** a separate identity with narrowly scoped permission must authorize only a verified, immutable low-risk PR SHA after required checks. The authoring agent must not control its credential, workflow, approval policy, or emergency stop. Manual founder approval remains required for other changes.
2. **Protected configuration:** repository administrators must control activation and emergency-stop settings, not the authoring agent. Test changes to each setting and ensure fail-closed behavior.
3. **Vercel bypass:** Hobby does not provide the desired deployment-policy restriction. Git integration still deploys merged `main`; users with Vercel CLI/API credentials can publish independently. Inventory, revoke or isolate such credentials and restrict team access before claiming no bypass. Repository tests alone cannot enforce this.
4. **End-to-end evidence:** demonstrate safe PR approved, sensitive PR denied, failing checks denied, changed SHA denied, emergency stop denied, and direct-publish attempt denied. Record immutable run IDs and deployment IDs.

**Do not enable unattended production publishing** until all four blockers have verified evidence. Do not make the manual eligibility check a required PR status check: it is dispatch-only and would block ordinary merges.
