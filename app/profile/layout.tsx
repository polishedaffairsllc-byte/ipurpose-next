import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
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

  if (!userDoc.exists || !userDoc.data()?.acceptedTermsAt) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
