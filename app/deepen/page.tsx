import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";
import Footer from "@/app/components/Footer";
import DeepenSubscribeButton from "./DeepenSubscribeButton";

export default async function DeepenPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return redirect("/login");
  }

  let hasAccess = false;
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);

    // Check if they already have Deepening tier access
    if (founderBypass || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
    }
  } catch {
    return redirect("/login");
  }

  // If they already have access, show the premium hub (layout provides DeepenNav + Footer)
  if (hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center space-y-6 mb-16">
          <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '55px' }}>
            Your Deepening Journey
          </h1>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            <span className="text-lavenderViolet text-xl">✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          </div>

          <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '28px' }}>
            You have premium access. Choose where to go next.
          </p>
          <p className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '18px' }}>
            Your membership is active — $59/month, cancel anytime.
          </p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
          <a
            href="/systems"
            className="block px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-marcellus text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #E6C87C, #d4af37)', fontSize: '32px' }}
          >
            <span className="block text-center" style={{ fontSize: '35px' }}>Systems</span>
            <span className="block text-center text-white/70 mt-1" style={{ fontSize: '18px' }}>Build your framework, workflows &amp; monetization tools</span>
          </a>
          <a
            href="/insights"
            className="block px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-marcellus text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #4B4E6D, #3a3d56)', fontSize: '32px' }}
          >
            <span className="block text-center" style={{ fontSize: '35px' }}>Reflections</span>
            <span className="block text-center text-white/70 mt-1" style={{ fontSize: '18px' }}>Review alignment trends, journal insights &amp; growth patterns</span>
          </a>
          <a
            href="/community"
            className="block px-6 sm:px-8 py-5 sm:py-6 rounded-2xl font-marcellus text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FCC4B7, #e8a090)', fontSize: '32px' }}
          >
            <span className="block text-center" style={{ fontSize: '35px' }}>Community</span>
            <span className="block text-center text-white/70 mt-1" style={{ fontSize: '18px' }}>Group reflections, shared wisdom &amp; connection</span>
          </a>
        </div>
      </div>
    );
  }

  // Not yet subscribed — show the membership sales page
  return (
    <div className="relative min-h-screen bg-white">

      {/* Hero */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center space-y-6 mb-16">
          <p className="font-marcellus text-warmCharcoal/50 tracking-[0.2em] uppercase" style={{ fontSize: '18px' }}>
            Membership
          </p>
          <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '55px' }}>
            Deepen Your Experience
          </h1>
          <p className="font-marcellus text-warmCharcoal/70 max-w-2xl mx-auto" style={{ fontSize: '28px' }}>
            You've done the inner work. Now build the systems, access reflections, and join the community that holds it all together.
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          <span className="text-lavenderViolet text-xl">✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
        </div>

        {/* What's Included */}
        <div className="max-w-2xl mx-auto space-y-8 mb-16">
          <h2 className="font-italiana text-warmCharcoal text-center" style={{ fontSize: '45px' }}>
            What's Included
          </h2>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-marcellus text-warmCharcoal" style={{ fontSize: '35px' }}>
                Systems
              </h3>
              <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '24px' }}>
                Offer architecture, workflows, calendar sync, and monetization tools to structure your purpose into action.
              </p>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-marcellus text-warmCharcoal" style={{ fontSize: '35px' }}>
                Reflections
              </h3>
              <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '24px' }}>
                A personal dashboard of your alignment trends, journal insights, and growth patterns over time.
              </p>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-marcellus text-warmCharcoal" style={{ fontSize: '35px' }}>
                Community
              </h3>
              <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '24px' }}>
                Private spaces for group reflections, shared wisdom, and connection with others on the same path.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          <span className="text-softGold text-xl">✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
        </div>

        {/* Pricing */}
        <div className="max-w-lg mx-auto text-center space-y-8 mb-16">
          <h2 className="font-italiana text-warmCharcoal" style={{ fontSize: '45px' }}>
            Simple, Recurring Access
          </h2>
          <div className="space-y-2">
            <p className="font-italiana text-warmCharcoal" style={{ fontSize: '60px' }}>
              $59<span className="text-warmCharcoal/50" style={{ fontSize: '28px' }}>/month</span>
            </p>
            <p className="font-marcellus text-warmCharcoal/50" style={{ fontSize: '20px' }}>
              Cancel anytime. No long-term commitment.
            </p>
          </div>

          <DeepenSubscribeButton />
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
          <span className="text-salmonPeach text-xl">✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
        </div>

        {/* Already an Accelerator member? */}
        <div className="text-center space-y-4">
          <p className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '20px' }}>
            Already completed the iPurpose Accelerator? Your Deepening access may already be included.
          </p>
          <a
            href="/support"
            className="font-marcellus text-lavenderViolet hover:opacity-80 transition-opacity underline"
            style={{ fontSize: '20px' }}
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
