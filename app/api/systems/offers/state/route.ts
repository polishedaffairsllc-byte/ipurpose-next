import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getOfferState, updateOfferState } from "@/lib/offer-architecture";

export const dynamic = "force-dynamic";

async function requireActiveUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;
  if (!session) return null;
  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  const db = firebaseAdmin.firestore();
  const userDoc = await db.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") return null;
  return decoded.uid;
}

export async function GET() {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const state = await getOfferState(userId);
    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    console.error("Offers state GET error", err);
    return NextResponse.json({ error: "Failed to load state" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const updated = await updateOfferState(userId, body || {});
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Offers state PATCH error", err);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}
