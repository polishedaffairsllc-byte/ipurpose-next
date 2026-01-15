import React from "react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata = {
  title: "Contact — iPurpose",
};

export default function ContactPage() {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1>Contact</h1>
      <p>
        For press, partnerships, or Google review inquiries:
      </p>
      <ul>
        <li>Email: <a href="mailto:renita@ipurposesoul.com">renita@ipurposesoul.com</a></li>
        <li>Phone: (470) 377-2870</li>
      </ul>
      <p>If you'd like company documents (registration or investor validation), email renita@ipurposesoul.com and I will provide secure access.</p>
    </main>
    
    <Footer />
    </>
  );
}
