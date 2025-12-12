import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
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
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <PageTitle subtitle="Data that reveals your patterns, growth, and alignment over time.">
          Insights
        </PageTitle>

        {/* Philosophy Card */}
        <Card accent="salmon" className="mb-12">
          <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-montserrat">
            INSIGHTS PHILOSOPHY
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed font-montserrat">
            Numbers don't replace intuition — they inform it. Watch your patterns, celebrate your growth, and course-correct with clarity.
          </p>
        </Card>

        {/* Key Metrics */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Key Metrics
          </SectionHeading>
          <div className="grid md:grid-cols-4 gap-5">
            <Card accent="lavender">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Soul Alignment
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">87%</span>
                <span className="text-sm text-emerald-600 font-medium font-montserrat">+12%</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">vs. last month</p>
            </Card>

            <Card accent="salmon">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Active Practices
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">14</span>
                <span className="text-sm text-emerald-600 font-medium font-montserrat">+3</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">vs. last month</p>
            </Card>

            <Card accent="gold">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Revenue Growth
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">24%</span>
                <span className="text-sm text-emerald-600 font-medium font-montserrat">+8%</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">vs. last quarter</p>
            </Card>

            <Card accent="lavender">
              <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-2 font-montserrat">
                Engagement Rate
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-marcellus text-warmCharcoal">6.2%</span>
                <span className="text-sm text-emerald-600 font-medium font-montserrat">+1.4%</span>
              </div>
              <p className="text-xs text-warmCharcoal/50 font-montserrat">vs. last month</p>
            </Card>
          </div>
        </div>

        {/* Soul & Growth Analytics */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Soul & Growth Analytics
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card hover accent="lavender">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-xl text-warmCharcoal mb-1">Alignment Trends</h3>
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    30-day rolling average
                  </p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              
              {/* Chart Placeholder */}
              <div className="bg-lavenderViolet/5 rounded-lg h-48 flex items-center justify-center mb-6">
                <p className="text-sm text-warmCharcoal/40 font-montserrat">
                  Chart visualization placeholder
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Morning Reflections</span>
                  <span className="text-warmCharcoal font-medium">21 days</span>
                </div>
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Values Check-ins</span>
                  <span className="text-warmCharcoal font-medium">14 days</span>
                </div>
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Purpose Sessions</span>
                  <span className="text-warmCharcoal font-medium">8 days</span>
                </div>
              </div>
            </Card>

            <Card hover accent="salmon">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-marcellus text-xl text-warmCharcoal mb-1">Business Momentum</h3>
                  <p className="text-xs text-warmCharcoal/55 font-montserrat">
                    Revenue & client activity
                  </p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
              
              {/* Chart Placeholder */}
              <div className="bg-salmonPeach/10 rounded-lg h-48 flex items-center justify-center mb-6">
                <p className="text-sm text-warmCharcoal/40 font-montserrat">
                  Chart visualization placeholder
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Total Revenue</span>
                  <span className="text-warmCharcoal font-medium">$12,400</span>
                </div>
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Active Clients</span>
                  <span className="text-warmCharcoal font-medium">8</span>
                </div>
                <div className="flex items-center justify-between text-xs font-montserrat">
                  <span className="text-warmCharcoal/60">Avg. Project Value</span>
                  <span className="text-warmCharcoal font-medium">$1,550</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Content & Audience */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Content & Audience
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover accent="gold">
              <span className="text-2xl mb-3 block">📊</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Content Performance</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                See which content resonates most with your audience and drives engagement.
              </p>
              <Button variant="ghost" size="sm">
                View Report →
              </Button>
            </Card>

            <Card hover accent="lavender">
              <span className="text-2xl mb-3 block">👥</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Audience Growth</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Track subscriber and follower trends across all your platforms.
              </p>
              <Button variant="ghost" size="sm">
                View Growth →
              </Button>
            </Card>

            <Card hover accent="salmon">
              <span className="text-2xl mb-3 block">💬</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Engagement Insights</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Understand how your audience interacts with your work.
              </p>
              <Button variant="ghost" size="sm">
                View Insights →
              </Button>
            </Card>
          </div>
        </div>

        {/* Custom Dashboards */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Custom Dashboards
          </SectionHeading>
          <Card accent="gold">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Build Your View</h3>
                <p className="text-xs text-warmCharcoal/55 font-montserrat">
                  Personalized analytics for what matters most
                </p>
              </div>
            </div>
            <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-montserrat">
              Create custom dashboards tailored to your unique goals. Track the metrics that matter to you, visualize your patterns, and make aligned decisions with confidence.
            </p>
            <Button variant="secondary">
              Build Custom Dashboard
            </Button>
          </Card>
        </div>

      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
