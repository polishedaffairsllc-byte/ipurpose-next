import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import FocusAndRitualsClient from "./FocusAndRitualsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);

    // Check entitlement
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }

    const membershipData = userDoc.data()?.membership || {};
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
