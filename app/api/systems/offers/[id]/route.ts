import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { deleteOffer, updateOffer } from "@/lib/offer-architecture";

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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const updated = await updateOffer(userId, params.id, body || {});
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Offers PATCH error", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireActiveUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await deleteOffer(userId, params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Offers DELETE error", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
