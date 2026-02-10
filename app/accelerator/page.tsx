import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";
import { ACCELERATOR_STAGES, CURRENT_COHORT, getUnlockedWeek } from "@/lib/accelerator/stages";
import AcceleratorProgressBar from "./AcceleratorProgressBar";
import Link from "next/link";

export default async function AcceleratorPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return redirect("/login");
  }

  let hasAccess = false;
  let userName = "";
  let completedWeeks: number[] = [];
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);

    if (founderBypass || userData?.entitlement?.tier === "ACCELERATOR" || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
    }
    userName = userData?.displayName || decoded.name || "";

    // Fetch progress
    const progressDoc = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("accelerator")
      .doc("progress")
      .get();
    const progressData = progressDoc.data();
    if (progressData?.completedWeeks) {
      completedWeeks = progressData.completedWeeks;
    }
  } catch {
    return redirect("/login");
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '36px' }}>
            iPurpose Accelerator
          </h1>

          <div className="flex items-center justify-center gap-3">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
            <span className="text-softGold text-xl">✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          </div>

          <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '18px' }}>
            Six weeks to clarify your purpose and build aligned systems.
          </p>

          <div className="rounded-2xl p-8 sm:p-12 mt-8" style={{ background: 'linear-gradient(135deg, rgba(230, 200, 124, 0.15), rgba(230, 200, 124, 0.05))' }}>
            <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '18px' }}>
              You don&apos;t have access to the Accelerator yet.
            </p>
            <a
              href="/program"
              className="inline-block mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0.5))', fontSize: '16px' }}
            >
              Learn More &amp; Enroll
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Determine current unlock state
  const unlockedWeek = getUnlockedWeek(CURRENT_COHORT.startDate);
  // For founders, unlock all weeks
  const effectiveUnlocked = 6; // founder bypass — all weeks accessible

  // Format dates
  const startDate = new Date(CURRENT_COHORT.startDate);
  const formattedStart = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Determine current active week (first incomplete unlocked week)
  const currentActiveWeek = ACCELERATOR_STAGES.find(
    (s) => s.week <= effectiveUnlocked && !completedWeeks.includes(s.week)
  )?.week ?? effectiveUnlocked;

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '36px' }}>
          iPurpose Accelerator
        </h1>
        <p className="font-marcellus text-warmCharcoal/50 tracking-[0.15em] uppercase" style={{ fontSize: '16px' }}>
          {CURRENT_COHORT.label}
        </p>
        <p className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '16px' }}>
          Launching March 2026
        </p>
      </div>

      {/* Decorative Divider */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
        <span className="text-softGold text-xl">✦</span>
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <AcceleratorProgressBar currentWeek={effectiveUnlocked} completedWeeks={completedWeeks} />
      </div>

      {/* Welcome message */}
      <div className="text-center mb-12">
        <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '18px' }}>
          {userName ? `Welcome back, ${userName}.` : 'Welcome.'} {completedWeeks.length === 0
            ? 'Your journey begins here.'
            : completedWeeks.length === 6
            ? 'You\'ve completed every stage. What a journey.'
            : 'Pick up where you left off.'}
        </p>
      </div>

      {/* Next Live Session Info */}
      <div className="max-w-xl mx-auto mb-12 rounded-2xl p-5 sm:p-6 text-center border border-warmCharcoal/10" style={{ background: 'rgba(75, 78, 109, 0.04)' }}>
        <p className="font-marcellus text-warmCharcoal/50" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>
          NEXT LIVE SESSION
        </p>
        <p className="font-marcellus text-warmCharcoal/70 mt-2" style={{ fontSize: '16px' }}>
          {CURRENT_COHORT.liveCallDay} — {CURRENT_COHORT.liveCallTimes.join(' or ')}
        </p>
      </div>

      {/* Stage Cards */}
      <div className="space-y-4 max-w-2xl mx-auto mb-16">
        {ACCELERATOR_STAGES.map((stage) => {
          const isUnlocked = stage.week <= effectiveUnlocked;
          const isCompleted = completedWeeks.includes(stage.week);
          const isCurrent = stage.week === currentActiveWeek;

          return (
            <div key={stage.week} className="relative">
              {isUnlocked ? (
                <Link
                  href={`/accelerator/week/${stage.week}`}
                  className="flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl text-white hover:opacity-90 transition-all duration-300 group block"
                  style={{
                    background: `linear-gradient(135deg, ${stage.color}, ${stage.color}99)`,
                    boxShadow: isCurrent ? `0 4px 20px ${stage.color}40` : 'none',
                  }}
                >
                  {/* Stage number */}
                  <span className="font-italiana shrink-0" style={{ fontSize: '28px' }}>
                    {isCompleted ? '✓' : stage.week}
                  </span>
                  <div className="flex-1">
                  <span className="block font-marcellus text-white/50" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>
                    {stage.subtitle}
                  </span>
                  <span className="block font-marcellus mt-1" style={{ fontSize: '18px' }}>
                    {stage.title}
                  </span>
                    {isCurrent && (
                      <span className="block font-marcellus text-white/70 mt-1" style={{ fontSize: '14px' }}>
                        Currently here →
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className="flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-5 sm:py-6 rounded-2xl opacity-40 cursor-not-allowed"
                  style={{ background: '#e5e7eb' }}
                >
                  <span className="font-italiana text-warmCharcoal/40 shrink-0" style={{ fontSize: '28px' }}>
                    🔒
                  </span>
                  <div>
                    <span className="block font-marcellus text-warmCharcoal/40" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>
                      {stage.subtitle}
                    </span>
                    <span className="block font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '18px' }}>
                      {stage.title}
                    </span>
                    <span className="block font-marcellus text-warmCharcoal/30 mt-1" style={{ fontSize: '14px' }}>
                      Unlocks in Week {stage.week}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-completion: Continue Your Growth */}
      {completedWeeks.length === 6 && (
        <div className="max-w-2xl mx-auto text-center space-y-6 pt-8 border-t border-warmCharcoal/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{ height: '2px', width: '80px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            <span className="text-lavenderViolet text-xl">✦</span>
            <div style={{ height: '2px', width: '80px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          </div>

          <h2 className="font-italiana text-warmCharcoal" style={{ fontSize: '28px' }}>
            Continue Your Growth
          </h2>
          <p className="font-marcellus text-warmCharcoal/60 max-w-lg mx-auto" style={{ fontSize: '16px' }}>
            You&apos;ve completed the Accelerator. The inner work continues. Deepen is where you refine your systems, access ongoing reflections, and stay connected to community.
          </p>
          <Link
            href="/deepen"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.5))', fontSize: '16px' }}
          >
            ✦ Continue with Deepen
          </Link>
        </div>
      )}
    </div>
  );
}
