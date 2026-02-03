import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { isFounder } from "@/lib/isFounder";
import { getInsightsSummary } from "@/lib/insights/getInsightsSummary";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import VideoBackground from "../components/VideoBackground";

export default async function InsightsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedClaims.uid;

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounder(decodedClaims, userData);

    if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
      return redirect("/enrollment-required");
    }

    // Fetch read-only insights summary
    const summary = await getInsightsSummary(userId);

    return (
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* Hero Section */}
        <div className="relative h-[48vh] flex items-center justify-center overflow-hidden mb-10 rounded-3xl">
          <VideoBackground src="/videos/water-reflection.mp4" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-white drop-shadow-2xl">Insights</h1>
            <p className="text-xl md:text-2xl text-white/85 font-marcellus drop-shadow-lg">
              Real data from your check-ins and practices. The more you use iPurpose, the smarter this becomes.
            </p>
          </div>
        </div>

        {/* How This Works */}
        <Card accent="salmon" className="mb-12">
          <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-marcellus">
            HOW THIS WORKS
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed font-marcellus">
            Insights are based on your check-ins and practices in iPurpose. Every number here comes from your real activity. 
            No preferences to save here—Insights is purely interpretive. Start with a check-in to unlock your data.
          </p>
        </Card>

        {/* Key Metrics */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Your Progress
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Alignment Consistency (7 days) */}
            <Card accent="lavender">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-marcellus">
                Alignment Consistency
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-marcellus text-warmCharcoal">
                  {summary.alignmentConsistency7d}%
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-marcellus">
                Days with check-ins last 7 days
              </p>
              {summary.checkinsLast30d === 0 && (
                <p className="text-xs text-warmCharcoal/40 mt-3 italic font-marcellus">
                  Start a check-in to build your alignment data.
                </p>
              )}
            </Card>

            {/* Practices Completed (30 days) */}
            <Card accent="salmon">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-marcellus">
                Practices Completed
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-marcellus text-warmCharcoal">
                  {summary.practicesLast30d}
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-marcellus">
                Last 30 days
              </p>
              {summary.practicesLast30d === 0 && (
                <p className="text-xs text-warmCharcoal/40 mt-3 italic font-marcellus">
                  Build systems to start tracking practices.
                </p>
              )}
            </Card>

            {/* Check-ins Logged (30 days) */}
            <Card accent="gold">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-marcellus">
                Check-ins Logged
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-marcellus text-warmCharcoal">
                  {summary.checkinsLast30d}
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-marcellus">
                Last 30 days
              </p>
            </Card>
          </div>
        </div>

        {/* Your Journey: Check-Ins */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Your Journey
          </SectionHeading>
          <div className="grid md:grid-cols-1 gap-6">
            <Card hover accent="lavender">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-xl text-warmCharcoal mb-1">Check-Ins</h3>
                  <p className="text-xs text-warmCharcoal/55 font-marcellus">
                    Track your alignment and clarity over time
                  </p>
                </div>
                <span className="text-2xl">✨</span>
              </div>
              
              {summary.checkinsLast30d > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-warmCharcoal/70 font-marcellus">
                    You've logged <strong>{summary.checkinsLast30d} check-ins</strong> in the last 30 days.
                  </p>
                  <div className="text-xs text-warmCharcoal/60 space-y-2 font-marcellus">
                    <p>Most recent: <strong>{summary.mostRecentCheckinDate ?? "—"}</strong></p>
                    {summary.streakDays > 0 && (
                      <p>Current streak: <strong>{summary.streakDays} day{summary.streakDays !== 1 ? "s" : ""}</strong></p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" href="/soul">
                    Review Your Check-Ins →
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-warmCharcoal/60 mb-4 font-marcellus">
                    No check-ins yet. Start with your first check-in to build your insights.
                  </p>
                  <Button variant="primary" size="sm" href="/soul">
                    Start Your First Check-In
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Systems & Practices */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Practices & Systems
          </SectionHeading>
          <div className="grid md:grid-cols-1 gap-6">
            <Card hover accent="salmon">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-xl text-warmCharcoal mb-1">Your Practices</h3>
                  <p className="text-xs text-warmCharcoal/55 font-marcellus">
                    Built systems and aligned workflows
                  </p>
                </div>
                <span className="text-2xl">⚙️</span>
              </div>
              
              {summary.practicesLast30d > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-warmCharcoal/70 font-marcellus">
                    You've completed <strong>{summary.practicesLast30d} practice{summary.practicesLast30d !== 1 ? "s" : ""}</strong> in the last 30 days.
                  </p>
                  <Button variant="ghost" size="sm" href="/systems">
                    View Your Systems →
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-warmCharcoal/60 mb-4 font-marcellus">
                    No practices yet. Build your first system to start tracking progress.
                  </p>
                  <Button variant="primary" size="sm" href="/systems">
                    Build Your First Practice
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Coming Soon
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card accent="gold" className="opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-lg text-warmCharcoal">Alignment Trends</h3>
                  <p className="text-xs text-warmCharcoal/55 font-marcellus">
                    30-day visualization
                  </p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-marcellus">
                Track how your alignment scores trend over time.
              </p>
            </Card>

            <Card accent="lavender" className="opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-lg text-warmCharcoal">Custom Dashboards</h3>
                  <p className="text-xs text-warmCharcoal/55 font-marcellus">
                    Build your own view
                  </p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-marcellus">
                Create personalized dashboards for the metrics that matter most.
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
