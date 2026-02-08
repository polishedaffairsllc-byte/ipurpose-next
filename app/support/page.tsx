import Link from "next/link";
import { Metadata } from "next";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Support | iPurpose",
  description:
    "Get support from iPurpose. Find quick links, FAQs, and ways to reach us when you need help.",
  robots: "index, follow",
  openGraph: {
    title: "Support | iPurpose",
    description:
      "Get support from iPurpose. Find quick links, FAQs, and ways to reach us when you need help.",
    type: "website",
  },
};

export default function SupportPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black/70 via-black/80 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.25),_transparent_50%),_radial-gradient(circle_at_bottom,_rgba(232,150,122,0.2),_transparent_45%)]" aria-hidden="true" />

      <div className="relative">
        <PublicHeader />

        <main className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-20 space-y-10 text-white/90">
          <section className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60" style={{ fontSize: '35px' }}>Support</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-italiana text-white" style={{ fontSize: '35px' }}>We are here to help</h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto" style={{ fontSize: '35px' }}>
              Calm, clear guidance for account access, billing questions, and using iPurpose.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="mailto:support@ipurposesoul.com"
                className="px-5 py-3 rounded-full font-marcellus bg-white text-black shadow-lg hover:shadow-xl transition-shadow"
                style={{ fontSize: '35px' }}
              >
                Email support@ipurposesoul.com
              </a>
              <Link
                href="/contact"
                className="px-5 py-3 rounded-full font-marcellus border border-white/30 text-white hover:border-white/60 transition-colors"
                style={{ fontSize: '35px' }}
              >
                Contact form
              </Link>
            </div>
            <p className="text-sm text-white/60" style={{ fontSize: '35px' }}>Typical response: within 1 business day.</p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-sm">
              <h2 className="text-xl font-marcellus text-white" style={{ fontSize: '35px' }}>Account & Access</h2>
              <p className="text-white/75" style={{ fontSize: '35px' }}>Trouble signing in or resetting your session?</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Sign in</Link>
                <Link href="/signup" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Create an account</Link>
                <Link href="/enrollment-required" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Membership access</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-sm">
              <h2 className="text-xl font-marcellus text-white" style={{ fontSize: '35px' }}>Billing & Membership</h2>
              <p className="text-white/75" style={{ fontSize: '35px' }}>Need receipts or plan updates? We can help.</p>
              <div className="space-y-2">
                <Link href="/program" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>View program details</Link>
                <Link href="/starter-pack" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Starter Pack</Link>
                <Link href="/ai-blueprint" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>AI Blueprint</Link>
                <a href="mailto:support@ipurposesoul.com" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Billing questions</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-sm">
              <h2 className="text-xl font-marcellus text-white" style={{ fontSize: '35px' }}>Guides & Resources</h2>
              <p className="text-white/75" style={{ fontSize: '35px' }}>Quick starts for clarity and next steps.</p>
              <div className="space-y-2">
                <Link href="/clarity-check" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Clarity Check</Link>
                <Link href="/discover" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Discover the framework</Link>
                <Link href="/about" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>About iPurpose</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-sm">
              <h2 className="text-xl font-marcellus text-white" style={{ fontSize: '35px' }}>Privacy & Terms</h2>
              <p className="text-white/75" style={{ fontSize: '35px' }}>Your data and safety are important to us.</p>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Terms of Service</Link>
                <Link href="/contact" className="block text-sm text-white/80 hover:text-white" style={{ fontSize: '35px' }}>Report a concern</Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-marcellus text-white mb-3" style={{ fontSize: '35px' }}>What to include</h2>
            <p className="text-white/75 mb-4" style={{ fontSize: '35px' }}>To help us respond quickly, share the email you used to sign up, the page you were on, and any error messages or screenshots.</p>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="px-3 py-2 rounded-full border border-white/15" style={{ fontSize: '35px' }}>Account email</span>
              <span className="px-3 py-2 rounded-full border border-white/15" style={{ fontSize: '35px' }}>Device + browser</span>
              <span className="px-3 py-2 rounded-full border border-white/15" style={{ fontSize: '35px' }}>Steps taken</span>
              <span className="px-3 py-2 rounded-full border border-white/15" style={{ fontSize: '35px' }}>Error message</span>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
