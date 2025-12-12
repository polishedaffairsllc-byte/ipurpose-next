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
        <div className="mb-12 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-lavenderViolet/10 via-salmonPeach/10 to-softGold/10 rounded-3xl blur-2xl opacity-60"></div>
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-italiana bg-gradient-to-r from-lavenderViolet via-indigoDeep to-salmonPeach bg-clip-text text-transparent mb-3">
              Welcome back, {name}
            </h1>
            <p className="text-lg md:text-xl text-warmCharcoal/70 font-marcellus mt-3">
              Your iPurpose Portal
            </p>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="relative mb-10">
          <div className="absolute -inset-2 bg-gradient-to-r from-lavenderViolet/20 to-salmonPeach/20 rounded-2xl blur-xl opacity-50"></div>
          <Card accent="lavender" className="relative">
            <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/60 uppercase mb-3">
              TODAY'S AFFIRMATION
            </p>
            <p className="text-xl md:text-2xl font-marcellus text-warmCharcoal leading-relaxed">
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavenderViolet/20 to-lavenderViolet/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(156, 136, 255, 0.15)'
                }}>
                  <span className="text-2xl">🧠</span>
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-softGold/30 to-softGold/15 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(245, 232, 199, 0.2)'
                }}>
                  <span className="text-2xl">⚙️</span>
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-salmonPeach/20 to-salmonPeach/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(252, 196, 183, 0.15)'
                }}>
                  <span className="text-2xl">🤖</span>
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavenderViolet/20 to-indigoDeep/15 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(156, 136, 255, 0.15)'
                }}>
                  <span className="text-2xl">📊</span>
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