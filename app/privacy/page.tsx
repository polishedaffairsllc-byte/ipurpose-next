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
      <main style={{ padding: 32, maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
        <h1>Privacy Policy — iPurpose</h1>
        
        <p><strong>Effective date: January 15, 2026</strong></p>
        
        <h2>Information we collect</h2>
        <p>
          We collect information you choose to provide, such as your name and email address when you submit forms (for example, the Clarity Check) or create an account.
        </p>
        <p>
          We also use cookies or similar technologies to maintain secure sessions and keep you signed in.
        </p>
        
        <h2>How we use your information</h2>
        <p>We use your information to:</p>
        <ul style={{ marginLeft: 20, marginBottom: 16 }}>
          <li>Provide access to the platform and its features</li>
          <li>Respond to your requests or inquiries</li>
          <li>Improve the reliability and performance of the site</li>
        </ul>
        <p>We do not use your information for advertising or tracking across other websites.</p>
        
        <h2>Sharing</h2>
        <p>
          We do not sell your personal information. We may share limited information with service providers (such as hosting and database providers) only as necessary to operate the platform.
        </p>
        
        <h2>Data retention</h2>
        <p>
          We keep your information only as long as necessary to provide the service or meet legal obligations. You may request deletion of your information at any time.
        </p>
        
        <h2>Your choices</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by contacting us.
        </p>
        
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
