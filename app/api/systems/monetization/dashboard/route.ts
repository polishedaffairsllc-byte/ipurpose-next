import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { buildDashboard } from "@/lib/monetization/dashboard";

export const dynamic = "force-dynamic";

async function requireUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;
  if (!session) return null;
  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  return decoded.uid;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const includeStripeParam = request.nextUrl.searchParams.get("stripe");
    const includeStripe = includeStripeParam !== "false"; // default true

    const data = await buildDashboard(userId, { includeStripe });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Dashboard GET error", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
