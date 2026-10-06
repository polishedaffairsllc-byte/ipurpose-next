import React from "react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy — iPurpose",
};

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main className="text-body" style={{ padding: 32, maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
        <h1 className="text-h2">Privacy Policy — iPurpose</h1>

        <p><strong>Effective date: October 5, 2026</strong></p>

        <h2>Information we collect</h2>
        <p>
          We collect information you choose to provide, such as your name and email address when you submit forms (for example, the Clarity Check) or create an account.
        </p>
        <p>
          We also use cookies or similar technologies to maintain secure sessions and keep you signed in.
        </p>

        <p>{"If you take the Purpose Check in iPurpose Compass, we save your selected answers, Purpose signals, audience, desired impact and Purpose Direction to your authenticated profile. Compass uses these results to personalize your conversations. If you explicitly choose to save the optional written reflection, we store it and allow Compass to use it; otherwise your reflection is not sent to our server or saved. You can replace your results by retaking the Purpose Check or delete your Purpose results and saved reflection from Account. Deleting your account also removes them."}</p>
        <p>{"The Purpose profile we show you combines your saved answers to the six Purpose questions, resulting signals, selected audience and impact, and completion and update information with supporting profile interpretation. Home, Account and the Purpose tab use the same saved results; we do not create a separate duplicate Purpose record for each screen."}</p>
        <p>{"We also record whether an account or contact email address has been verified as able to receive mail. Account verification uses Firebase Authentication. If you provide an email address for Clarity results without creating an account, we may send a separate confirmation link and record the confirmation status. Guest confirmation links are valid for 24 hours and can be used once. Replacing a link invalidates the previous link. We store a hash of the guest confirmation token rather than the token itself."}</p>
        <p>{"When you use public forms, our servers receive network and request information, including an IP address. To help prevent automated submissions, excessive requests and duplicate submissions, we create temporary security records containing timestamps, request counts, token hashes and hashed identifiers derived from IP addresses, email addresses or submitted content. These hashes help recognize related requests and are not a guarantee of anonymity. Existing contact or lead records may also contain request context such as an IP address, browser information and referring page."}</p>

        <p>{"In mobile builds with Firebase Analytics enabled, we use measurements such as app launches, sessions and feature events to understand use and reliability. Firebase assigns an app-instance identifier for these measurements. Measurements can include general region information derived from network data. Purpose start and completion events do not contain your Purpose answers or written reflection. The mobile configuration disables advertising-ID collection and ad-personalization signals."}</p>

        <h2>How we use your information</h2>
        <p>We use your information to:</p>
        <ul style={{ marginLeft: 20, marginBottom: 16 }}>
          <li>Provide access to the platform and its features</li>
          <li>Respond to your requests or inquiries</li>
          <li>Improve the reliability and performance of the site</li>
        </ul>
        <p>{"We do not use your information for third-party advertising or tracking across other websites. If you explicitly opt in, we may send you our own marketing communications, subject to email verification and your opt-out choices."}</p>

        <p>{"We use saved Purpose information to show your ongoing profile and personalize Compass. When you use Compass, relevant saved Purpose context, including a reflection you explicitly chose to save, may be sent to our AI service provider to generate a response."}</p>
        <p>{"Email verification establishes whether someone can receive mail at an address. It is separate from checks intended to protect public forms against bots or spam. An unusual-looking name or email address does not by itself mean a submission is invalid, and verification does not guarantee that a submission is legitimate."}</p>
        <p>{"Unverified users can still sign in and use their available features, including Clarity results, Purpose and Compass. Verification and requested results emails are service communications. Confirming an email address does not subscribe you to marketing. Marketing requires a separate explicit opt-in, a verified reachable address and compliance with your opt-out choices. We do not send marketing merely because you entered or confirmed an address."}</p>

        <h2>Sharing</h2>
        <p>
          We do not sell your personal information. We may share limited information with service providers (such as hosting and database providers) only as necessary to operate the platform.
        </p>

        <p>{"Service providers supporting these features include Firebase for authentication and data storage, our hosting provider for requests, our email delivery provider for service communications, and our AI service provider for Compass responses. We provide information to these providers as needed to perform those services. We do not sell Purpose answers, reflections or email verification information."}</p>

        <h2>Data retention</h2>
        <p>
          We keep your information only as long as necessary to provide the service or meet legal obligations. You may request deletion of your information at any time.
        </p>

        <p>{"We keep your saved Purpose profile and any reflection you chose to save while they remain part of your account. Retaking Purpose replaces the saved profile. Deleting Purpose from Account removes that saved profile and reflection. Earlier Compass conversations may still contain information previously discussed or used in a response; deleting or replacing Purpose does not erase those earlier conversations. They remain subject to the separate conversation-history and account-deletion controls."}</p>
        <p>{"We retain email verification status with the associated account or contact while it remains in our service. Expiry of a guest confirmation link makes the link unusable; it does not automatically delete the contact or its verification record. Pending token hashes are cleared on successful confirmation or replaced when a new link is issued. Deleting an account also removes the email verification records associated with its address. Guests can request deletion of their contact and verification information using the privacy contact below."}</p>
        <p>{"Temporary public-form challenge records expire after two hours, duplicate-submission records after ten minutes, and rate-limit records twenty minutes after their last update. Expired records stop being used for those checks. We schedule their automatic deletion, which runs asynchronously, so records may remain in storage for a period after expiry. These short retention periods apply to the temporary security records, not to the contact message, requested results, account, conversation history or continuing email verification status. Those records follow their separate purposes and deletion controls."}</p>

        <h2>Your choices</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by contacting us.
        </p>

        <p>{"You can retake Purpose, delete your saved Purpose results and reflection from Account, or delete your account. Saving the optional reflection is your choice. You can use Clarity results without creating a full account, and marketing consent remains a separate choice from confirming your email address. You may contact renita@ipurposesoul.com to request access, correction or deletion of contact information, including guest email verification records."}</p>

        <h2>Security</h2>
        <p>
          We take reasonable measures to protect your information, but no method of transmission or storage is completely secure.
        </p>

        <h2>Children</h2>
        <p>
          iPurpose is not intended for children under 13, and we do not knowingly collect personal information from children under 13.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. Updates will be posted on this page with a revised effective date.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions or requests, contact: <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a>
        </p>
      </main>

      <Footer />
    </>
  );
}
