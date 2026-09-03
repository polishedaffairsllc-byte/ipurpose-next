import { NextRequest, NextResponse } from "next/server";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import {
  getCompanionProfile,
  updateCompanionFocusAreas,
  updateCompanionTimezone,
  updateCompanionVisualEnvironment,
} from "@/lib/ai/companionContext";
import { normalizeIanaTimezone } from "@/lib/ai/timezone";
import { parseVisualEnvironmentPreference } from "@/lib/ai/visualEnvironmentPreference";

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

    const body = await request.json().catch(() => null) as {
      focusAreas?: unknown;
      timezone?: unknown;
      visualEnvironmentPreference?: unknown;
    } | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A profile update is required" }, { status: 400 });
    }

    const requestedFields = Object.keys(body);
    if (
      requestedFields.length !== 1
      || !["focusAreas", "timezone", "visualEnvironmentPreference"].includes(requestedFields[0])
    ) {
      return NextResponse.json(
        { error: "Update exactly one supported profile field" },
        { status: 400 }
      );
    }

    let profile;
    if (requestedFields[0] === "focusAreas") {
      if (!Array.isArray(body.focusAreas)) {
        return NextResponse.json({ error: "focusAreas must be an array" }, { status: 400 });
      }
      if (body.focusAreas.length > 2) {
        return NextResponse.json({ error: "Choose up to two focus areas" }, { status: 400 });
      }

      const focusAreas = body.focusAreas
        .map((value) => typeof value === "string" ? value.trim() : "")
        .filter(Boolean);
      if (
        focusAreas.length !== body.focusAreas.length
        || focusAreas.some((value) => value.length > 160)
      ) {
        return NextResponse.json(
          { error: "Focus areas must be non-empty text up to 160 characters" },
          { status: 400 }
        );
      }

      profile = await updateCompanionFocusAreas(entitlement.uid, focusAreas);
    } else if (requestedFields[0] === "visualEnvironmentPreference") {
      const visualEnvironmentPreference = parseVisualEnvironmentPreference(
        body.visualEnvironmentPreference
      );
      if (!visualEnvironmentPreference) {
        return NextResponse.json(
          { error: "Invalid visual environment preference" },
          { status: 400 }
        );
      }
      profile = await updateCompanionVisualEnvironment(
        entitlement.uid,
        visualEnvironmentPreference
      );
    } else {
      const timezone = normalizeIanaTimezone(body.timezone);
      if (!timezone) {
        return NextResponse.json(
          { error: "Timezone must be a valid IANA timezone" },
          { status: 400 }
        );
      }
      profile = await updateCompanionTimezone(entitlement.uid, timezone);
    }

    return NextResponse.json({ profile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Companion profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update companion profile" }, { status: 500 });
  }
}
