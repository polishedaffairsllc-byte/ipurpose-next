# Purpose privacy draft and release gates

Purpose disclosure, Compass-history caveat, marketing checkbox, and neutral welcome subject/body approved by Renita on October 4, 2026. Publication and store declaration review remain separate steps. Signed test builds and testing-channel uploads are authorized after the iOS Firebase configuration gate is resolved; public production release is not authorized.

> If you take the Purpose Check in iPurpose Compass, we save your selected answers, Purpose signals, audience, desired impact and Purpose Direction to your authenticated profile. Compass uses these results to personalize your conversations. If you explicitly choose to save the optional written reflection, we store it and allow Compass to use it; otherwise your reflection is not sent to our server or saved. You can replace your results by retaking the Purpose Check or delete your Purpose results and saved reflection from Account. Deleting your account also removes them.

Actual data linked to authenticated Firebase UID: structured answer IDs for six questions; ranked signal labels/points; selected audience labels; impact ID/label/generation phrase; generated direction; Check version; completion/update timestamps; optional written reflection only with the explicit save checkbox. Firestore stores the nested record in users/{uid}. Compass sends bounded selected context through the existing AI flow/provider; both structured Purpose results and a saved reflection can be included. Existing conversation history can retain text independently discussed in Compass until that history/account is deleted. No raw answers or reflection enter the new analytics events. The two native events contain only their event names and follow existing analytics configuration. No new local draft/reflection storage was added.

The optional reflection save checkbox defaults off and says: “Save this reflection so Compass can remember it.” Helper: “If you leave this unchecked, your words aren't saved.” Those strings and all new Purpose UI/generation copy live in mobile/src/lib/purposeCheckCopy.ts. The approved marketing checkbox/welcome copy lives in mobile/src/lib/clarityLifecycleCopy.ts on the merged release baseline.

| Required gate | Current evidence/status |
| --- | --- |
| Privacy policy updated and approved by Renita | Disclosure approved October 4, 2026; policy publication pending |
| Apple App Privacy reviewed | Data inventory above; pending owner review |
| Google Play Data Safety reviewed | Data inventory above; pending owner review |
| Dedicated Purpose deletion tested | Mock production repository and actual Account confirmation interaction passed; live/device confirmation pending |
| Full account deletion tested | Actual production data-removal code passed with fake Purpose/reflection fixtures; live Firebase Auth/device confirmation pending |
| Physical-device testing completed | Pending; JavaScript exports and mock UI tests do not satisfy this |
| Final marketing checkbox copy approved | Approved exactly as drafted by Renita, October 4, 2026 |
| Final neutral welcome copy approved | Approved exactly as drafted by Renita, October 4, 2026 |

Signed test builds and testing-channel uploads are authorized after the iOS Firebase gate is resolved. No public production release or policy deployment is authorized or claimed. Store disclosure review and physical-device confirmation remain pending.
