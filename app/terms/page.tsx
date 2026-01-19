import React from "react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata = {
  title: "Terms of Service — iPurpose",
};

export default function TermsPage() {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: 32, maxWidth: 900, margin: "0 auto", lineHeight: 1.8, fontSize: '24px' }}>
        <h1>Terms of Service</h1>
        
        <p><strong>Effective Date: December 2025</strong></p>

        <h2>Welcome</h2>
        <p>
          These Terms govern your use of the iPurpose LLC website and services. By accessing or using this site, you agree to these Terms.
        </p>

        <h2>Use of Services</h2>
        <p>
          iPurpose provides educational tools, guided frameworks, and evolving digital experiences designed to support clarity, reflection, and aligned decision-making. As the platform grows, features and content may continue to develop. You may use the platform solely for personal evaluation, educational, or review purposes. You agree not to misuse, disrupt, reverse-engineer, copy, or exploit the service or its underlying systems.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          All content, design, frameworks, methods, and materials on this site are the intellectual property of iPurpose LLC. You may not copy, reproduce, distribute, or reuse any materials without explicit written permission.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, iPurpose LLC is not liable for any indirect, incidental, consequential, or special damages arising from your use of the site, prototype, or materials provided.
        </p>

        <h2>No Professional Advice</h2>
        <p>
          Content provided on this site is for educational and informational purposes only and does not constitute legal, financial, medical, or professional advice.
        </p>

        <h2>Contact</h2>
        <p>
          For legal inquiries, contact: <a href="mailto:legal@ipurposesoul.com">legal@ipurposesoul.com</a><br />
          For general inquiries, contact: <a href="mailto:info@ipurposesoul.com">info@ipurposesoul.com</a>
        </p>

        <p style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #ddd" }}>
          © iPurpose LLC. All rights reserved.
        </p>
      </main>
    
    <Footer />
    </>
  );
}
