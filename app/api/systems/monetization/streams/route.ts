import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { createIncomeStream, getIncomeStreams } from "@/lib/monetization/dashboard";

export const dynamic = "force-dynamic";

async function requireUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;
  if (!session) return null;
  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  return decoded.uid;
}

export async function GET() {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const streams = await getIncomeStreams(userId);
    return NextResponse.json({ success: true, data: streams });
  } catch (err) {
    console.error("Streams GET error", err);
    return NextResponse.json({ error: "Failed to load streams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const created = await createIncomeStream(userId, body || {});
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error("Streams POST error", err);
    return NextResponse.json({ error: "Failed to create stream" }, { status: 500 });
  }
}
