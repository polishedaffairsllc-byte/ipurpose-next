import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/apiEntitlementHelper";
import {
  CompanionOnboardingError,
  completeCompanionOnboarding,
  getCompanionOnboardingState,
  saveCompanionOnboardingDraft,
} from "@/lib/ai/companionOnboarding";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;
    const onboarding = await getCompanionOnboardingState(authentication.uid);
    return NextResponse.json(
      { onboarding },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Companion onboarding GET error:", error);
    return NextResponse.json({ error: "Failed to load onboarding" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "An onboarding draft is required" }, { status: 400 });
    }

    const onboarding = await saveCompanionOnboardingDraft(authentication.uid, body);
    return NextResponse.json(
      { onboarding },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Companion onboarding PATCH error:", error);
    return NextResponse.json({ error: "Failed to save onboarding" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;
    const onboarding = await completeCompanionOnboarding(authentication.uid);
    return NextResponse.json(
      { onboarding },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    if (error instanceof CompanionOnboardingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Companion onboarding POST error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
