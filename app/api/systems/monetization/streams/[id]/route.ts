import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { deleteIncomeStream, updateIncomeStream } from "@/lib/monetization/dashboard";

export const dynamic = "force-dynamic";

async function requireUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;
  if (!session) return null;
  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  return decoded.uid;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const updated = await updateIncomeStream(userId, params.id, body || {});
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Stream PATCH error", err);
    return NextResponse.json({ error: "Failed to update stream" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await deleteIncomeStream(userId, params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Stream DELETE error", err);
    return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 });
  }
}
