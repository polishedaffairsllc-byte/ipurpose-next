import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { isFounder } from "@/lib/isFounder";
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

// Module definition with recommended ordering and progression hints
interface SystemModule {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
  href: string;
  badge: string;
  categoryLabel: string;
  recommendedOrder: number;
  ctaText: string;
  status?: "active" | "coming-soon" | "planned";
  accentColor?: "lavender" | "salmon" | "gold" | "none";
  nextHint?: string;
}

const coreModules: SystemModule[] = [
  {
    id: "offers",
    icon: "📋",
    title: "Offer Architecture",
    description:
      "Structure your offers, pricing, and delivery systems. Create scalable packages that reflect your value and serve your clients powerfully.",
    details: [
      "Offer templates & frameworks",
      "Pricing calculators",
      "Delivery workflows",
    ],
    href: "/systems/offers",
    badge: "Essential • Start Here",
    categoryLabel: "Essential",
    recommendedOrder: 1,
    ctaText: "Start with Offer Architecture →",
    status: "active",
    accentColor: "lavender",
    nextHint: "Next: Workflow Builder",
  },
  {
    id: "workflows",
    icon: "⚡",
    title: "Workflow Builder",
    description:
      "Create simple, repeatable workflows that keep your operations smooth and confident. Automate the routine, focus on the strategic.",
    details: [
      "Visual workflow designer",
      "Task automation",
      "Integration library",
    ],
    href: "/systems/workflows",
    badge: "Essential",
    categoryLabel: "Essential",
    recommendedOrder: 2,
    ctaText: "Open Workflow Builder →",
    status: "active",
    accentColor: "salmon",
  },
  {
    id: "calendar",
    icon: "📅",
    title: "Calendar Sync",
    description:
      "Calendar setup (v1) focused on operational outcomes. Protect your energy and honor your rhythm without API integrations (coming later).",
    details: [
      "Calendar setup (v1)",
      "Copy templates",
      "Integration coming later",
    ],
    href: "/systems/calendar",
    badge: "Integration",
    categoryLabel: "Integration",
    recommendedOrder: 3,
    ctaText: "Open Calendar Setup →",
    status: "active",
    accentColor: "lavender",
  },
  {
    id: "monetization",
    icon: "💰",
    title: "Monetization Mode",
    description:
      "Track revenue streams, payment systems, and financial flows. Gain clarity on what's working and where to focus your energy.",
    details: [
      "Revenue analytics",
      "Payment integrations",
      "Financial projections",
    ],
    href: "/systems/monetization",
    badge: "Growth",
    categoryLabel: "Growth",
    recommendedOrder: 4,
    ctaText: "View Monetization →",
    status: "active",
    accentColor: "gold",
  },
];

const supportModules: SystemModule[] = [
  {
    id: "content",
    icon: "📝",
    title: "Content Engine",
    description:
      "Plan, organize, and document your content ideas with aligned strategy.",
    details: [],
    href: "/systems/content",
    badge: "Coming Soon",
    categoryLabel: "Support",
    recommendedOrder: 5,
    ctaText: "Coming Soon",
    status: "coming-soon",
  },
  {
    id: "email",
    icon: "📧",
    title: "Email Sequences",
    description:
      "Craft nurturing sequences that serve your audience authentically.",
    details: [],
    href: "/systems/email",
    badge: "Coming Soon",
    categoryLabel: "Support",
    recommendedOrder: 6,
    ctaText: "Coming Soon",
    status: "coming-soon",
  },
  {
    id: "brand",
    icon: "🎨",
    title: "Brand Assets",
    description:
      "Organize your visual identity, templates, and brand guidelines.",
    details: [],
    href: "/systems/brand",
    badge: "Coming Soon",
    categoryLabel: "Support",
    recommendedOrder: 7,
    ctaText: "Coming Soon",
    status: "coming-soon",
  },
];

// Sort modules by recommendedOrder
const sortedCoreModules = [...coreModules].sort(
  (a, b) => a.recommendedOrder - b.recommendedOrder
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
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounder(decodedClaims, userData);

    if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
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

        {/* Philosophy Card with Start Here Guidance */}
        <div className="ipurpose-glow-container mb-12">
          <Card accent="gold" className="relative">
            <p className="text-xs font-medium tracking-widest text-warmCharcoal/55 uppercase mb-3 font-marcellus">
              SYSTEMS PHILOSOPHY
            </p>
            <p className="text-lg text-warmCharcoal/75 leading-relaxed font-marcellus">
              Systems turn your purpose into momentum. These tools help you organize every part
              of your flow so your energy stays aligned, efficient, and powerful.
            </p>
            <p className="text-sm text-warmCharcoal/60 leading-relaxed font-marcellus mt-4 pt-4 border-t border-softGold/20">
              <span className="font-medium text-warmCharcoal">Start here:</span> Define your offers first. Everything else builds from that.
            </p>
          </Card>
        </div>

        {/* Core System Modules - Guided Progression */}
        <div className="mb-12">
          <SectionHeading level="h2" className="mb-6">
            Core System Modules
          </SectionHeading>
          <div className="space-y-8">
            {/* Render sorted modules with special styling for the first one */}
            {sortedCoreModules.map((module, index) => {
              const isPrimary = index === 0;
              const isLast = index === sortedCoreModules.length - 1;
              
              return (
                <div key={module.id} className={isPrimary ? "relative" : ""}>
                  {/* Primary module gets enhanced visual treatment */}
                  {isPrimary && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-lavenderViolet/10 to-salmonPeach/10 rounded-2xl blur-xl pointer-events-none" />
                  )}
                  
                  <Card
                    hover
                    accent={module.accentColor}
                    className={`relative ${
                      isPrimary
                        ? "md:col-span-2 ring-2 ring-lavenderViolet/20 shadow-lg"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={isPrimary ? "text-4xl" : "text-3xl"}>
                        {module.icon}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-marcellus bg-lavenderViolet/10 text-indigoDeep">
                        {module.badge}
                      </span>
                    </div>
                    <h3 className={`font-marcellus text-warmCharcoal mb-3 ${isPrimary ? "text-2xl" : "text-xl"}`}>
                      {module.title}
                    </h3>
                    <p className="text-sm text-warmCharcoal/65 mb-6 leading-relaxed font-marcellus">
                      {module.description}
                    </p>
                    
                    {/* Details bullets */}
                    {module.details.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {module.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-warmCharcoal/60 font-marcellus"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                module.accentColor === "lavender"
                                  ? "bg-lavenderViolet"
                                  : module.accentColor === "salmon"
                                    ? "bg-salmonPeach"
                                    : module.accentColor === "gold"
                                      ? "bg-softGold"
                                      : "bg-warmCharcoal/40"
                              }`}
                            ></span>
                            {detail}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      variant={isPrimary ? "primary" : "primary"}
                      size={isPrimary ? "md" : "sm"}
                      className="w-full"
                      href={module.href}
                    >
                      {module.ctaText}
                    </Button>

                    {/* Next hint */}
                    {isPrimary && module.nextHint && (
                      <p className="text-xs text-warmCharcoal/50 font-marcellus mt-4 text-center">
                        {module.nextHint}
                      </p>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Modules - Content & Communication */}
        <div>
          <SectionHeading level="h2" className="mb-6">
            Content & Communication
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            {supportModules.map((module) => (
              <Card key={module.id} hover className="">
                <span className="text-2xl mb-3 block">{module.icon}</span>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-marcellus text-lg text-warmCharcoal flex-1">
                    {module.title}
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium font-marcellus bg-warmCharcoal/5 text-warmCharcoal/60 ml-2 whitespace-nowrap">
                    {module.badge}
                  </span>
                </div>
                <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-marcellus">
                  {module.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={module.status === "coming-soon"}
                  className="w-full"
                  href={module.status === "active" ? module.href : undefined}
                >
                  {module.ctaText}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
