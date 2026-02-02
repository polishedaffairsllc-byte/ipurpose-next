import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { createOffer, listOffersWithSeed } from "@/lib/offer-architecture";

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
    const offers = await listOffersWithSeed(userId);
    return NextResponse.json({ success: true, data: offers });
  } catch (err) {
    console.error("Offers GET error", err);
    return NextResponse.json({ error: "Failed to load offers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const created = await createOffer(userId, body || {});
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error("Offers POST error", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
