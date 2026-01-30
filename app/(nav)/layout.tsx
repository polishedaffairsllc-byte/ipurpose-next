import React from "react";
import { cookies } from "next/headers";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getTierFromUser, type EntitlementTier } from "@/app/lib/auth/entitlements";

export default async function NavLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  let userTier: EntitlementTier = "FREE";

  if (session) {
    try {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
      const userDoc = await firebaseAdmin.firestore().collection("users").doc(decoded.uid).get();
      const customClaims = decoded.customClaims || {};
      userTier = getTierFromUser({ ...userDoc.data(), customClaims });
    } catch (err) {
      console.error("TopNav tier resolve error", err);
      userTier = "FREE";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav isAuthed={Boolean(session)} userTier={userTier} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
