# Draft App Review reply — November 17 rejection (NOT READY TO SEND)

This is a conditional template. **Do not send or paste into App Store Connect until a signed, submitted build and runtime test evidence match every statement.** Do not put reviewer credentials in this file.

Hello App Review Team,

Thank you for reviewing iPurpose and for identifying the issues with OpenAI data disclosure, account creation, and reviewer sign-in. We have prepared corrections to address the three findings in your November 17 message. The replacement build is **[confirm version and build after upload]**.

**Guidelines 5.1.1(i) and 5.1.2(i) — Privacy and third-party AI sharing**

iPurpose uses OpenAI for optional Compass responses and content-safety processing. Before allowing AI messages, the app shows a dedicated disclosure naming OpenAI, explaining that user-entered messages, relevant conversation history, and saved context (which can include display name, timezone, Clarity and Purpose results, priorities, check-ins, reflections, and relevant session information) may be sent. The user must expressly select **Allow OpenAI data sharing** before provider requests. Users may choose **Decline / Not now** and continue using non-AI features, or withdraw permission later from **Account**. Our privacy policy at https://ipurposesoul.com/privacy explains collection, sources, purposes, third-party sharing, provider protections, and retention. **[After testing, add the exact screen-navigation steps and recorded evidence that no provider request is sent without current permission.]**

**Guideline 2.1(a) — New account creation on iPad**

We updated the account creation and first-run admission flow so a newly registered account can complete setup and continue into onboarding. **[After verification, specify device/model, OS, whether the iPhone-compatible app ran on iPad in compatibility mode, installed candidate build, and successful create-account → acknowledgement → onboarding result. If simulator only, explicitly state simulated test and do not claim Apple hardware reproduction.]**

**Guideline 2.1 — Demo-account access**

We have verified the reviewer account can sign in and access the relevant application features on **[exact signed candidate version/build/device, after validation]**. The current reviewer username and password have been entered **only in App Store Connect's App Review Information**. On the login screen, choose **Sign In** and enter those credentials. **[Add any necessary non-secret steps for completing first-run setup and accessing Compass.]**

Thank you for reviewing the corrected submission.

iPurpose Team

---

**SEND GATE:** [ ] Confirm the actual selected processed App Store Connect build and exact version/build. [ ] Sign-up/iPad QA evidence exists and is accurately described. [ ] Native Allow/Decline/Withdraw/privacy evidence exists. [ ] Rotated demo credentials work and are saved securely in ASC. [ ] Founder expressly approves this final text and submission.