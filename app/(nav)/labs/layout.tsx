import React from "react";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { isFounder as isFounderUser } from "@/lib/isFounder";

export default async function LabsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;

  if (!session) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-warmCharcoal">Sign in required</h2>
          <p className="mt-3 text-sm text-warmCharcoal/70">
            Please sign in to access the Labs.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-full bg-ip-accent text-white font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() ?? {};

    const founderBypass = isFounderUser(decoded, userData);

    if (!founderBypass && (!userDoc.exists || userData?.entitlement?.status !== "active")) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-warmCharcoal">Access not active</h2>
            <p className="mt-3 text-sm text-warmCharcoal/70">
              Labs are available to enrolled members. Enroll to unlock the full iPurpose experience.
            </p>
            <a
              href="/program"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-full bg-ip-accent text-white font-medium"
            >
              Enroll now
            </a>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  } catch {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-ip-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-warmCharcoal">Session expired</h2>
          <p className="mt-3 text-sm text-warmCharcoal/70">
            Your session has expired. Please sign in again.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-full bg-ip-accent text-white font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }
}
