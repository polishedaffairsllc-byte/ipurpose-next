import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import Navigation from "../components/Navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function SoulPage() {
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
            
            <PageTitle subtitle="This is where your clarity begins. Explore the inner work that aligns your purpose.">
              Soul Alignment
            </PageTitle>

            <Card accent="lavender" className="mb-10">
              <p className="text-xs font-medium tracking-[0.2em] text-white/55 uppercase mb-2">
                YOUR SOUL → SYSTEMS → AI™ FOUNDATION
              </p>
              <p className="text-sm text-white/75 leading-relaxed">
                Soul work creates the foundation for everything. When you're aligned internally,
                your systems flow naturally and your AI tools amplify what truly matters.
              </p>
            </Card>

            <SectionHeading level="h2" className="mb-6">
              Soulwork Practices
            </SectionHeading>

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Soulwork Reflection</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Explore the deeper motivations, values, and patterns shaping your purpose.
                </p>
                <Button variant="ghost" size="sm">
                  Begin Reflection →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Archetype Explorer</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Discover your iPurpose Archetype and unlock aligned growth strategy.
                </p>
                <Button variant="ghost" size="sm">
                  Explore Archetypes →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Value Mapping</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Identify and clarify the values that guide your decisions and direction.
                </p>
                <Button variant="ghost" size="sm">
                  Map Your Values →
                </Button>
              </Card>

              <Card hover>
                <h3 className="font-marcellus text-lg text-offWhite mb-2">Purpose Articulation</h3>
                <p className="text-sm text-white/65 mb-4 leading-relaxed">
                  Craft a clear, powerful statement of your aligned purpose and mission.
                </p>
                <Button variant="ghost" size="sm">
                  Articulate Purpose →
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
