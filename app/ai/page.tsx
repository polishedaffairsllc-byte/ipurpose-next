import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import AIClient from "./AIClient";

export default async function AIPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = await firebaseAdmin.auth().getUser(decoded.uid);
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");

    return (
      <div className="relative">
        {/* Hero Section */}
        <div className="relative h-[48vh] flex items-center justify-center overflow-hidden mb-10">
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80"
            alt="AI and technology"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">iPurpose Mentor</h1>
            <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
              Your aligned AI assistant for clarity, strategy, and expansion.
            </p>
          </div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-6 md:px-10 py-6 md:py-8 space-y-10">

        <Card accent="salmon" className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-warmCharcoal/55 uppercase mb-2">
            AI MENTOR MODE
          </p>
          <p className="text-sm text-warmCharcoal/75 leading-relaxed">
            Ask questions about your purpose, systems, or growth strategy. 
            The AI understands your iPurpose framework.
          </p>
        </Card>

        <AIClient initialName={name} />
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
