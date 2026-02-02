import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { fetchStripeSummary, saveSnapshot, computeFocusIndicators } from "@/lib/monetization/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decoded.uid;

    const stripeSummary = await fetchStripeSummary();

    // Store snapshot when Stripe is connected so dashboard can fall back gracefully
    if (stripeSummary.connected) {
      await saveSnapshot(userId, {
        range: "rolling_30d",
        currency: stripeSummary.currency,
        stripeMetrics: stripeSummary.metrics,
        computed: computeFocusIndicators([], stripeSummary.metrics),
      });
    }

    return NextResponse.json({ success: true, data: stripeSummary });
  } catch (err) {
    console.error("Stripe summary API error", err);
    return NextResponse.json({ error: "Failed to fetch Stripe summary" }, { status: 500 });
  }
}
