import React from "react";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact — iPurpose",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black/70 via-black/80 to-black">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.25),_transparent_50%),_radial-gradient(circle_at_bottom,_rgba(232,150,122,0.2),_transparent_45%)]"
        aria-hidden="true"
      />

      <div className="relative">
        <PublicHeader />

        <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-20">
          <ContactForm />
        </main>

        <Footer />
      </div>
    </div>
  );
}
