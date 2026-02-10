import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";
import DeepenNavigation from "@/app/components/DeepenNavigation";
import Footer from "@/app/components/Footer";

export default async function DeepenLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return redirect("/login");
  }

  let hasAccess = false;
  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = isFounderUser(decoded, userData);

    if (founderBypass || userData?.entitlement?.tier === "DEEPENING") {
      hasAccess = true;
    }
  } catch {
    return redirect("/login");
  }

  // If they don't have access, render children directly (the sales page handles its own UI)
  if (!hasAccess) {
    return <>{children}</>;
  }

  // Subscribers get the Deepen nav + themed layout
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DeepenNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
