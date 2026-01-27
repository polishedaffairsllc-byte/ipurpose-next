import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { getTodaysAffirmation } from "@/lib/affirmationClient";
import PageTitle from "../components/PageTitle";
import PathBanner from "@/app/components/PathBanner";
import Card from "../components/Card";
import TiltCard from "../components/TiltCard";
import ScrollReveal from "../components/ScrollReveal";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import VideoBackground from "../components/VideoBackground";
import DashboardJournalPanel from "../components/DashboardJournalPanel";

export default async function DashboardPage() {
  console.log("Dashboard server render reached");
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

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return <div style={{ color: 'red', padding: 32 }}>Entitlement missing or inactive. Redirecting to enrollment-required...</div>;
    }

    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
    let todaysAffirmation = null;
    try {
      todaysAffirmation = await getTodaysAffirmation();
    } catch (err) {
      return <div style={{ color: 'red', padding: 32 }}>Error fetching today's affirmation: {String(err)}</div>;
    }

    // Render checkpoint: all data loaded
    if (!name || !todaysAffirmation) {
      return <div style={{ color: 'red', padding: 32 }}>Dashboard props undefined</div>;
    }

    return (
      <div className="relative">
        <div style={{ background: '#ffeeba', color: '#856404', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <strong>Debug Info:</strong> User: {name}, Entitlement: {String(userDoc.data()?.entitlement?.status)}, Affirmation: {todaysAffirmation ? 'Loaded' : 'Missing'}
        </div>
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
          <div className="ipurpose-glow-container mb-12 animate-fade-in-up stagger-2 relative z-10">
            <Card accent="lavender">
              <DashboardJournalPanel todaysAffirmation={todaysAffirmation} userName={name} />
            </Card>
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
    return <div style={{ color: 'red', padding: 32 }}>Error: {String(e)}</div>;
  }
}