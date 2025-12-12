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
      <div className="container max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        <PageTitle subtitle="Your aligned AI assistant for clarity, strategy, and expansion.">
          iPurpose Mentor
        </PageTitle>

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
    );
  } catch (e) {
    return redirect("/login");
  }
}
