import React from "react";
import PublicHeader from "../components/PublicHeader";

export const metadata = {
  title: "Terms of Service — iPurpose",
};

export default function TermsPage() {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Terms of Service</h1>
      <p>Effective date: December 2025</p>

      <section>
        <h2>Welcome</h2>
        <p>
          These Terms govern your use of iPurpose LLC's prototype website and services. This site currently hosts an early-stage
          product for demonstration and reviewer purposes. By accessing iPurpose, you agree to these Terms.
        </p>
      </section>

      <section>
        <h2>Use of prototype</h2>
        <p>
          iPurpose is provided as an early-stage product and may contain incomplete features. You may use the demo account provided by
          iPurpose for evaluation and reviewer purposes only. Do not attempt to reverse-engineer or misuse the service.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          All content and IP displayed on this site are the property of iPurpose LLC. Unauthorized copying or reuse is not permitted.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, iPurpose LLC is not liable for indirect, incidental, or consequential damages resulting
          from use of the prototype or the reviewer materials provided.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For questions or legal requests: Renita Hamilton — <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a>.
        </p>
      </section>

      <footer style={{ marginTop: 24, color: "#666" }}>
        <small>© iPurpose LLC</small>
      </footer>
    </main>
    </>
  );
}
