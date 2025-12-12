import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
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
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <div className="relative mb-10">
          <div className="absolute -inset-4 bg-gradient-to-r from-lavenderViolet/10 to-salmonPeach/10 rounded-3xl blur-2xl opacity-60"></div>
          <div className="relative">
            <PageTitle subtitle="Explore the inner work that aligns your purpose and illuminates your path forward.">
              Soul Alignment
            </PageTitle>
          </div>
        </div>

        {/* Philosophy Card */}
        <div className="relative mb-12">
          <div className="absolute -inset-2 bg-gradient-to-r from-lavenderViolet/15 to-salmonPeach/15 rounded-2xl blur-xl opacity-50"></div>
          <Card accent="lavender" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-montserrat">
              YOUR SOUL → SYSTEMS → AI™ FOUNDATION
            </p>
            <p className="text-base text-warmCharcoal/75 leading-relaxed font-montserrat">
              Soul work creates the foundation for everything. When you're aligned internally,
              your systems flow naturally and your AI tools amplify what truly matters.
            </p>
          </Card>
        </div>

        {/* Archetypes Section */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            iPurpose Archetypes
          </SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover accent="lavender" className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavenderViolet/20 to-lavenderViolet/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(156, 136, 255, 0.15)'
                }}>
                  <span className="text-3xl">✨</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lavenderViolet/15 to-lavenderViolet/10 text-indigoDeep font-montserrat">
                  Visionary
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">The Visionary Guide</h3>
              <p className="text-sm text-warmCharcoal/65 mb-5 leading-relaxed font-montserrat">
                You see possibilities others don't. Your strength is in strategic clarity and long-term vision.
              </p>
              <Button variant="ghost" size="sm">
                Explore Archetype →
              </Button>
            </Card>

            <Card hover accent="salmon" className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-salmonPeach/20 to-salmonPeach/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                  boxShadow: '0 8px 20px rgba(252, 196, 183, 0.15)'
                }}>
                  <span className="text-3xl">🎯</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-salmonPeach/20 to-salmonPeach/15 text-warmCharcoal font-montserrat">
                  Builder
                </span>
              </div>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">The Strategic Builder</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                You create systems and structures that scale. Your gift is turning ideas into reality.
              </p>
              <Button variant="ghost" size="sm">
                Explore Archetype →
              </Button>
            </Card>

            <Card hover accent="gold">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">💫</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-softGold/30 text-warmCharcoal font-montserrat">
                  Healer
                </span>
              </div>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">The Transformational Healer</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                You hold space for deep transformation. Your power is in intuitive guidance and healing.
              </p>
              <Button variant="ghost" size="sm">
                Explore Archetype →
              </Button>
            </Card>
          </div>
        </div>

        {/* Daily Reflections Section */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Daily Soul Practices
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Morning Reflection</h3>
              </div>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Start your day with intention. Reflect on your energy, priorities, and alignment.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warmCharcoal/50 font-montserrat">5-10 minutes</span>
                <Button variant="ghost" size="sm">
                  Begin Practice →
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌙</span>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Evening Integration</h3>
              </div>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Close your day with gratitude. Review what aligned and what didn't.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warmCharcoal/50 font-montserrat">10 minutes</span>
                <Button variant="ghost" size="sm">
                  Begin Practice →
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💭</span>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Value Mapping</h3>
              </div>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Identify and clarify the core values that guide your decisions and direction.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warmCharcoal/50 font-montserrat">20 minutes</span>
                <Button variant="ghost" size="sm">
                  Begin Practice →
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Purpose Articulation</h3>
              </div>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Craft a clear, powerful statement of your aligned purpose and mission.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warmCharcoal/50 font-montserrat">30 minutes</span>
                <Button variant="ghost" size="sm">
                  Begin Practice →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Purpose Pathways Section */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Purpose Pathways
          </SectionHeading>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card accent="lavender">
              <span className="text-3xl mb-4 block">🧭</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Clarity Path</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                A 30-day journey to uncover your core purpose and authentic direction.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Start Pathway
              </Button>
            </Card>

            <Card accent="salmon">
              <span className="text-3xl mb-4 block">🌱</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Growth Path</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Deepen your self-awareness and expand your capacity for aligned action.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Start Pathway
              </Button>
            </Card>

            <Card accent="gold">
              <span className="text-3xl mb-4 block">⚡</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Mastery Path</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Advanced practices for those ready to embody their purpose fully.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Start Pathway
              </Button>
            </Card>
          </div>
        </div>

      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
