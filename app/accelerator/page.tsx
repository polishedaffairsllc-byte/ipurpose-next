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
  let soulIdentity = "";
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

    // Fetch soul identity (archetype)
    const prefsDoc = await db.collection("user-preferences").doc(decoded.uid).get();
    const prefsData = prefsDoc.data();
    if (prefsData?.soul?.primaryArchetype) {
      soulIdentity = prefsData.soul.primaryArchetype;
    }
  } catch {
    return redirect("/login");
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '60px' }}>
            iPurpose Accelerator<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span>
          </h1>

          <div className="flex items-center justify-center gap-3">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
            <span className="text-softGold text-xl">✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          </div>

          <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '45px' }}>
            Six weeks to clarify your purpose and build aligned systems.
          </p>

          <div className="rounded-2xl p-8 sm:p-12 mt-8" style={{ background: 'linear-gradient(135deg, rgba(230, 200, 124, 0.15), rgba(230, 200, 124, 0.05))' }}>
            <p className="font-marcellus text-warmCharcoal/60" style={{ fontSize: '45px' }}>
              You don&apos;t have access to the Accelerator yet.
            </p>
            <a
              href="/program"
              className="inline-block mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0.5))', fontSize: '35px' }}
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
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20" style={{ background: 'linear-gradient(180deg, rgba(245, 241, 235, 0.5) 0%, rgba(250, 248, 244, 0.3) 50%, rgba(245, 241, 235, 0.5) 100%)', borderRadius: '8px' }}>

      {/* ═══ Scholarly Header with Certificate-Style Framing ═══ */}
      <div className="text-center mb-12">
        {/* Top ornamental border */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div style={{ height: '1px', flex: 1, maxWidth: '120px', background: 'linear-gradient(to right, transparent, #4B4E6D)' }}></div>
          <span className="font-italiana text-warmCharcoal/30" style={{ fontSize: '35px', letterSpacing: '0.3em' }}>EST. 2025</span>
          <div style={{ height: '1px', flex: 1, maxWidth: '120px', background: 'linear-gradient(to left, transparent, #4B4E6D)' }}></div>
        </div>

        {/* Title with academic styling */}
        <p className="font-marcellus text-warmCharcoal/40 uppercase mb-3" style={{ fontSize: '28px', letterSpacing: '0.35em' }}>
          A Six-Week Intensive in Purpose-Driven Transformation
        </p>
        <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '60px', letterSpacing: '0.04em' }}>
          iPurpose Accelerator<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span>
        </h1>

        {/* Cohort badge — like a course catalog label */}
        <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full border border-warmCharcoal/15" style={{ background: 'rgba(75, 78, 109, 0.04)' }}>
          <span className="font-marcellus text-warmCharcoal/60 uppercase" style={{ fontSize: '28px', letterSpacing: '0.2em' }}>
            {CURRENT_COHORT.label}
          </span>
          <span className="text-warmCharcoal/20">·</span>
          <span className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '28px', letterSpacing: '0.1em' }}>
            Launching March 2026
          </span>
        </div>

        {/* Decorative rule — academic double-line */}
        <div className="mt-8 mx-auto" style={{ maxWidth: '280px' }}>
          <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          <div className="mt-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, #E6C87C80, transparent)' }}></div>
        </div>

        {/* Guiding Principle — Epigraph */}
        <p className="font-marcellus text-warmCharcoal/40 mt-8 mx-auto italic" style={{ fontSize: '35px', lineHeight: '1.7', maxWidth: '600px' }}>
          &ldquo;Clarity precedes action. Alignment precedes impact.&rdquo;
        </p>
      </div>

      {/* ═══ Progress Bar ═══ */}
      <div className="mb-12">
        <AcceleratorProgressBar currentWeek={effectiveUnlocked} completedWeeks={completedWeeks} />
        <p className="font-marcellus text-warmCharcoal/35 text-center mt-4" style={{ fontSize: '28px', letterSpacing: '0.1em' }}>
          {completedWeeks.length} of 6 stages complete
        </p>
      </div>

      {/* ═══ Welcome — Drop Cap Style ═══ */}
      <div className="max-w-2xl mx-auto mb-14 text-center">
        <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '45px', lineHeight: '1.8' }}>
          <span className="font-italiana float-left mr-2" style={{ fontSize: '90px', lineHeight: '0.85', color: '#9C88FF', marginTop: '4px' }}>
            W
          </span>
          {userName ? `elcome back, ${userName}${soulIdentity ? ` the ${soulIdentity}` : ''}.` : 'elcome.'}{' '}
          {completedWeeks.length === 0
            ? 'Your journey through these six stages of transformation begins here. Each week builds upon the last — a deliberate sequence designed to move you from inner clarity to outer coherence.'
            : completedWeeks.length === 6
            ? 'You have completed every stage of the Accelerator. What began as inquiry has become integration. The work continues.'
            : 'Your work is in progress. Return to where the thread was last held, and continue weaving.'}
        </p>
      </div>

      {/* ═══ Next Live Session — Seminar Card ═══ */}
      <div className="max-w-xl mx-auto mb-14 p-6 sm:p-8 text-center" style={{ background: 'rgba(75, 78, 109, 0.03)', border: '1px solid rgba(75, 78, 109, 0.1)', borderTop: '3px solid #4B4E6D' }}>
        <p className="font-marcellus text-warmCharcoal/40 uppercase tracking-widest mb-1" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
          Live Seminar
        </p>
        <p className="font-italiana text-warmCharcoal" style={{ fontSize: '45px' }}>
          {CURRENT_COHORT.liveCallDay}
        </p>
        <p className="font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '35px' }}>
          {CURRENT_COHORT.liveCallTimes.join('  ·  ')}
        </p>
        <div className="mt-3 mx-auto" style={{ height: '1px', maxWidth: '60px', background: '#E6C87C' }}></div>
      </div>

      {/* ═══ Curriculum Section Header ═══ */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.15)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '28px', letterSpacing: '0.3em' }}>
            Curriculum
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.15)' }}></div>
        </div>
        <p className="font-marcellus text-warmCharcoal/40 text-center" style={{ fontSize: '32px', fontStyle: 'italic' }}>
          Six stages. One coherent arc. Each builds on the last.
        </p>
      </div>

      {/* ═══ Stage Cards — Academic Syllabus Style ═══ */}
      <div className="space-y-0 max-w-2xl mx-auto mb-16">
        {ACCELERATOR_STAGES.map((stage, index) => {
          const isUnlocked = stage.week <= effectiveUnlocked;
          const isCompleted = completedWeeks.includes(stage.week);
          const isCurrent = stage.week === currentActiveWeek;
          const isLast = index === ACCELERATOR_STAGES.length - 1;

          return (
            <div key={stage.week} className="relative">
              {isUnlocked ? (
                <Link
                  href={`/accelerator/week/${stage.week}`}
                  className="flex items-start gap-5 sm:gap-7 px-6 sm:px-8 py-6 sm:py-7 hover:opacity-90 transition-all duration-300 group block"
                  style={{
                    borderLeft: `3px solid ${stage.color}`,
                    borderBottom: isLast ? 'none' : '1px solid rgba(75, 78, 109, 0.08)',
                    background: isCurrent ? `${stage.colorFaded}` : 'transparent',
                  }}
                >
                  {/* Roman numeral / stage number */}
                  <div className="shrink-0 text-center" style={{ width: '70px' }}>
                    <span className="font-italiana block" style={{ fontSize: '50px', color: stage.color }}>
                      {isCompleted ? '✓' : ['I', 'II', 'III', 'IV', 'V', 'VI'][stage.week - 1]}
                    </span>
                    <span className="font-marcellus text-warmCharcoal/30 block" style={{ fontSize: '22px', letterSpacing: '0.15em' }}>
                      WEEK {stage.week}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="block font-marcellus text-warmCharcoal/40 uppercase" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
                      {stage.subtitle}
                    </span>
                    <span className="block font-italiana mt-1" style={{ fontSize: '40px', color: '#4B4E6D' }}>
                      {stage.title}
                    </span>
                    <span className="block font-marcellus text-warmCharcoal/50 mt-2" style={{ fontSize: '32px', lineHeight: '1.6', fontStyle: 'italic' }}>
                      {stage.overview.about.split('.')[0]}.
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full font-marcellus text-white" style={{ fontSize: '28px', background: stage.color, letterSpacing: '0.1em' }}>
                        ● Currently here
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className="flex items-start gap-5 sm:gap-7 px-6 sm:px-8 py-6 sm:py-7 opacity-40 cursor-not-allowed"
                  style={{
                    borderLeft: '3px solid #d1d5db',
                    borderBottom: isLast ? 'none' : '1px solid rgba(75, 78, 109, 0.05)',
                  }}
                >
                  <div className="shrink-0 text-center" style={{ width: '70px' }}>
                    <span className="font-italiana block text-warmCharcoal/30" style={{ fontSize: '50px' }}>
                      {['I', 'II', 'III', 'IV', 'V', 'VI'][stage.week - 1]}
                    </span>
                    <span className="font-marcellus text-warmCharcoal/20 block" style={{ fontSize: '22px', letterSpacing: '0.15em' }}>
                      WEEK {stage.week}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="block font-marcellus text-warmCharcoal/30 uppercase" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
                      {stage.subtitle}
                    </span>
                    <span className="block font-italiana text-warmCharcoal/40 mt-1" style={{ fontSize: '40px' }}>
                      {stage.title}
                    </span>
                    <span className="block font-marcellus text-warmCharcoal/25 mt-2" style={{ fontSize: '28px', fontStyle: 'italic' }}>
                      Unlocks in Week {stage.week}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-completion: Academic Commendation */}
      {completedWeeks.length === 6 && (
        <div className="max-w-2xl mx-auto text-center pt-10 pb-4">
          {/* Certificate-style border */}
          <div className="p-8 sm:p-12" style={{ border: '2px solid rgba(156, 136, 255, 0.25)', borderTop: '4px solid #9C88FF', background: 'rgba(156, 136, 255, 0.03)' }}>
            <p className="font-marcellus text-warmCharcoal/30 uppercase tracking-widest mb-4" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
              With Honors
            </p>
            <h2 className="font-italiana text-warmCharcoal" style={{ fontSize: '50px', letterSpacing: '0.04em' }}>
              Curriculum Complete
            </h2>
            <div className="mt-4 mx-auto" style={{ maxWidth: '200px' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
              <div className="mt-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, #9C88FF60, transparent)' }}></div>
            </div>
            <p className="font-marcellus text-warmCharcoal/50 max-w-lg mx-auto mt-6" style={{ fontSize: '38px', lineHeight: '1.8', fontStyle: 'italic' }}>
              You have traversed the full arc — from purpose alignment to launch. The inner work continues. Deepen is where refinement lives.
            </p>
            <Link
              href="/deepen"
              className="inline-block mt-6 px-8 py-3 font-marcellus text-white hover:opacity-90 transition-opacity"
              style={{ background: '#9C88FF', fontSize: '32px', letterSpacing: '0.15em' }}
            >
              CONTINUE WITH DEEPEN →
            </Link>
          </div>
        </div>
      )}

      {/* ═══ Footer Colophon ═══ */}
      <div className="max-w-2xl mx-auto text-center mt-16">
        <div className="flex items-center justify-center gap-3">
          <div style={{ height: '1px', width: '40px', background: 'rgba(75, 78, 109, 0.15)' }}></div>
          <span className="font-italiana text-warmCharcoal/20" style={{ fontSize: '28px' }}>✦</span>
          <div style={{ height: '1px', width: '40px', background: 'rgba(75, 78, 109, 0.15)' }}></div>
        </div>
        <p className="font-marcellus text-warmCharcoal/25 mt-3" style={{ fontSize: '25px', letterSpacing: '0.2em' }}>
          iPurpose™ Accelerator · {CURRENT_COHORT.label}
        </p>
      </div>
    </div>
  );
}
