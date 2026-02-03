import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { isFounder } from "@/lib/isFounder";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import VideoBackground from "../components/VideoBackground";
import AIClient from "./AIClient";

export default async function AIPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounder(decoded, userData);

    if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
      return redirect("/enrollment-required");
    }

    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");

    return (
      <div className="relative min-h-screen" style={{ position: "relative", zIndex: 1 }}>
        {/* Hero Section */}
        <div className="relative h-[48vh] flex items-center justify-center overflow-hidden mb-10">
          <VideoBackground src="/videos/water-reflection.mp4" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">Compass</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              Where Inner Alignment Becomes Coherent Action
            </p>
          </div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

          <div className="space-y-3">
            <p className="text-base text-warmCharcoal/70 font-marcellus italic">
              Compass asks questions. You find the answers.
            </p>
          </div>

          <div className="space-y-3">
            <SectionHeading>iPurpose Mentor</SectionHeading>
            <p className="text-base text-warmCharcoal/80 leading-relaxed">
              A structured AI support tool to help you think, reflect, and build with clarity.
            </p>
            <p className="text-sm text-warmCharcoal/70">
              The Compass remains yours. The Mentor helps you read it.
            </p>
          </div>

        <Card accent="salmon" className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/55 uppercase mb-2">
            Mentor Interface
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed">
            Use the iPurpose Mentor to reflect on your thinking, explore options, and organize decisions related to your purpose, systems, or growth strategy. The AI works within the iPurpose framework to support — not replace — your judgment.
          </p>
        </Card>

        <Card accent="salmon" className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/55 uppercase mb-2">
            AUTHORITY & DECISION-MAKING
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed">
            The Compass doesn't decide for you — it helps you clarify, structure, and reflect on your own decisions.
          </p>
        </Card>

        <Card accent="lavender" className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/55 uppercase mb-2">
            Want to Recalibrate?
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed mb-4">
            Revisit how iPurpose works and the learning path that shapes your journey.
          </p>
          <a href="/orientation" className="text-sm text-lavenderViolet font-semibold hover:opacity-80 transition-opacity">
            Recalibrate Your Learning Path →
          </a>
        </Card>

        <AIClient initialName={name} userId={decoded.uid} />
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
