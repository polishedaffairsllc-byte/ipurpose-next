import { NextRequest, NextResponse } from "next/server";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { getCompanionProfile, updateCompanionFocusAreas } from "@/lib/ai/companionContext";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const profile = await getCompanionProfile(entitlement.uid);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Companion profile GET error:", error);
    return NextResponse.json({ error: "Failed to load companion profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;

    const body = await request.json().catch(() => null) as { focusAreas?: unknown } | null;
    if (!body || !Array.isArray(body.focusAreas)) {
      return NextResponse.json({ error: "focusAreas must be an array" }, { status: 400 });
    }
    if (body.focusAreas.length > 2) {
      return NextResponse.json({ error: "Choose up to two focus areas" }, { status: 400 });
    }

    const focusAreas = body.focusAreas.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean);
    if (focusAreas.length !== body.focusAreas.length || focusAreas.some((value) => value.length > 160)) {
      return NextResponse.json({ error: "Focus areas must be non-empty text up to 160 characters" }, { status: 400 });
    }

    const profile = await updateCompanionFocusAreas(entitlement.uid, focusAreas);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Companion profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update companion profile" }, { status: 500 });
  }
}
