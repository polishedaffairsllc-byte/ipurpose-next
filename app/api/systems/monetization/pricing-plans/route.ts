import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { createPricingPlan, getPricingPlans } from "@/lib/monetization/dashboard";

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
    const plans = await getPricingPlans(userId);
    return NextResponse.json({ success: true, data: plans });
  } catch (err) {
    console.error("Pricing plans GET error", err);
    return NextResponse.json({ error: "Failed to load pricing plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const created = await createPricingPlan(userId, body || {});
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error("Pricing plans POST error", err);
    return NextResponse.json({ error: "Failed to create pricing plan" }, { status: 500 });
  }
}
