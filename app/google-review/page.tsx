import React from "react";
import styles from "./GoogleReview.module.css";

export const metadata = {
  title: "iPurpose — Google Review",
  description: "Materials for Google for Startups Cloud Program review",
};

export default function GoogleReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <img alt="iPurpose logo" src="/logo192.png" className={styles.logo} />
          </div>
          <div className={styles.headline}>
            <h1>iPurpose — AI-driven purpose & systems (Prototype)</h1>
            <p className={styles.lead}>
              AI-powered coaching and task automation that helps people define meaningful goals and maintain daily
              systems. This page is created to help reviewers validate iPurpose LLC for the Google for Startups Cloud
              Program.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.secondary} href="mailto:renita@ipurposesoul.com">Contact reviewer</a>
            </div>
            <div className={styles.trustRow}>
              <span className={styles.pill}>Prototype</span>
              <span className={styles.pill}>No public demo video</span>
              <span className={styles.pill}>Reviewer-friendly</span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.container}>
        <h2>Quick summary</h2>
        <ul className={styles.features}>
          <li><strong>Discover:</strong> Conversational prompts to surface priorities and clarify goals.</li>
          <li><strong>Act:</strong> Templates & lightweight automation to turn priorities into daily systems.</li>
          <li><strong>Track:</strong> Simple progress tracking and explainable AI insights to help users reflect.</li>
        </ul>
      </section>

      <section className={styles.container}>
        <h2>How to review (3 quick steps)</h2>
        <ol className={styles.steps}>
          <li>Contact Renita at <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a> if you need a live demo.</li>
          <li>Use the demo account to explore interactive flows: <strong>demo@ipurposesoul.com</strong> / <strong>DemoPass123</strong>.</li>
          <li>If investor validation or registration docs are needed, email the contact above to request secure access.</li>
        </ol>
      </section>

      <section className={styles.container}>
        <h2>Demo video</h2>
        <p className={styles.note}>
          No public/unlisted demo video is published at this time. Please email <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a>
          to request a recorded walkthrough or to schedule a live demo.
        </p>
      </section>

      <section className={styles.container}>
        <h2>Screenshots</h2>
        <p className={styles.note}>
          Screenshots are not publicly posted. If you would like screenshots or additional artifacts for review,
          please request them via email and we will provide access.
        </p>
      </section>

      <section className={styles.container}>
        <h2>Reviewer contact & notes</h2>
        <p>
          Renita Hamilton — Founder & CEO<br />
          <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a> — (470) 377-2870
        </p>
        <p>Investor validation: None at this time. Documentation available upon request.</p>
      </section>

      <footer className={styles.footer}>
        <div>© iPurpose LLC</div>
        <div className={styles.links}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </main>
  );
}
