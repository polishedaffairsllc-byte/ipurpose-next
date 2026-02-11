
import type { Metadata } from "next";
import { cookies } from 'next/headers';
import Link from 'next/link';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import VideoBackground from './components/VideoBackground';
import PublicHeader from './components/PublicHeader';
import Footer from './components/Footer';
import HomeClient from './components/HomeClient';

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
        <HomeClient />
        <PublicHeader />
        <div className="relative w-full flex items-center justify-center p-4 sm:p-6 lg:p-12" style={{ zIndex: 10, minHeight: '80vh' }}>
          <div className="max-w-3xl text-center relative p-6 sm:p-8 md:p-12 lg:p-16" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)' }}>
            <h1 className="font-italiana leading-none" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', lineHeight: '1', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
                iPurpose<span style={{ fontSize: '0.4em', verticalAlign: 'super' }}>™</span>
              </div>
              <div style={{ fontSize: '28px' }}>Helping people orient themselves in a changing world.</div>
            </h1>
            <p className="leading-relaxed mt-4 sm:mt-5 md:mt-6 lg:mt-8 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: '20px' }}>
              iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear.
            </p>
            <p className="leading-relaxed mt-3 sm:mt-4 md:mt-5 lg:mt-6 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: '20px' }}>
              Let's reconnect you to what matters and build it with clarity.
            </p>
          </div>
        </div>
        <div className="relative w-full bg-black/20 backdrop-blur-sm px-4 sm:px-6 lg:px-12" style={{ zIndex: 10, paddingTop: '0.0045rem', paddingBottom: '6rem' }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="font-italiana text-center mb-8 sm:mb-12 md:mb-16" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: '32px' }}>
              Start Your Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="relative p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                <h3 className="font-italiana mb-4 !text-white" style={{ color: '#FFFFFF', fontSize: '24px' }}>Clarity Check</h3>
                <p className="!text-white mb-6" style={{ color: '#FFFFFF', fontSize: '18px' }}>Take a guided assessment to discover your core values and purpose.</p>
                <Link href="/clarity-check" className="inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF', fontSize: '18px' }}>
                  Start Assessment
                </Link>
              </div>
              <div className="relative p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                <h3 className="font-italiana mb-4 !text-white" style={{ color: '#FFFFFF', fontSize: '24px' }}>Starter Pack</h3>
                <p className="!text-white mb-6" style={{ color: '#FFFFFF', fontSize: '18px' }}>Get foundational tools and exercises to begin your clarity journey.</p>
                <Link href="/starter-pack" className="inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #e6c87c, rgba(230, 200, 124, 0.7))', color: '#FFFFFF', fontSize: '18px' }}>
                  Explore Offer
                </Link>
              </div>
              <div className="relative p-6 sm:p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all md:col-span-2 lg:col-span-1 text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                <h3 className="font-italiana mb-4 !text-white" style={{ color: '#FFFFFF', fontSize: '24px' }}>AI Blueprint</h3>
                <p className="!text-white mb-6" style={{ color: '#FFFFFF', fontSize: '18px' }}>Let AI help you build a personalized action plan for clarity.</p>
                <Link href="/ai-blueprint" className="inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #9c88ff, rgba(156, 136, 255, 0.7))', color: '#FFFFFF', fontSize: '18px' }}>
                  Explore Offer
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
  );
}
