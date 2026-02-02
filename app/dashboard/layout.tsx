import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { getTierFromUser, type EntitlementTier } from "@/app/lib/auth/entitlements";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    redirect("/login");
  }

  let decoded: { uid: string };
  try {
    decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  } catch {
    redirect("/login");
  }

  const db = firebaseAdmin.firestore();
  const userDoc = await db.collection("users").doc(decoded.uid).get();
  const customClaims = decoded.customClaims || {};
  const userTier: EntitlementTier = getTierFromUser({ ...userDoc.data(), customClaims });

  if (!userDoc.exists || !userDoc.data()?.acceptedTermsAt) {
    redirect("/onboarding");
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-dashboard overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
