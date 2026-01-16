import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
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

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
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
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">iPurpose Mentor</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              A structured AI support tool to help you think, reflect, and build with clarity.
            </p>
          </div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

        <Card accent="salmon" className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/55 uppercase mb-2">
            AI MENTOR MODE
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
            The iPurpose Mentor does not decide for you — it helps you clarify, structure, and reflect on your own decisions.
          </p>
        </Card>

        <AIClient initialName={name} userId={decoded.uid} />
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
