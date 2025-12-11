import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";

export default async function AIToolsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    await firebaseAdmin.auth().verifySessionCookie(session, true);

    return (
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <PageTitle subtitle="AI-powered tools aligned with your purpose. Amplify your clarity, creativity, and confidence.">
          AI Tools
        </PageTitle>

        {/* Philosophy Card */}
        <Card accent="lavender" className="mb-12">
          <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-2 font-montserrat">
            AI PHILOSOPHY
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed font-montserrat">
            These tools don't replace your voice — they amplify it. Use AI to think clearer, move faster, and stay rooted in your truth while scaling your impact.
          </p>
        </Card>

        {/* Featured AI Tools */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Featured Tools
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover accent="lavender" className="shadow-glow-lavender">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">✨</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lavenderViolet/10 text-indigoDeep font-montserrat">
                  New
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Purpose Prompt Studio</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-montserrat">
                Generate aligned content, offers, and messaging that resonates deeply with your audience and feels true to your soul.
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Launch Studio
              </Button>
            </Card>

            <Card hover accent="salmon" className="shadow-glow-salmon">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🎯</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-salmonPeach/20 text-warmCharcoal font-montserrat">
                  Popular
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Value Articulator</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-montserrat">
                Turn complex ideas into clear, compelling language. Help your audience understand why your work matters and how it serves them.
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Try Articulator
              </Button>
            </Card>

            <Card hover accent="gold" className="shadow-glow-gold">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">⚡</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-softGold/30 text-warmCharcoal font-montserrat">
                  Trending
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Insight Synthesizer</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-montserrat">
                Extract patterns, themes, and wisdom from your journal entries, client calls, and strategic reflections.
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Open Synthesizer
              </Button>
            </Card>
          </div>
        </div>

        {/* Content Creation Tools */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Content & Copy Generators
          </SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card hover>
              <span className="text-2xl mb-3 block">📝</span>
              <h3 className="font-marcellus text-base text-warmCharcoal mb-2">Email Writer</h3>
              <p className="text-xs text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Draft nurturing, value-packed emails for your audience.
              </p>
              <Button variant="ghost" size="sm">
                Generate →
              </Button>
            </Card>

            <Card hover>
              <span className="text-2xl mb-3 block">📱</span>
              <h3 className="font-marcellus text-base text-warmCharcoal mb-2">Social Captions</h3>
              <p className="text-xs text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Create aligned social posts that invite conversation.
              </p>
              <Button variant="ghost" size="sm">
                Generate →
              </Button>
            </Card>

            <Card hover>
              <span className="text-2xl mb-3 block">📄</span>
              <h3 className="font-marcellus text-base text-warmCharcoal mb-2">Landing Pages</h3>
              <p className="text-xs text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Build high-converting pages with soulful language.
              </p>
              <Button variant="ghost" size="sm">
                Generate →
              </Button>
            </Card>

            <Card hover>
              <span className="text-2xl mb-3 block">🎙️</span>
              <h3 className="font-marcellus text-base text-warmCharcoal mb-2">Script Drafts</h3>
              <p className="text-xs text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Create compelling video and podcast scripts.
              </p>
              <Button variant="ghost" size="sm">
                Generate →
              </Button>
            </Card>
          </div>
        </div>

        {/* Strategy & Analysis */}
        <div className="mb-16">
          <SectionHeading level="h2" className="mb-6">
            Strategy & Analysis
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover accent="lavender">
              <span className="text-2xl mb-3 block">🧭</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Offer Architect</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Design compelling offers that align with your purpose and your audience's needs.
              </p>
              <Button variant="ghost" size="sm">
                Start Building →
              </Button>
            </Card>

            <Card hover accent="salmon">
              <span className="text-2xl mb-3 block">📊</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Market Analyzer</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Understand your market landscape and identify strategic opportunities.
              </p>
              <Button variant="ghost" size="sm">
                Analyze Market →
              </Button>
            </Card>

            <Card hover accent="gold">
              <span className="text-2xl mb-3 block">💡</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Idea Expander</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
                Take a seed idea and explore 10 aligned directions for your business.
              </p>
              <Button variant="ghost" size="sm">
                Expand Ideas →
              </Button>
            </Card>
          </div>
        </div>

        {/* Automation Library */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Automation Library
          </SectionHeading>
          <Card accent="gold">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal">Custom AI Workflows</h3>
                <p className="text-xs text-warmCharcoal/55 font-montserrat">
                  Build multi-step automations powered by AI
                </p>
              </div>
            </div>
            <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-montserrat">
              String together prompts, data sources, and outputs to create powerful workflows that run on autopilot. Perfect for recurring content, client onboarding, and strategic planning.
            </p>
            <Button variant="secondary">
              Explore Automation Library
            </Button>
          </Card>
        </div>

      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
