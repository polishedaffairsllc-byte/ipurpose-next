import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import PhotoCard from "../components/PhotoCard";

export default async function SoulPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    await firebaseAdmin.auth().verifySessionCookie(session, true);

    return (
      <div className="relative">
        {/* Hero Section */}
        <div className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12">
          <img
            src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&q=80"
            alt="Soul journey"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">Soul Alignment</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              Explore the inner work that aligns your purpose and illuminates your path forward.
            </p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* Philosophy Card */}
        <div className="ipurpose-glow-container mb-12">
          <Card accent="lavender" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-montserrat">
              YOUR SOUL → SYSTEMS → AI™ FOUNDATION
            </p>
            <p className="text-lg text-warmCharcoal/75 leading-relaxed font-montserrat">
              Soul work creates the foundation for everything. When you're aligned internally,
              your systems flow naturally and your AI tools amplify what truly matters.
            </p>
          </Card>
        </div>

        {/* Archetypes Section */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-8">
            iPurpose Archetypes
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <PhotoCard
              src="https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80"
              alt="The Visionary Guide"
              title="Visionary"
              description="You see possibilities others don't. Your strength is in strategic clarity and long-term vision."
              aspectRatio="portrait"
            />
            <PhotoCard
              src="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80"
              alt="The Strategic Builder"
              title="Builder"
              description="You create systems and structures that scale. Your gift is turning ideas into reality."
              aspectRatio="portrait"
            />
            <PhotoCard
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
              alt="The Transformational Healer"
              title="Healer"
              description="You hold space for deep transformation. Your power is in intuitive guidance and healing."
              aspectRatio="portrait"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover accent="lavender" className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="ipurpose-icon-bubble group-hover:scale-110">
                  <span className="text-3xl">✨</span>
                </div>
                <span className="ipurpose-pill">
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
                <div className="ipurpose-icon-bubble-salmon group-hover:scale-110">
                  <span className="text-3xl">🎯</span>
                </div>
                <span className="ipurpose-pill">
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
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
