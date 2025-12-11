import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import Navigation from "../components/Navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function InsightsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    await firebaseAdmin.auth().verifySessionCookie(session, true);

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2b2d4a_0,#0f1017_42%,#050509_100%)]">
          <div className="container max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
            
            <PageTitle subtitle="Explore reflective insights, trends, and clarity reports that support your growth.">
              Your Aligned Insights
            </PageTitle>

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <Card hover accent="lavender">
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Daily Reflection</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Track your emotional and energetic patterns over time.
                </p>
                <Button variant="ghost" size="sm">
                  Open Reflection →
                </Button>
              </Card>

              <Card hover accent="salmon">
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Clarity Trends</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  See the patterns emerging in your priorities and decisions.
                </p>
                <Button variant="ghost" size="sm">
                  View Trends →
                </Button>
              </Card>

              <Card hover accent="gold">
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Progress Summary</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Review your progress across Soul, Systems, and AI.
                </p>
                <Button variant="ghost" size="sm">
                  View Summary →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Alignment Report</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Receive personalized guidance based on your activity and patterns.
                </p>
                <Button variant="ghost" size="sm">
                  View Report →
                </Button>
              </Card>
            </div>

          </div>
        </main>
      </>
    );
  } catch (e) {
    return redirect("/login");
  }
}
