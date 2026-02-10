import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";

export default async function AcceleratorPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return redirect("/login");
  }

  let hasAccess = false;
  let userName = "";
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);

    // Check if they have accelerator access
    if (founderBypass || userData?.entitlement?.tier === "ACCELERATOR" || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
    }
    userName = userData?.displayName || decoded.name || "";
  } catch {
    return redirect("/login");
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '55px' }}>
            iPurpose Accelerator
          </h1>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
            <span className="text-softGold text-xl">✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          </div>

          <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '28px' }}>
            Six weeks to clarify your purpose and build aligned systems.
          </p>

          <div className="rounded-2xl p-8 sm:p-12 mt-8" style={{ background: 'linear-gradient(135deg, rgba(230, 200, 124, 0.15), rgba(230, 200, 124, 0.05))' }}>
            <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '20px' }}>
              You don't have access to the Accelerator yet.
            </p>
            <a
              href="/program"
              className="inline-block mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0.5))', fontSize: '24px' }}
            >
              Learn More & Enroll
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Enrolled — show the course hub
  const weeks = [
    {
      number: 1,
      title: "Clarity & Alignment",
      description: "Define your purpose statement, identify your archetype, and map your core values.",
      color: "#9C88FF",
    },
    {
      number: 2,
      title: "Remove Internal Blocks",
      description: "Surface limiting beliefs, release resistance patterns, and create space for growth.",
      color: "#FCC4B7",
    },
    {
      number: 3,
      title: "Vision & Identity",
      description: "Craft your identity anchor, build your personal vision board, and align daily habits.",
      color: "#4B4E6D",
    },
    {
      number: 4,
      title: "Systems & Structure",
      description: "Design workflows, build your offer architecture, and set up aligned business systems.",
      color: "#E6C87C",
    },
    {
      number: 5,
      title: "Momentum & Action",
      description: "Create your 90-day plan, establish accountability rhythms, and launch your first cycle.",
      color: "#88b04b",
    },
    {
      number: 6,
      title: "Integration & Launch",
      description: "Reflect on your transformation, solidify your framework, and step into your next chapter.",
      color: "#d4af37",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center space-y-6 mb-16">
        <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '55px' }}>
          iPurpose Accelerator
        </h1>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          <span className="text-softGold text-xl">✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
        </div>

        <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '28px' }}>
          {userName ? `Welcome back, ${userName}.` : "Your 6-week journey."} Pick up where you left off.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {weeks.map((week) => (
          <div
            key={week.number}
            className="flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl text-white hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${week.color}, ${week.color}99)` }}
          >
            <span className="font-italiana shrink-0" style={{ fontSize: '48px' }}>
              {week.number}
            </span>
            <div>
              <span className="block font-marcellus" style={{ fontSize: '28px' }}>
                {week.title}
              </span>
              <span className="block font-marcellus text-white/70 mt-1" style={{ fontSize: '16px' }}>
                {week.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
