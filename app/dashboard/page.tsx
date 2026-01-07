import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import TiltCard from "../components/TiltCard";
import ScrollReveal from "../components/ScrollReveal";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");

    return (
      <div className="relative">
        {/* Hero Background */}
        <div className="relative h-[40vh] mb-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
            alt="Dashboard background"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 container max-w-6xl mx-auto px-6 h-full flex flex-col justify-center">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">
              Welcome back, {name}
            </h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 font-marcellus drop-shadow-lg">
              Your iPurpose Portal
            </p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 py-6 space-y-10">
        {/* Daily Affirmation */}
        <ScrollReveal delay={200}>
          <div className="ipurpose-glow-container mb-12 animate-fade-in-up stagger-2">
            <Card accent="lavender" className="relative">
              <p className="text-xs font-semibold tracking-widest text-warmCharcoal/60 uppercase mb-5 font-montserrat">
                TODAY'S AFFIRMATION
              </p>
              <p className="text-2xl md:text-4xl font-marcellus text-warmCharcoal leading-relaxed">
                "I create space for what matters."
              </p>
            </Card>
          </div>
        </ScrollReveal>

        {/* Quick Links Section */}
        <ScrollReveal delay={300}>
          <div className="mb-12 animate-fade-in-up stagger-3">
            <SectionHeading level="h2" className="mb-8">
              Quick Access
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
                  Go to Soul →
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
                  Go to Systems →
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
                  Go to AI Tools →
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
                  Go to Insights →
                </Button>
              </TiltCard>
            </div>
          </div>
        </ScrollReveal>

        {/* Mood/Intention Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card accent="salmon">
            <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/60 uppercase mb-3">
              INTENTION SETTING
            </p>
            <p className="text-sm text-warmCharcoal/75 leading-relaxed mb-4">
              What is your primary focus today?
            </p>
            <Button variant="secondary" size="sm">
              Set Intention
            </Button>
          </Card>

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
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}