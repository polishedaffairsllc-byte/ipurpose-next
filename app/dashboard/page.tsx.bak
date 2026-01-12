import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { getTodaysAffirmation } from "@/lib/affirmationClient";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import TiltCard from "../components/TiltCard";
import ScrollReveal from "../components/ScrollReveal";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import VideoBackground from "../components/VideoBackground";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
    
    // Fetch today's affirmation
    const todaysAffirmation = await getTodaysAffirmation();

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

        {/* Daily Affirmation */}
        <ScrollReveal delay={200}>
          <div className="ipurpose-glow-container mb-12 animate-fade-in-up stagger-2">
            <Card accent="lavender" className="relative text-center">
              <p className="text-xs font-semibold tracking-widest text-warmCharcoal/60 uppercase mb-5 font-montserrat">
                TODAY'S AFFIRMATION
              </p>
              <p className="text-2xl md:text-4xl font-marcellus text-warmCharcoal leading-relaxed mb-6">
                "{todaysAffirmation}"
              </p>
              <Button href="/journal" variant="primary" size="md">
                Journal on this
              </Button>
            </Card>
          </div>
        </ScrollReveal>

        {/* Intention Setting */}
        <ScrollReveal delay={250}>
          <div className="mb-12 animate-fade-in-up stagger-2b">
            <Card accent="salmon" className="text-center">
              <p className="text-xs font-semibold tracking-widest text-warmCharcoal/60 uppercase mb-5 font-montserrat">
                Today's intention
              </p>
              <p className="text-sm text-warmCharcoal/75 leading-relaxed mb-6">
                What do you want to move forward today?
              </p>
              <Button variant="secondary" size="md">
                Set Intention
              </Button>
            </Card>
          </div>
        </ScrollReveal>

        {/* Quick Links Section */}
        <ScrollReveal delay={300}>
          <div className="mb-12 animate-fade-in-up stagger-3">
            <SectionHeading level="h2" className="mb-8">
              Choose your path
            </SectionHeading>
            
            <div className="grid md:grid-cols-2 gap-8">
              <TiltCard hover className="group animate-fade-in-up stagger-4">
                <div className="flex items-center gap-5 mb-5">
                  <div className="ipurpose-icon-bubble group-hover:scale-110">
                    <span className="text-3xl">🧠</span>
                  </div>
                  <h3 className="font-marcellus text-2xl text-warmCharcoal">Soul Alignment</h3>
                </div>
                <p className="text-base text-warmCharcoal/70 mb-6 leading-relaxed">
                  Continue your inner clarity work and purpose alignment.
                </p>
                <Button href="/soul" variant="ghost" size="sm">
                  Enter Soul →
                </Button>
              </TiltCard>

              <TiltCard hover className="group animate-fade-in-up stagger-5">
                <div className="flex items-center gap-5 mb-5">
                  <div className="ipurpose-icon-bubble-gold group-hover:scale-110">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <h3 className="font-marcellus text-2xl text-warmCharcoal">Systems</h3>
                </div>
                <p className="text-base text-warmCharcoal/70 mb-6 leading-relaxed">
                  Structure your workflows, offers, and strategic foundation.
                </p>
                <Button href="/systems" variant="ghost" size="sm">
                  Open Systems →
                </Button>
              </TiltCard>

              <TiltCard hover className="group animate-fade-in-up stagger-6">
                <div className="flex items-center gap-5 mb-5">
                  <div className="ipurpose-icon-bubble-salmon group-hover:scale-110">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="font-marcellus text-2xl text-warmCharcoal">AI Mentor</h3>
                </div>
                <p className="text-base text-warmCharcoal/70 mb-6 leading-relaxed">
                  Expand your capacity with aligned automation and prompts.
                </p>
                <Button href="/ai" variant="ghost" size="sm">
                  Explore AI →
                </Button>
              </TiltCard>

              <TiltCard hover className="group animate-fade-in-up" data-stagger="7">
                <div className="flex items-center gap-5 mb-5">
                  <div className="ipurpose-icon-bubble group-hover:scale-110">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="font-marcellus text-2xl text-warmCharcoal">Insights</h3>
                </div>
                <p className="text-base text-warmCharcoal/70 mb-6 leading-relaxed">
                  Review reflections, trends, and alignment reports.
                </p>
                <Button href="/insights" variant="ghost" size="sm">
                  View Insights →
                </Button>
              </TiltCard>
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Activity Panel */}
        <ScrollReveal delay={400}>
          <div className="mb-12 animate-fade-in-up stagger-8">
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
    return redirect("/login");
  }
}