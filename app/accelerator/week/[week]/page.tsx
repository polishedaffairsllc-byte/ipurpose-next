import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";
import { ACCELERATOR_STAGES, CURRENT_COHORT } from "@/lib/accelerator/stages";
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
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);

    if (founderBypass || userData?.entitlement?.tier === "ACCELERATOR" || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
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

  // Navigation: prev/next week
  const prevWeek = weekNumber > 1 ? weekNumber - 1 : null;
  const nextWeek = weekNumber < 6 ? weekNumber + 1 : null;

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

      {/* Back to Accelerator */}
      <Link
        href="/accelerator"
        className="inline-block font-marcellus text-warmCharcoal/40 hover:text-warmCharcoal/60 transition-colors mb-8"
        style={{ fontSize: '16px' }}
      >
        ← Back to Accelerator
      </Link>

      {/* Stage Header */}
      <div className="text-center space-y-4 mb-10">
        <p className="font-marcellus text-warmCharcoal/40 tracking-[0.2em] uppercase" style={{ fontSize: '14px' }}>
          {stage.subtitle} — Week {stage.week}
        </p>
        <h1 className="font-italiana text-warmCharcoal" style={{ fontSize: '50px' }}>
          {stage.title}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div style={{ height: '2px', width: '80px', background: `linear-gradient(to right, transparent, ${stage.color}, transparent)` }}></div>
          <span style={{ color: stage.color }} className="text-xl">{stage.icon}</span>
          <div style={{ height: '2px', width: '80px', background: `linear-gradient(to right, transparent, ${stage.color}, transparent)` }}></div>
        </div>
      </div>

      {/* ─── 1. Overview Block ─── */}
      <section className="mb-12 rounded-2xl p-6 sm:p-8" style={{ backgroundColor: stage.colorFaded }}>
        <div className="space-y-6">
          <div>
            <h3 className="font-marcellus text-warmCharcoal/50 uppercase tracking-wider mb-2" style={{ fontSize: '13px' }}>
              What this week is about
            </h3>
            <p className="font-marcellus text-warmCharcoal/80" style={{ fontSize: '18px', lineHeight: '1.7' }}>
              {stage.overview.about}
            </p>
          </div>
          <div>
            <h3 className="font-marcellus text-warmCharcoal/50 uppercase tracking-wider mb-2" style={{ fontSize: '13px' }}>
              What shifts internally
            </h3>
            <p className="font-marcellus text-warmCharcoal/80" style={{ fontSize: '18px', lineHeight: '1.7' }}>
              {stage.overview.shifts}
            </p>
          </div>
          <div>
            <h3 className="font-marcellus text-warmCharcoal/50 uppercase tracking-wider mb-2" style={{ fontSize: '13px' }}>
              What you&apos;ll build
            </h3>
            <p className="font-marcellus text-warmCharcoal/80" style={{ fontSize: '18px', lineHeight: '1.7' }}>
              {stage.overview.builds}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. Lesson Content ─── */}
      <section className="mb-12">
        <h2 className="font-italiana text-warmCharcoal text-center mb-6" style={{ fontSize: '36px' }}>
          Lesson Content
        </h2>
        <div className="space-y-3">
          {stage.lessons.map((lesson, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4 rounded-xl border border-warmCharcoal/8 hover:border-warmCharcoal/20 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
            >
              <span className="shrink-0 mt-1" style={{ fontSize: '20px' }}>
                {typeIcon[lesson.type] || "📄"}
              </span>
              <div>
                <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '20px' }}>
                  {lesson.title}
                </p>
                <p className="font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '15px' }}>
                  {lesson.description}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full font-marcellus text-warmCharcoal/40 border border-warmCharcoal/10" style={{ fontSize: '12px' }}>
                  {lesson.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Client Resources ─── */}
      <section className="mb-12">
        <h2 className="font-italiana text-warmCharcoal text-center mb-6" style={{ fontSize: '36px' }}>
          Resources
        </h2>
        <div className="space-y-3">
          {stage.resources.map((resource, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4 rounded-xl border border-warmCharcoal/8"
            >
              <span className="shrink-0 mt-1" style={{ fontSize: '20px' }}>
                {typeIcon[resource.type] || "📄"}
              </span>
              <div className="flex-1">
                <p className="font-marcellus text-warmCharcoal" style={{ fontSize: '18px' }}>
                  {resource.title}
                </p>
                <p className="font-marcellus text-warmCharcoal/50 mt-1" style={{ fontSize: '14px' }}>
                  {resource.description}
                </p>
              </div>
              {resource.href ? (
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-marcellus text-lavenderViolet hover:opacity-80 transition-opacity"
                  style={{ fontSize: '14px' }}
                >
                  Open →
                </a>
              ) : (
                <span className="shrink-0 font-marcellus text-warmCharcoal/30" style={{ fontSize: '14px' }}>
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. Reflection Prompts ─── */}
      <section className="mb-12">
        <h2 className="font-italiana text-warmCharcoal text-center mb-6" style={{ fontSize: '36px' }}>
          Reflection Prompts
        </h2>
        <div className="space-y-4">
          {stage.reflections.map((reflection, i) => (
            <div
              key={i}
              className="px-5 py-4 rounded-xl"
              style={{
                backgroundColor: reflection.type === 'integration'
                  ? 'rgba(156, 136, 255, 0.06)'
                  : 'rgba(230, 200, 124, 0.08)',
                borderLeft: `3px solid ${reflection.type === 'integration' ? '#9C88FF' : '#E6C87C'}`,
              }}
            >
              <p className="font-marcellus text-warmCharcoal/80 italic" style={{ fontSize: '18px', lineHeight: '1.7' }}>
                &ldquo;{reflection.prompt}&rdquo;
              </p>
              <span className="inline-block mt-2 font-marcellus text-warmCharcoal/30 uppercase tracking-wider" style={{ fontSize: '11px' }}>
                {reflection.type === 'integration' ? 'Integration' : 'Journal'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. Live Call Panel ─── */}
      <section className="mb-12">
        <LiveCallPanel
          callDay={CURRENT_COHORT.liveCallDay}
          callTimes={CURRENT_COHORT.liveCallTimes}
          zoomLink={CURRENT_COHORT.zoomLink}
          weekNumber={weekNumber}
        />
      </section>

      {/* ─── 6. Progress Marker ─── */}
      <section className="mb-12">
        <WeekCompleteButton week={weekNumber} isCompleted={isCompleted} />
      </section>

      {/* Week Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-warmCharcoal/10">
        {prevWeek ? (
          <Link
            href={`/accelerator/week/${prevWeek}`}
            className="font-marcellus text-warmCharcoal/50 hover:text-warmCharcoal/70 transition-colors"
            style={{ fontSize: '18px' }}
          >
            ← Week {prevWeek}
          </Link>
        ) : (
          <span />
        )}
        {nextWeek ? (
          <Link
            href={`/accelerator/week/${nextWeek}`}
            className="font-marcellus text-warmCharcoal/50 hover:text-warmCharcoal/70 transition-colors"
            style={{ fontSize: '18px' }}
          >
            Week {nextWeek} →
          </Link>
        ) : (
          <Link
            href="/accelerator"
            className="font-marcellus text-lavenderViolet hover:opacity-80 transition-opacity"
            style={{ fontSize: '18px' }}
          >
            Back to Dashboard →
          </Link>
        )}
      </div>
    </div>
  );
}
