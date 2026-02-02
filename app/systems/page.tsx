import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import PhotoCard from "../components/PhotoCard";
import MissingFirebaseConfig from "./components/MissingFirebaseConfig";

const hasFirebaseAdminCreds = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  process.env.FIREBASE_ADMIN_CREDENTIALS
);

export default async function SystemsPage() {
  if (!hasFirebaseAdminCreds) {
    return <MissingFirebaseConfig />;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }

    return (
      <div className="relative">
        {/* Hero Section */}
        <div className="relative h-[56vh] flex items-center justify-center overflow-hidden mb-10">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
            alt="Systems and structure"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">Systems</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              Build the structures that carry your purpose. Organize, automate, and streamline your flow.
            </p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

        {/* Philosophy Card */}
        <div className="ipurpose-glow-container mb-12">
          <Card accent="gold" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-marcellus">
              SYSTEMS PHILOSOPHY
            </p>
            <p className="text-lg text-warmCharcoal/75 leading-relaxed font-marcellus">
              Systems turn your purpose into momentum. These tools help you organize every part
              of your flow so your energy stays aligned, efficient, and powerful.
            </p>
          </Card>
        </div>

        {/* Core System Modules */}
        <div className="mb-12">
          <SectionHeading level="h2" className="mb-6">
            Core System Modules
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-6">
            <Card hover accent="lavender">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">📋</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lavenderViolet/10 text-indigoDeep font-marcellus">
                  Essential
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Offer Architecture</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-marcellus">
                Structure your offers, pricing, and delivery systems. Create scalable packages that reflect your value and serve your clients powerfully.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Offer templates & frameworks
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Pricing calculators
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Delivery workflows
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" href="/systems/offers">
                Build Your Offers
              </Button>
            </Card>

            <Card hover accent="salmon">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">⚡</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-salmonPeach/20 text-warmCharcoal font-marcellus">
                  Essential
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Workflow Builder</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-marcellus">
                Create simple, repeatable workflows that keep your operations smooth and confident. Automate the routine, focus on the strategic.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-salmonPeach rounded-full"></span>
                  Visual workflow designer
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-salmonPeach rounded-full"></span>
                  Task automation
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-salmonPeach rounded-full"></span>
                  Integration library
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" href="/systems/workflows">
                Open Workflow Builder
              </Button>
            </Card>

            <Card hover accent="gold">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">💰</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-softGold/30 text-warmCharcoal font-marcellus">
                  Growth
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Monetization Mode</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-marcellus">
                Track revenue streams, payment systems, and financial flows. Gain clarity on what's working and where to focus your energy.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-softGold rounded-full"></span>
                  Revenue analytics
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-softGold rounded-full"></span>
                  Payment integrations
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-softGold rounded-full"></span>
                  Financial projections
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" href="/systems/monetization">
                View Monetization
              </Button>
            </Card>

            <Card hover accent="lavender">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">📅</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lavenderViolet/10 text-indigoDeep font-marcellus">
                  Integration
                </span>
              </div>
              <h3 className="font-marcellus text-xl text-warmCharcoal mb-3">Calendar Sync</h3>
              <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-marcellus">
                Calendar setup (v1) focused on operational outcomes. Protect your energy and honor your rhythm without API integrations (coming later).
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Calendar setup (v1)
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Copy templates
                </div>
                <div className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus">
                  <span className="w-1.5 h-1.5 bg-lavenderViolet rounded-full"></span>
                  Integration coming later
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" href="/systems/calendar">
                Open Calendar Setup
              </Button>
            </Card>
          </div>
        </div>

        {/* Content & Communication */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Content & Communication
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover>
              <span className="text-2xl mb-3 block">📝</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Content Engine</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-marcellus">
                Plan, organize, and document your content ideas with aligned strategy.
              </p>
              <Button variant="ghost" size="sm" href="/systems/content">
                Launch Engine →
              </Button>
            </Card>

            <Card hover>
              <span className="text-2xl mb-3 block">📧</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Email Sequences</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-marcellus">
                Craft nurturing sequences that serve your audience authentically.
              </p>
              <Button variant="ghost" size="sm" href="/systems/email">
                Build Sequences →
              </Button>
            </Card>

            <Card hover>
              <span className="text-2xl mb-3 block">🎨</span>
              <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Brand Assets</h3>
              <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-marcellus">
                Organize your visual identity, templates, and brand guidelines.
              </p>
              <Button variant="ghost" size="sm" href="/systems/brand">
                View Assets →
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
