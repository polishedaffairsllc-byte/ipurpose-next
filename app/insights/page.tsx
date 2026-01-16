import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

// Data source helpers
async function getUserInsights(userId: string) {
  try {
    const db = firebaseAdmin.firestore();
    
    // Get check-ins (for Soul Alignment)
    const checkInsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("checkIns")
      .where("createdAt", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .orderBy("createdAt", "desc")
      .get();
    
    const checkIns = checkInsSnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
    }));
    
    // Get practices (for Active Practices)
    const practicesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("practices")
      .where("completedAt", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .get();
    
    const activePractices = practicesSnapshot.docs.length;
    
    // Calculate alignment consistency
    const alignmentConsistency = checkIns.length > 0 
      ? Math.round((Math.min(checkIns.length, 7) / 7) * 100)
      : 0;
    
    // Get last 7 days activity for streak
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = checkIns.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
    
    return {
      checkIns,
      activePractices,
      alignmentConsistency,
      recentActivityCount: recentActivity.length,
      hasCheckIns: checkIns.length > 0,
      hasPractices: activePractices > 0
    };
  } catch (error) {
    console.error("Error fetching user insights:", error);
    return {
      checkIns: [],
      activePractices: 0,
      alignmentConsistency: 0,
      recentActivityCount: 0,
      hasCheckIns: false,
      hasPractices: false
    };
  }
}

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

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }

    const insights = await getUserInsights(userId);

    return (
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <PageTitle subtitle="Real data from your check-ins and practices. The more you use iPurpose, the smarter this becomes.">
          Insights
        </PageTitle>

        {/* Philosophy Card */}
        <Card accent="salmon" className="mb-12">
          <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-montserrat">
            HOW THIS WORKS
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed font-montserrat">
            Insights are based on your check-ins and practices in iPurpose. Every number here comes from your real activity. Start with a check-in to unlock your data.
          </p>
        </Card>

        {/* Key Metrics */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Your Progress
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Alignment Consistency */}
            <Card accent="lavender">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Alignment Consistency
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">
                  {insights.alignmentConsistency}%
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">
                Check-ins last 7 days
              </p>
              {!insights.hasCheckIns && (
                <p className="text-xs text-warmCharcoal/40 mt-3 italic font-montserrat">
                  Start a check-in to build your data
                </p>
              )}
            </Card>

            {/* Active Practices */}
            <Card accent="salmon">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Practices Completed
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">
                  {insights.activePractices}
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">
                Last 30 days
              </p>
              {!insights.hasPractices && (
                <p className="text-xs text-warmCharcoal/40 mt-3 italic font-montserrat">
                  Build your first practice to get started
                </p>
              )}
            </Card>

            {/* Check-in Count */}
            <Card accent="gold">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Check-ins Logged
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">
                  {insights.checkIns.length}
                </span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">
                Last 30 days
              </p>
            </Card>
          </div>
        </div>

        {/* Soul & Growth Analytics */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Your Journey
          </SectionHeading>
          <div className="grid md:grid-cols-1 gap-6">
            <Card hover accent="lavender">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-xl text-warmCharcoal mb-1">Check-Ins</h3>
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    Track your alignment and clarity over time
                  </p>
                </div>
                <span className="text-2xl">✨</span>
              </div>
              
              {insights.hasCheckIns ? (
                <div className="space-y-3">
                  <p className="text-sm text-warmCharcoal/70 font-montserrat">
                    You've logged <strong>{insights.checkIns.length} check-ins</strong> in the last 30 days.
                  </p>
                  <div className="text-xs text-warmCharcoal/60 space-y-1 font-montserrat">
                    <p>Most recent: {new Date(insights.checkIns[0]?.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" href="/soul">
                    Review Your Check-Ins →
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-warmCharcoal/60 mb-4 font-montserrat">
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
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    Built systems and aligned workflows
                  </p>
                </div>
                <span className="text-2xl">⚙️</span>
              </div>
              
              {insights.hasPractices ? (
                <div className="space-y-3">
                  <p className="text-sm text-warmCharcoal/70 font-montserrat">
                    You've completed <strong>{insights.activePractices} practices</strong> in the last 30 days.
                  </p>
                  <Button variant="ghost" size="sm" href="/systems">
                    View Your Systems →
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-warmCharcoal/60 mb-4 font-montserrat">
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
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Coming Soon
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card accent="gold" className="opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-lg text-warmCharcoal">Alignment Trends</h3>
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    30-day visualization (building soon)
                  </p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">
                We're building this feature to show how your alignment scores trend over time.
              </p>
            </Card>

            <Card accent="lavender" className="opacity-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-lg text-warmCharcoal">Custom Dashboards</h3>
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    Build your own view (building soon)
                  </p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">
                Create personalized dashboards for metrics that matter most to you.
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
