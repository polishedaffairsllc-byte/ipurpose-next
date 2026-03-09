import type { Metadata } from "next";
import { cookies } from 'next/headers';
import Link from 'next/link';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import VideoBackground from './components/VideoBackground';
import PublicHeader from './components/PublicHeader';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "iPurpose™ | Clarity, Connection, and Purpose",
  description:
    "Discover your core values and purpose with iPurpose. Start your clarity journey, explore our AI Blueprint, and reconnect to what matters.",
  alternates: {
    canonical: "https://www.ipurposesoul.com/",
  },
  openGraph: {
    title: "iPurpose™ | Clarity, Connection, and Purpose",
    description:
      "Discover your core values and purpose with iPurpose. Start your clarity journey, explore our AI Blueprint, and reconnect to what matters.",
    url: "https://www.ipurposesoul.com/",
    type: "website",
    images: ["https://www.ipurposesoul.com/images/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "iPurpose™ | Clarity, Connection, and Purpose",
    description:
      "Discover your core values and purpose with iPurpose. Start your clarity journey, explore our AI Blueprint, and reconnect to what matters.",
    images: ["https://www.ipurposesoul.com/images/og-image.jpg"],
  },
};

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get('FirebaseSession')?.value ?? null;
  let isLoggedIn = false;
  if (session && firebaseAdmin.apps.length > 0) {
    try {
      const verifyPromise = firebaseAdmin.auth().verifySessionCookie(session, true);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
      try {
        await Promise.race([verifyPromise, timeoutPromise]);
        isLoggedIn = true;
      } catch (e) {
        isLoggedIn = false;
      }
    } catch (e) {
      isLoggedIn = false;
    }
  }
  return (
    <div className="relative w-full bg-white">
        <VideoBackground src="/videos/water-reflection.mp4" poster="" />
        <PublicHeader />
        <div className="relative w-full flex items-center justify-center p-4 sm:p-6 lg:p-12" style={{ zIndex: 10, minHeight: '80vh' }}>
          <div className="max-w-3xl text-center relative p-6 sm:p-8 md:p-12 lg:p-16" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)' }}>
            <h1 className="text-hero leading-none" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              <div style={{ lineHeight: '1', marginBottom: 'clamp(1.875rem, 5vw, 3.75rem)' }}>
                iPurpose<span style={{ fontSize: '0.4em', verticalAlign: 'super' }}>™</span>
              </div>
              <div className="text-h2">Helping people orient themselves in a changing world.</div>
            </h1>
            <p className="text-h3 leading-relaxed mt-4 sm:mt-5 md:mt-6 lg:mt-8 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear.
            </p>
            <p className="text-h3 leading-relaxed mt-3 sm:mt-4 md:mt-5 lg:mt-6 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              Let's reconnect you to what matters and build it with clarity.
            </p>
          </div>
        </div>
        <div className="relative w-full bg-black/20 backdrop-blur-sm px-4 sm:px-6 lg:px-12" style={{ zIndex: 10, paddingTop: '0.0045rem', paddingBottom: '6rem' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 text-center mb-12 sm:mb-16 md:mb-20" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              Start Your Journey
            </h2>

            {/* PRIMARY CTA: Clarity Check */}
            <div className="mb-12 sm:mb-16">
              <div className="relative p-8 sm:p-10 rounded-2xl backdrop-blur-sm border-2 border-white/40 text-center" style={{ backgroundColor: 'rgba(156, 136, 255, 0.15)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/20 px-4 py-1 rounded-full text-xs sm:text-sm font-marcellus text-white">
                  MOST POPULAR
                </div>
                <h3 className="text-h2 mb-3 !text-white" style={{ color: '#FFFFFF' }}>Clarity Check</h3>
                <p className="text-body !text-white mb-2 font-marcellus" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  <strong>Free</strong> — Takes 5 minutes
                </p>
                <p className="text-body !text-white mb-8" style={{ color: '#FFFFFF', opacity: 0.85 }}>
                  Discover your core values and get instant clarity on what matters most.
                </p>
                <Link href="/clarity-check" className="text-body inline-block px-8 sm:px-12 py-3 sm:py-4 rounded-full transition-all hover:opacity-90 font-semibold" style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF' }}>
                  Take the Assessment
                </Link>
              </div>
            </div>

            {/* SECONDARY CTA: Starter Pack */}
            <div className="mb-12 sm:mb-16">
              <div className="relative p-8 sm:p-10 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                <h3 className="text-h3 mb-3 !text-white" style={{ color: '#FFFFFF' }}>Starter Pack</h3>
                <p className="text-body !text-white mb-2 font-marcellus" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  <strong>$27</strong> — One-time purchase
                </p>
                <p className="text-body !text-white mb-8" style={{ color: '#FFFFFF', opacity: 0.85 }}>
                  Foundational tools and exercises to deepen your clarity journey and build from a place of intention.
                </p>
                <Link href="/starter-pack" className="text-body inline-block px-8 sm:px-12 py-3 sm:py-4 rounded-full transition-all hover:opacity-90 font-semibold" style={{ background: 'linear-gradient(to right, #e6c87c, rgba(230, 200, 124, 0.7))', color: '#FFFFFF' }}>
                  Explore Offer
                </Link>
              </div>
            </div>

            {/* TERTIARY: AI Blueprint (Text Link) */}
            <div className="text-center">
              <p className="text-body !text-white mb-2" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                Ready for the next level?{' '}
                <Link href="/ai-blueprint" className="underline hover:opacity-70 transition-opacity font-semibold">
                  Explore the AI Blueprint
                </Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
  );
}
