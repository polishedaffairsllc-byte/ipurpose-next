import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";
import {
  ACCELERATOR_STAGES,
  getUnlockedWeek,
  getCohortById,
  getEnrollableCohort,
  isCohortPreLaunch,
} from "@/lib/accelerator/stages";
import LiveCallPanel from "../../LiveCallPanel";
import WeekCompleteButton from "../../WeekCompleteButton";
import Link from "next/link";

interface Props {
  params: Promise<{ week: string }>;
}

export default async function AcceleratorWeekPage({ params }: Props) {
  const { week: weekParam } = await params;
  const weekNumber = parseInt(weekParam, 10);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
    return notFound();
  }

  const stage = ACCELERATOR_STAGES.find((s) => s.week === weekNumber);
  if (!stage) return notFound();

  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  let hasAccess = false;
  let completedWeeks: number[] = [];
  let isFounder = false;
  let userCohortId = "";
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);
    isFounder = founderBypass;

    if (founderBypass || userData?.entitlement?.tier === "ACCELERATOR" || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
    }

    // Primary source: cohortId from entitlement (assigned at purchase)
    userCohortId = userData?.entitlement?.cohortId || "";

    // Fallback: cohortId from registration subcollection
    if (!userCohortId) {
      const regDoc = await db
        .collection("users")
        .doc(decoded.uid)
        .collection("accelerator")
        .doc("registration")
        .get();
      if (regDoc.exists) {
        userCohortId = regDoc.data()?.cohortId || "";
      }
    }

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

  if (!hasAccess) return redirect("/accelerator");

  // ─── Cohort-aware week gating ────────────────────────────────────────
  const userCohort = userCohortId
    ? getCohortById(userCohortId) ?? getEnrollableCohort()
    : getEnrollableCohort();

  // Pre-launch: no weeks accessible (unless founder)
  if (isCohortPreLaunch(userCohort) && !isFounder) {
    return redirect("/accelerator");
  }

  // Time-gated unlock: can't skip ahead
  const unlockedWeek = getUnlockedWeek(userCohort.startDate);
  const effectiveUnlocked = isFounder ? 6 : unlockedWeek;

  if (weekNumber > effectiveUnlocked) {
    // Week not yet unlocked — redirect back to hub
    return redirect("/accelerator");
  }

  const isCompleted = completedWeeks.includes(weekNumber);

  // Resource type icons
  const typeIcon: Record<string, string> = {
    video: "▶",
    worksheet: "📄",
    meditation: "🧘",
    exercise: "✍️",
    template: "📋",
    guide: "📖",
  };

  // Navigation: prev/next week (only if unlocked)
  const prevWeek = weekNumber > 1 ? weekNumber - 1 : null;
  const nextWeek = weekNumber < 6 && weekNumber + 1 <= effectiveUnlocked ? weekNumber + 1 : null;

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20" style={{ background: 'linear-gradient(180deg, rgba(245, 241, 235, 0.5) 0%, rgba(250, 248, 244, 0.3) 50%, rgba(245, 241, 235, 0.5) 100%)', borderRadius: '8px' }}>

      {/* Back to Accelerator */}
      <Link
        href="/accelerator"
        className="inline-block font-marcellus text-warmCharcoal/40 hover:text-warmCharcoal/60 transition-colors mb-10"
        style={{ fontSize: '30px', letterSpacing: '0.1em' }}
      >
        ← Return to Curriculum
      </Link>

      {/* ═══ Academic Stage Header ═══ */}
      <div className="text-center mb-12">
        {/* Roman numeral with decorative lines */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div style={{ height: '1px', flex: 1, maxWidth: '80px', background: `linear-gradient(to right, transparent, ${stage.color})` }}></div>
          <span className="font-italiana" style={{ fontSize: '65px', color: stage.color }}>
            {['I', 'II', 'III', 'IV', 'V', 'VI'][stage.week - 1]}
          </span>
          <div style={{ height: '1px', flex: 1, maxWidth: '80px', background: `linear-gradient(to left, transparent, ${stage.color})` }}></div>
        </div>

        <p className="font-marcellus text-warmCharcoal/35 uppercase mb-2" style={{ fontSize: '25px', letterSpacing: '0.35em' }}>
          {stage.subtitle} — Week {stage.week} of Six
        </p>
        <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '60px', letterSpacing: '0.04em' }}>
          {stage.title}
        </h1>

        {/* Academic double rule */}
        <div className="mt-6 mx-auto" style={{ maxWidth: '220px' }}>
          <div style={{ height: '2px', background: `linear-gradient(to right, transparent, ${stage.color}, transparent)` }}></div>
          <div className="mt-1" style={{ height: '1px', background: `linear-gradient(to right, transparent, ${stage.color}60, transparent)` }}></div>
        </div>
      </div>

      {/* ═══ Epigraph — Chapter Opening Quote ═══ */}
      <div className="max-w-2xl mx-auto mb-14 text-center px-6 sm:px-10 py-8" style={{ borderLeft: `3px solid ${stage.color}30`, borderRight: `3px solid ${stage.color}30` }}>
        <p className="font-marcellus text-warmCharcoal/60 italic" style={{ fontSize: '38px', lineHeight: '1.7' }}>
          &ldquo;{stage.epigraph.quote}&rdquo;
        </p>
        <p className="font-marcellus text-warmCharcoal/30 mt-4" style={{ fontSize: '25px', letterSpacing: '0.15em' }}>
          — {stage.epigraph.attribution}
        </p>
      </div>

      {/* ─── §1. Overview — Scholarly Abstract ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§1</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Overview
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>

        <div className="space-y-8 pl-4 sm:pl-6" style={{ borderLeft: `2px solid ${stage.color}30` }}>
          <div>
            <h3 className="font-marcellus text-warmCharcoal/40 uppercase tracking-wider mb-3" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
              What This Week Is About
            </h3>
            {/* Drop cap on first paragraph */}
            <p className="font-marcellus text-warmCharcoal/75" style={{ fontSize: '45px', lineHeight: '1.8' }}>
              <span className="font-italiana float-left mr-2" style={{ fontSize: '90px', lineHeight: '0.85', color: stage.color, marginTop: '4px' }}>
                {stage.overview.about.charAt(0)}
              </span>
              {stage.overview.about.slice(1)}
            </p>
          </div>
          <div>
            <h3 className="font-marcellus text-warmCharcoal/40 uppercase tracking-wider mb-3" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
              What Shifts Internally
            </h3>
            <p className="font-marcellus text-warmCharcoal/75" style={{ fontSize: '45px', lineHeight: '1.8' }}>
              {stage.overview.shifts}
            </p>
          </div>
          <div>
            <h3 className="font-marcellus text-warmCharcoal/40 uppercase tracking-wider mb-3" style={{ fontSize: '25px', letterSpacing: '0.25em' }}>
              What You&apos;ll Build
            </h3>
            <p className="font-marcellus text-warmCharcoal/75" style={{ fontSize: '45px', lineHeight: '1.8' }}>
              {stage.overview.builds}
            </p>
          </div>
        </div>
      </section>

      {/* ─── §2. Lesson Content — Course Materials ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§2</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Lesson Content
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>

        <div className="space-y-0">
          {stage.lessons.map((lesson, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-5 transition-colors"
              style={{
                borderBottom: i < stage.lessons.length - 1 ? '1px solid rgba(75, 78, 109, 0.06)' : 'none',
                borderLeft: `2px solid ${stage.color}20`,
              }}
            >
              <span className="shrink-0 font-italiana text-warmCharcoal/20 mt-1" style={{ fontSize: '35px', width: '40px', textAlign: 'right' }}>
                {i + 1}.
              </span>
              <div>
                <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '45px' }}>
                  {lesson.title}
                </p>
                <p className="font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '38px', lineHeight: '1.6' }}>
                  {lesson.description}
                </p>
                <span className="inline-block mt-2 px-3 py-1 font-marcellus text-warmCharcoal/35 uppercase" style={{ fontSize: '22px', letterSpacing: '0.2em', border: '1px solid rgba(75, 78, 109, 0.1)' }}>
                  {lesson.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── §3. Client Resources — Reference Materials ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§3</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Reference Materials
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>

        <div className="space-y-0">
          {stage.resources.map((resource, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-5"
              style={{
                borderBottom: i < stage.resources.length - 1 ? '1px solid rgba(75, 78, 109, 0.06)' : 'none',
                borderLeft: `2px solid ${stage.color}20`,
              }}
            >
              <span className="shrink-0 font-marcellus text-warmCharcoal/20 mt-1" style={{ fontSize: '32px' }}>
                {typeIcon[resource.type] || "📄"}
              </span>
              <div className="flex-1">
                <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '45px' }}>
                  {resource.title}
                </p>
                <p className="font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '38px', lineHeight: '1.6' }}>
                  {resource.description}
                </p>
              </div>
              {resource.href ? (
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-marcellus hover:opacity-80 transition-opacity uppercase"
                  style={{ fontSize: '28px', color: stage.color, letterSpacing: '0.15em' }}
                >
                  Open →
                </a>
              ) : (
                <span className="shrink-0 font-marcellus text-warmCharcoal/25 italic" style={{ fontSize: '28px' }}>
                  Forthcoming
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── §4. Reflection Prompts — Inquiry ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§4</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Inquiry &amp; Reflection
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>

        <div className="space-y-5">
          {stage.reflections.map((reflection, i) => (
            <div
              key={i}
              className="px-6 py-5"
              style={{
                borderLeft: `3px solid ${reflection.type === 'integration' ? '#9C88FF' : '#E6C87C'}`,
                background: reflection.type === 'integration'
                  ? 'rgba(156, 136, 255, 0.04)'
                  : 'rgba(230, 200, 124, 0.04)',
              }}
            >
              <p className="font-marcellus text-warmCharcoal/75 italic" style={{ fontSize: '45px', lineHeight: '1.8' }}>
                &ldquo;{reflection.prompt}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div style={{ height: '1px', width: '20px', background: reflection.type === 'integration' ? '#9C88FF40' : '#E6C87C40' }}></div>
                <span className="font-marcellus text-warmCharcoal/30 uppercase" style={{ fontSize: '22px', letterSpacing: '0.2em' }}>
                  {reflection.type === 'integration' ? 'Integration Prompt' : 'Journal Prompt'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── §5. Live Seminar ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§5</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Live Seminar
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>
        <LiveCallPanel
          callDay={userCohort.liveCallDay}
          callTimes={userCohort.liveCallTimes}
          zoomLinks={userCohort.zoomLinks}
          weekNumber={weekNumber}
        />
      </section>

      {/* ─── §6. Progress ─── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-italiana text-warmCharcoal/25" style={{ fontSize: '32px' }}>§6</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
          <p className="font-marcellus text-warmCharcoal/40 uppercase shrink-0" style={{ fontSize: '25px', letterSpacing: '0.3em' }}>
            Progress
          </p>
          <div style={{ height: '1px', flex: 1, background: 'rgba(75, 78, 109, 0.1)' }}></div>
        </div>
        <WeekCompleteButton week={weekNumber} isCompleted={isCompleted} />
      </section>

      {/* ═══ Week Navigation — Academic Pagination ═══ */}
      <div className="pt-8" style={{ borderTop: '2px solid rgba(75, 78, 109, 0.08)' }}>
        <div className="flex items-center justify-between">
          {prevWeek ? (
            <Link
              href={`/accelerator/week/${prevWeek}`}
              className="font-marcellus text-warmCharcoal/40 hover:text-warmCharcoal/60 transition-colors"
              style={{ fontSize: '30px', letterSpacing: '0.05em' }}
            >
              ← Week {prevWeek}: {ACCELERATOR_STAGES[prevWeek - 1]?.title}
            </Link>
          ) : (
            <span />
          )}
          {nextWeek ? (
            <Link
              href={`/accelerator/week/${nextWeek}`}
              className="font-marcellus text-warmCharcoal/40 hover:text-warmCharcoal/60 transition-colors"
              style={{ fontSize: '30px', letterSpacing: '0.05em' }}
            >
              Week {nextWeek}: {ACCELERATOR_STAGES[nextWeek - 1]?.title} →
            </Link>
          ) : (
            <Link
              href="/accelerator"
              className="font-marcellus hover:opacity-80 transition-opacity"
              style={{ fontSize: '30px', color: '#9C88FF', letterSpacing: '0.05em' }}
            >
              Return to Curriculum →
            </Link>
          )}
        </div>

        {/* Colophon */}
        <div className="text-center mt-10">
          <div className="flex items-center justify-center gap-3">
            <div style={{ height: '1px', width: '30px', background: `${stage.color}30` }}></div>
            <span className="font-italiana" style={{ fontSize: '28px', color: `${stage.color}40` }}>✦</span>
            <div style={{ height: '1px', width: '30px', background: `${stage.color}30` }}></div>
          </div>
          <p className="font-marcellus text-warmCharcoal/20 mt-2" style={{ fontSize: '25px', letterSpacing: '0.2em' }}>
            {stage.subtitle.toUpperCase()} · {stage.title}
          </p>
        </div>
      </div>
    </div>
  );
}
