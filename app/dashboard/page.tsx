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
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-italiana text-warmCharcoal mb-2">
            Welcome back, <span className="text-lavenderViolet">{name}</span>
          </h1>
          <p className="text-base md:text-lg text-warmCharcoal/70 font-marcellus mt-3">
            Your iPurpose Portal
          </p>
        </div>

        {/* Daily Affirmation */}
        <Card accent="lavender" className="mb-10">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/60 uppercase mb-3">
            TODAY'S AFFIRMATION
          </p>
          <p className="text-lg md:text-xl font-marcellus text-warmCharcoal leading-relaxed">
            "I create space for what matters."
          </p>
        </Card>

        {/* Quick Links Section */}
        <div className="mb-12">
          <SectionHeading level="h2" className="mb-6">
            Quick Access
          </SectionHeading>
          
          <div className="grid md:grid-cols-2 gap-5">
            <Card hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-lavenderViolet/20 flex items-center justify-center">
                  <span className="text-lavenderViolet text-lg">🧠</span>
                </div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Soul Alignment</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-4 leading-relaxed">
                Continue your inner clarity work and purpose alignment.
              </p>
              <Button href="/soul" variant="ghost" size="sm">
                Go to Soul →
              </Button>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-softGold/20 flex items-center justify-center">
                  <span className="text-softGold text-lg">⚙️</span>
                </div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Systems</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-4 leading-relaxed">
                Structure your workflows, offers, and strategic foundation.
              </p>
              <Button href="/systems" variant="ghost" size="sm">
                Go to Systems →
              </Button>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-salmonPeach/20 flex items-center justify-center">
                  <span className="text-salmonPeach text-lg">🤖</span>
                </div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">AI Mentor</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-4 leading-relaxed">
                Expand your capacity with aligned automation and prompts.
              </p>
              <Button href="/ai" variant="ghost" size="sm">
                Go to AI Tools →
              </Button>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-lavenderViolet/20 flex items-center justify-center">
                  <span className="text-lavenderViolet text-lg">📊</span>
                </div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Insights</h3>
              </div>
              <p className="text-sm text-warmCharcoal/70 mb-4 leading-relaxed">
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