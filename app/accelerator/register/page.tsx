import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import CohortRegistrationForm from "./CohortRegistrationForm";
import {
  getEnrollableCohort,
  getCohortEnrollmentStatus,
  getCohortById,
  getNextCohortAfter,
  getDaysUntilStart,
} from "@/lib/accelerator/stages";

export const metadata = {
  title: "Cohort Registration — iPurpose Accelerator™",
  description: "Register for the iPurpose Accelerator founding cohort.",
};

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  let uid = "";
  let email = "";
  let displayName = "";

  // Determine which cohort this person should be enrolled into
  const enrollableCohort = getEnrollableCohort();
  const enrollmentStatus = getCohortEnrollmentStatus(enrollableCohort);
  const nextCohort = getNextCohortAfter(enrollableCohort);

  if (session) {
    try {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
      uid = decoded.uid;
      email = decoded.email ?? "";
      displayName = decoded.name ?? "";

      // Check if already registered for any active cohort
      const db = firebaseAdmin.firestore();
      const regDoc = await db
        .collection("users")
        .doc(decoded.uid)
        .collection("accelerator")
        .doc("registration")
        .get();

      if (regDoc.exists) {
        const existingCohortId = regDoc.data()?.cohortId;
        const existingCohort = existingCohortId ? getCohortById(existingCohortId) : null;
        if (existingCohort) {
          const existingStatus = getCohortEnrollmentStatus(existingCohort);
          // If their cohort is still active or upcoming, send them to the hub
          if (existingStatus !== "completed") {
            return redirect("/accelerator");
          }
        }
      }
    } catch {
      // Session invalid — continue as unauthenticated
    }
  }

  const startDate = new Date(enrollableCohort.startDate);
  const formattedStart = startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const daysUntil = getDaysUntilStart(enrollableCohort);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, rgba(245,241,235,0.6) 0%, rgba(250,248,244,0.3) 40%, rgba(245,241,235,0.6) 100%)",
      }}
    >
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* ═══ Header ═══ */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              style={{
                height: "1px",
                flex: 1,
                maxWidth: "120px",
                background: "linear-gradient(to right, transparent, #E6C87C)",
              }}
            />
            <span className="font-italiana text-warmCharcoal/30" style={{ fontSize: "14px", letterSpacing: "0.3em" }}>
              {enrollableCohort.label.toUpperCase()}
            </span>
            <div
              style={{
                height: "1px",
                flex: 1,
                maxWidth: "120px",
                background: "linear-gradient(to left, transparent, #E6C87C)",
              }}
            />
          </div>

          <h1
            className="font-italiana text-warmCharcoal"
            style={{ fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "0.04em" }}
          >
            Cohort Registration
          </h1>

          <p
            className="font-marcellus text-warmCharcoal/50 mt-3"
            style={{ fontSize: "clamp(14px, 2.5vw, 18px)" }}
          >
            Begin your six-week journey in purpose-driven transformation
          </p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div
              style={{
                height: "2px",
                width: "60px",
                background: "linear-gradient(to right, transparent, #9C88FF, transparent)",
              }}
            />
            <span className="text-lavenderViolet text-sm">✦</span>
            <div
              style={{
                height: "2px",
                width: "60px",
                background: "linear-gradient(to right, transparent, #9C88FF, transparent)",
              }}
            />
          </div>

          <p className="font-marcellus text-warmCharcoal/40 text-sm mt-4">
            Begins {formattedStart} · {enrollableCohort.liveCallDay}s · Live calls at{" "}
            {enrollableCohort.liveCallTimes.join(" & ")}
          </p>

          {/* Enrollment status badge */}
          {enrollmentStatus === "grace" && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-marcellus"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#D97706",
              }}
            >
              <span>⏳</span>
              <span>Cohort in progress — enrollment closing soon</span>
            </div>
          )}

          {enrollmentStatus === "open" && daysUntil > 0 && daysUntil <= 14 && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-marcellus"
              style={{
                background: "rgba(156,136,255,0.06)",
                border: "1px solid rgba(156,136,255,0.15)",
                color: "#9C88FF",
              }}
            >
              <span>✦</span>
              <span>Starts in {daysUntil} {daysUntil === 1 ? "day" : "days"}</span>
            </div>
          )}
        </div>

        {/* ═══ Form or Closed Enrollment View ═══ */}
        {(enrollmentStatus === "closed" || enrollmentStatus === "completed") ? (
          <div
            className="rounded-2xl p-8 sm:p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(75,78,109,0.04), rgba(156,136,255,0.06))",
              border: "1px solid rgba(75,78,109,0.1)",
            }}
          >
            <div className="text-3xl mb-4">✦</div>
            <h2
              className="font-italiana text-warmCharcoal mb-3"
              style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
            >
              Enrollment Has Closed
            </h2>
            <p className="font-marcellus text-warmCharcoal/50 text-sm mb-2">
              The {enrollableCohort.label} has already begun and is no longer accepting new members.
            </p>

            {nextCohort && (() => {
              const nextStart = new Date(nextCohort.startDate);
              const nextFormatted = nextStart.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              const nextDays = getDaysUntilStart(nextCohort);

              return (
                <div
                  className="mt-8 p-6 sm:p-8 rounded-xl"
                  style={{
                    background: "rgba(156,136,255,0.04)",
                    border: "1px solid rgba(156,136,255,0.12)",
                  }}
                >
                  <p className="font-marcellus text-warmCharcoal/40 uppercase tracking-widest text-xs mb-3" style={{ letterSpacing: "0.25em" }}>
                    Next Cohort
                  </p>
                  <p className="font-italiana text-warmCharcoal" style={{ fontSize: "clamp(24px, 4vw, 36px)" }}>
                    {nextCohort.label}
                  </p>
                  <p className="font-marcellus text-warmCharcoal/50 text-sm mt-2">
                    Begins {nextFormatted} · {nextCohort.liveCallDay}s · {nextCohort.liveCallTimes.join(" & ")}
                  </p>
                  {nextDays > 0 && (
                    <p className="font-marcellus text-lavenderViolet text-sm mt-1">
                      {nextDays} {nextDays === 1 ? "day" : "days"} away
                    </p>
                  )}
                  <a
                    href="/program"
                    className="inline-block mt-6 px-8 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity"
                    style={{
                      background: "linear-gradient(to right, #9C88FF, rgba(156,136,255,0.6))",
                    }}
                  >
                    Secure Your Spot →
                  </a>
                </div>
              );
            })()}

            {!nextCohort && (
              <div className="mt-6">
                <a
                  href="/program"
                  className="inline-block px-8 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(to right, #9C88FF, rgba(156,136,255,0.6))",
                  }}
                >
                  View Program Details →
                </a>
              </div>
            )}
          </div>
        ) : (
          <CohortRegistrationForm
            uid={uid}
            prefillEmail={email}
            prefillName={displayName}
            cohortId={enrollableCohort.id}
            cohortLabel={enrollableCohort.label}
          />
        )}
      </div>
    </div>
  );
}
