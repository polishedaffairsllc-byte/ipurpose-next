import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import { isFounder } from "@/lib/isFounder";
import FocusAndRitualsClient from "./FocusAndRitualsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  let decodedClaims: any = null;
  let userId: string | null = null;

  if (session) {
    try {
      decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
      userId = decodedClaims.uid;
    } catch {
      userId = null;
    }
  }

  // Dev fallback to avoid redirects when session cookie is missing locally
  if (!userId && process.env.NODE_ENV !== "production") {
    userId = process.env.DEV_FOUNDER_UID || "dev-local-user";
  }

  if (!userId) return redirect("/login");

  try {

    // Temporarily allow access even if entitlement is missing/inactive to avoid blocking settings actions
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data() ?? {};
    const founderBypass = decodedClaims ? isFounder(decodedClaims, userData) : true;

    // if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
    //   return redirect("/enrollment-required");
    // }

    const membershipData = userData?.membership || {};
    const membership = {
      tier: membershipData.tier ?? null,
      renewalDate: membershipData.renewalDate ?? null,
      status: membershipData.status ?? "active",
      billingPortalUrl: membershipData.billingPortalUrl ?? null,
      upgradeUrl: membershipData.upgradeUrl ?? null,
    };

    return (
      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
        <FocusAndRitualsClient membership={membership} />
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
