import React from "react";
import PublicHeader from "../components/PublicHeader";

export const metadata = {
  title: "Privacy Policy — iPurpose",
};

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1>Privacy Policy</h1>
      <p>
        This site collects only minimal demo data and uses cookies for session handling. For production we follow
        industry-standard data protection practices. For full policy and GDPR/CCPA compliance, contact
        <a href="mailto:renita@ipurposesoul.com"> renita@ipurposesoul.com</a>.
      </p>
      <p>We do not publish or share service-account keys or private credentials.</p>
    </main>
    </>
  );
}
