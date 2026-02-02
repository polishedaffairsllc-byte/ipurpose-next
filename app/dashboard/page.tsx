import { cookies } from "next/headers";
import { Metadata } from "next";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getTodaysAffirmation } from "@/lib/affirmationClient";
import { canAccessTier, getTierFromUser } from "@/app/lib/auth/entitlements";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import PathBanner from "@/app/components/PathBanner";
import Card from "../components/Card";
import ScrollReveal from "../components/ScrollReveal";
import SectionHeading from "../components/SectionHeading";
import VideoBackground from "../components/VideoBackground";
import DashboardJournalPanel from "../components/DashboardJournalPanel";
import DashboardOrientationStatus from "../components/DashboardOrientationStatus";

export const metadata: Metadata = {
  title: "Orientation — iPurpose",
  description: "Your personal orientation dashboard with affirmation, progress tracking, and guided labs.",
};

export default async function DashboardPage() {
  console.log("Dashboard server render reached");
  const SAFE_MODE = process.env.NEXT_PUBLIC_DASHBOARD_SAFE_MODE === "1";

  if (SAFE_MODE) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Dashboard SAFE MODE</h2>
        <p>Routing is working. Dashboard children are bypassed.</p>
        <p>Set NEXT_PUBLIC_DASHBOARD_SAFE_MODE=0 to re-enable full rendering.</p>
      </div>
    );
  }
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return <div style={{ color: 'red', padding: 32 }}>No session found. Redirecting to login...</div>;
  }
  // Render checkpoint: session present

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const customClaims = decoded.customClaims || {};
    const tier = getTierFromUser({ ...userDoc.data(), customClaims });
    const canAccessCommunity = canAccessTier(tier, "BASIC_PAID");

    // Skip entitlement check for founders
    const isFounder = customClaims.isFounder || customClaims.role === 'founder';
    if (!isFounder && (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active")) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-warmCharcoal">Access not active</h2>
            <p className="mt-3 text-sm text-warmCharcoal/70">
              Your access isn't active yet. Enroll to unlock the full dashboard experience.
            </p>
            <a
              href="/enroll"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-full bg-ip-accent text-white font-medium"
            >
              Enroll now
            </a>
          </div>
        </div>
      );
    }

    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
    let todaysAffirmation = null;
    try {
      todaysAffirmation = await getTodaysAffirmation();
    } catch (err) {
      console.error("Dashboard data fetch failed (affirmation)", err);
      throw new Error("Dashboard data fetch failed (affirmation)");
    }

    // Render checkpoint: all data loaded
    if (!name || !todaysAffirmation) {
      return <div style={{ color: 'red', padding: 32 }}>Dashboard props undefined</div>;
    }

    return (
      <div className="relative">
        {/* Hero Background */}
        <div className="relative h-[40vh] mb-10 overflow-hidden">
          <VideoBackground src="/videos/water-reflection.mp4" />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 container max-w-6xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
            <div className="bg-black/25 backdrop-blur-sm rounded-2xl px-12 py-8">
              <h1 className="heading-hero mb-0 text-white drop-shadow-2xl text-5xl md:text-6xl lg:text-7xl">
                Welcome back, {name}
              </h1>
            </div>
          </div>
        </div>
        <ScrollReveal delay={200}>
          <div className="mb-12 animate-fade-in-up stagger-2 relative z-10">
            <div className="container max-w-6xl mx-auto px-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Left Column - Affirmation */}
                <div className="ipurpose-glow-container">
                  <Card accent="lavender">
                    <ErrorBoundary>
                      <DashboardJournalPanel todaysAffirmation={todaysAffirmation} userName={name} />
                    </ErrorBoundary>
                  </Card>
                </div>
                {/* Right Column - Orientation */}
                <div>
                  <DashboardOrientationStatus />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <div className="mb-12 animate-fade-in-up stagger-3 relative z-0">
            <SectionHeading level="h2" className="mb-8">
              Choose your path
            </SectionHeading>
            <div className="space-y-4 max-w-2xl mx-auto w-full">
              <PathBanner 
                href="/soul"
                title="Soul Alignment"
                description="Continue your inner clarity work and purpose alignment."
                color="#9C88FF"
              />
              <PathBanner 
                href="/systems"
                title="Systems"
                description="Structure your workflows, offers, and strategic foundation."
                color="#F5E8C7"
              />
              <PathBanner 
                href="/ai"
                title="AI Mentor"
                description="Expand your capacity with aligned automation and prompts."
                color="#FCC4B7"
              />
              <PathBanner 
                href="/insights"
                title="Insights"
                description="Review reflections, trends, and alignment reports."
                color="#4B4E6D"
              />
              {canAccessCommunity ? (
                <PathBanner 
                  href="/community"
                  title="Community"
                  description="Connect with the iPurpose community and group reflections."
                  color="#F8C9D3"
                />
              ) : null}
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={400}>
          <div className="mb-12 animate-fade-in-up stagger-8 relative z-0">
            <Card accent="gold">
              <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/60 uppercase mb-3">
                RECENT ACTIVITY
              </p>
              <p className="text-sm text-warmCharcoal/75 leading-relaxed mb-2">
                • Completed Soul Reflection
              </p>
              <p className="text-sm text-warmCharcoal/75 leading-relaxed">
                • Updated Systems Framework
              </p>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    );
  } catch (e) {
    console.error("Dashboard server error:", e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}