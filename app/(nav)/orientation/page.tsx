import { cookies } from "next/headers";
import type { Metadata } from "next";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getTodaysAffirmation } from "@/lib/affirmationClient";
import DashboardJournalPanel from "@/app/components/DashboardJournalPanel";
import Card from "@/app/components/Card";
import ModuleGuide from "@/app/components/ModuleGuide";
import OrientationClient from "./OrientationClient";

export const metadata: Metadata = {
  title: "Orientation — Labs Launchpad | iPurpose",
  description: "A state-aware jumping-off point that routes you directly into the lab that still needs attention.",
};

async function loadViewerContext() {
  let todaysAffirmation: string | null = null;
  let userName = "Friend";

  try {
    todaysAffirmation = await getTodaysAffirmation();
  } catch (error) {
    console.error("Orientation affirmation load failed", error);
  }

  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value ?? null;
    if (session) {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
      const user = await firebaseAdmin.auth().getUser(decoded.uid);
      userName = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
    }
  } catch (error) {
    console.warn("Orientation user context unavailable", error);
  }

  return { todaysAffirmation, userName };
}

export default async function OrientationPage() {
  const { todaysAffirmation, userName } = await loadViewerContext();

  return (
    <div className="bg-gradient-to-b from-white via-white to-amber-50/40">
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-16">
        <OrientationClient />

        <div className="grid gap-8 lg:grid-cols-2">
          <Card accent="lavender" className="p-0">
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-warmCharcoal/50 mb-4">
                Affirmation & Session
              </p>
              {todaysAffirmation ? (
                <DashboardJournalPanel todaysAffirmation={todaysAffirmation} userName={userName} />
              ) : (
                <p className="text-sm text-warmCharcoal/70">
                  Daily affirmation is loading. Refresh to begin journaling.
                </p>
              )}
            </div>
          </Card>

          <div className="rounded-3xl border border-warmCharcoal/10 bg-white/80 p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-warmCharcoal/50">Orientation pillars</p>
              <h2 className="text-2xl font-semibold text-warmCharcoal mt-2">Identity → Meaning → Agency</h2>
              <p className="text-sm text-warmCharcoal/70 mt-2">
                Orientation content stays visible as a reference hub while the primary CTA keeps pointing you into the
                lab that is not done yet.
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Identity",
                  body: "Pull language for who you are becoming.",
                },
                {
                  title: "Meaning",
                  body: "Clarify why your work matters and where it lands.",
                },
                {
                  title: "Agency",
                  body: "Convert clarity into concrete, near-term actions.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-warmCharcoal/10 p-4">
                  <p className="text-sm font-semibold text-warmCharcoal">{item.title}</p>
                  <p className="text-sm text-warmCharcoal/60 mt-1">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Orientation stays unlocked even after completion—use it as a choice hub once all labs are complete.
            </div>
          </div>
        </div>
      </div>
      <ModuleGuide moduleId="orientation" />
    </div>
  );
}
