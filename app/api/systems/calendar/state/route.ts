import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

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
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();
    const data = userDoc.data()?.systems?.calendarV1 || null;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Calendar state GET error", err);
    return NextResponse.json({ error: "Failed to load state" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const db = firebaseAdmin.firestore();
    await db.collection("users").doc(userId).set({ systems: { calendarV1: body, calendarV1UpdatedAt: new Date() } }, { merge: true });
    return NextResponse.json({ success: true, data: body });
  } catch (err) {
    console.error("Calendar state PATCH error", err);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}
