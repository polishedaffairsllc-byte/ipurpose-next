import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
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
      <>
        {/* Welcome Banner */}
        <div className="ipurpose-glow-container mb-12">
          <div className="relative">
            <h1 className="heading-hero mb-4">
              Welcome back, {name}
            </h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 font-marcellus">
              Your iPurpose Portal
            </p>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="ipurpose-glow-container mb-12">
          <Card accent="lavender" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/60 uppercase mb-4 font-montserrat">
              TODAY'S AFFIRMATION
            </p>
            <p className="text-2xl md:text-3xl font-marcellus text-warmCharcoal leading-relaxed">
              "I create space for what matters."
            </p>
          </Card>
        </div>

        {/* Quick Links Section */}
        <div className="mb-12">
          <SectionHeading level="h2" className="mb-6">
            Quick Access
          </SectionHeading>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card hover className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="ipurpose-icon-bubble group-hover:scale-110">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="font-marcellus text-xl text-warmCharcoal">Soul Alignment</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-5 leading-relaxed">
                Continue your inner clarity work and purpose alignment.
              </p>
              <Button href="/soul" variant="ghost" size="sm">
                Go to Soul →
              </Button>
            </Card>

            <Card hover className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="ipurpose-icon-bubble-gold group-hover:scale-110">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="font-marcellus text-xl text-warmCharcoal">Systems</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-5 leading-relaxed">
                Structure your workflows, offers, and strategic foundation.
              </p>
              <Button href="/systems" variant="ghost" size="sm">
                Go to Systems →
              </Button>
            </Card>

            <Card hover className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="ipurpose-icon-bubble-salmon group-hover:scale-110">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-marcellus text-xl text-warmCharcoal">AI Mentor</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-5 leading-relaxed">
                Expand your capacity with aligned automation and prompts.
              </p>
              <Button href="/ai" variant="ghost" size="sm">
                Go to AI Tools →
              </Button>
            </Card>

            <Card hover className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="ipurpose-icon-bubble group-hover:scale-110">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="font-marcellus text-xl text-warmCharcoal">Insights</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-5 leading-relaxed">
                Review reflections, trends, and alignment reports.
              </p>
              <Button href="/insights" variant="ghost" size="sm">
                Go to Insights →
              </Button>
            </Card>
          </div>
        </div>

        {/* Mood/Intention Panel */}
        <div className="grid md:grid-cols-2 gap-5">
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
      </>
    );
  } catch (e) {
    return redirect("/login");
  }
}