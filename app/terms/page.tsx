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
          These Terms govern your use of the iPurpose LLC website and services. iPurpose currently provides an early-stage prototype and demonstration environment for evaluation and educational purposes. By accessing or using this site, you agree to these Terms.
        </p>

        <h2>Use of the Prototype</h2>
        <p>
          iPurpose is an early-stage product and may contain incomplete or evolving features. You may use the platform and any demo accounts provided solely for evaluation, educational, or review purposes. You agree not to misuse, disrupt, reverse-engineer, copy, or exploit the service or its underlying systems.
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
          For questions or legal requests, contact:<br />
          Renita Hamilton — <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a>
        </p>

        <p style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #ddd" }}>
          © iPurpose LLC. All rights reserved.
        </p>
      </main>
    
    <Footer />
    </>
  );
}
