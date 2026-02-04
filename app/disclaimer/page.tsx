import type { Metadata } from "next";
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: "Disclaimer | iPurpose™",
  description: "Important information about the use of iPurpose platform and services.",
};

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <PublicHeader />
      
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 lg:p-12 shadow-lg">
          <h1 className="font-italiana text-[#4b4e6d] mb-8" style={{ fontSize: '60px' }}>
            Disclaimer
          </h1>
          
          <p className="text-gray-600 mb-12" style={{ fontSize: '24px' }}>
            Last updated: February 4, 2026
          </p>

          <div className="space-y-8 text-gray-700" style={{ fontSize: '28px', lineHeight: '1.6' }}>
            <p>
              The information provided on iPurpose (the "Platform") is intended for educational, informational, and reflective purposes only. By accessing or using this Platform, you acknowledge and agree to the terms of this Disclaimer.
            </p>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Not Medical, Mental Health, or Legal Advice
              </h2>
              <p className="mb-4">
                iPurpose does not provide medical, psychological, psychiatric, legal, or financial advice.
              </p>
              <p className="mb-4">
                The content, tools, reflections, prompts, AI-guided insights, and programs available on this Platform are not a substitute for professional care, diagnosis, treatment, or advice from a licensed physician, mental health professional, attorney, or other qualified provider.
              </p>
              <p>
                Always seek the advice of a qualified professional regarding any medical, mental health, legal, or financial concerns you may have. Never disregard professional advice or delay seeking it because of something you have read or experienced on this Platform.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Personal Responsibility & Self-Directed Use
              </h2>
              <p className="mb-4">
                Your participation in iPurpose is voluntary and self-directed.
              </p>
              <p className="mb-3">You acknowledge that:</p>
              <ul className="list-disc pl-8 space-y-2 mb-4">
                <li>Your decisions, actions, and outcomes are your own</li>
                <li>You are responsible for how you interpret and apply any insights, reflections, or guidance</li>
                <li>Results are not guaranteed and will vary based on individual circumstances, effort, context, and external factors</li>
              </ul>
              <p>
                The Platform is designed to support reflection, clarity, and personal agency, not to make decisions for you.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                AI-Guided Content & Limitations
              </h2>
              <p className="mb-4">
                Some features of iPurpose include AI-assisted tools and guidance.
              </p>
              <p className="mb-3">You understand and agree that:</p>
              <ul className="list-disc pl-8 space-y-2 mb-4">
                <li>AI-generated responses are informational and exploratory, not authoritative</li>
                <li>AI outputs may be incomplete, imperfect, or contextually limited</li>
                <li>You are responsible for evaluating, validating, and applying any AI-generated content appropriately</li>
              </ul>
              <p>
                AI tools on this Platform are intended to augment human reflection and insight, not replace professional judgment or lived discernment.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Coaching, Programs, & Educational Content
              </h2>
              <p className="mb-3">
                Any coaching-style language, programs, or frameworks offered through iPurpose are:
              </p>
              <ul className="list-disc pl-8 space-y-2 mb-4">
                <li>Educational in nature</li>
                <li>Not therapy or clinical treatment</li>
                <li>Not intended to diagnose or treat any condition</li>
              </ul>
              <p>
                Participation does not create a therapist–client, doctor–patient, attorney–client, or fiduciary relationship.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                No Guarantees or Warranties
              </h2>
              <p className="mb-4">
                While iPurpose is designed with care and intention, the Platform is provided "as is" and "as available."
              </p>
              <p className="mb-3">We make no guarantees regarding:</p>
              <ul className="list-disc pl-8 space-y-2 mb-4">
                <li>Specific outcomes or results</li>
                <li>Accuracy, completeness, or applicability of content</li>
                <li>Continuous availability or error-free operation</li>
              </ul>
              <p>
                Your use of the Platform is at your own discretion and risk.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                External Links & Third-Party Resources
              </h2>
              <p className="mb-4">
                The Platform may include links to third-party websites, tools, or resources.
              </p>
              <p className="mb-3">iPurpose is not responsible for:</p>
              <ul className="list-disc pl-8 space-y-2 mb-4">
                <li>The content, accuracy, or practices of third-party sites</li>
                <li>Any outcomes resulting from your use of third-party resources</li>
              </ul>
              <p>
                Accessing external resources is done at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Limitation of Liability
              </h2>
              <p className="mb-4">
                To the fullest extent permitted by law, iPurpose and its creators, operators, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from or related to your use of the Platform.
              </p>
              <p>
                This includes, but is not limited to, personal decisions, emotional responses, business outcomes, or life changes made in connection with Platform content.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                If You Are Experiencing Distress
              </h2>
              <p className="mb-4">
                If you are experiencing acute emotional distress, thoughts of self-harm, or a mental health emergency, please seek immediate help from a qualified professional or contact local emergency services.
              </p>
              <p>
                If you are in the United States, you may call or text <strong className="text-[#4b4e6d]">988</strong> for the Suicide & Crisis Lifeline. If you are outside the U.S., please contact your local emergency number or a trusted support resource.
              </p>
            </section>

            <section>
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Contact
              </h2>
              <p className="mb-3">
                If you have questions about this Disclaimer or the Platform, you may contact:
              </p>
              <p>
                Support Email:{' '}
                <a 
                  href="mailto:support@ipurpose.com" 
                  className="text-[#9c88ff] hover:text-[#a78bfa] transition-colors underline"
                >
                  support@ipurpose.com
                </a>
              </p>
            </section>

            <section className="pt-8 border-t border-gray-200">
              <h2 className="font-italiana text-[#4b4e6d] mb-4" style={{ fontSize: '40px' }}>
                Acceptance of This Disclaimer
              </h2>
              <p>
                By using this Platform, you acknowledge that you have read, understood, and agreed to this Disclaimer.
              </p>
            </section>

            <section className="pt-8 mt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 italic" style={{ fontSize: '30px' }}>
                This platform is designed to support—not replace—professional care.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
