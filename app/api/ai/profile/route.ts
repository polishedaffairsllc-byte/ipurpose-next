import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/apiEntitlementHelper";
import {
  getCompanionProfile,
  initializeCompanionFocusAreas,
  updateCompanionFocusAreas,
  updateCompanionTimezone,
  updateCompanionVisualEnvironment,
} from "@/lib/ai/companionContext";
import { normalizeIanaTimezone } from "@/lib/ai/timezone";
import { parseVisualEnvironmentPreference } from "@/lib/ai/visualEnvironmentPreference";

import { completeIntro, getIntroCompletions } from "@/lib/introVideos";
import { isIntroKind } from "@/mobile/src/lib/introVideos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;
    const [profile, introVideos] = await Promise.all([getCompanionProfile(authentication.uid), getIntroCompletions(authentication.uid)]);
    return NextResponse.json({ profile: { ...profile, introVideos } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Companion profile GET error:", error);
    return NextResponse.json({ error: "Failed to load companion profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;

    const body = await request.json().catch(() => null) as {
      completedIntro?: unknown;
      focusAreas?: unknown;
      initializeFocusAreas?: unknown;
      timezone?: unknown;
      visualEnvironmentPreference?: unknown;
    } | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A profile update is required" }, { status: 400 });
    }

    const requestedFields = Object.keys(body);
    if (
      requestedFields.length !== 1
      || !["focusAreas", "initializeFocusAreas", "timezone", "visualEnvironmentPreference", "completedIntro"].includes(requestedFields[0])
    ) {
      return NextResponse.json(
        { error: "Update exactly one supported profile field" },
        { status: 400 }
      );
    }

    let profile;
    if (requestedFields[0] === "completedIntro") {
      if (!isIntroKind(body.completedIntro)) {
        return NextResponse.json({ error: "Invalid intro" }, { status: 400 });
      }
      await completeIntro(authentication.uid, body.completedIntro);
      profile = await getCompanionProfile(authentication.uid);
    } else if (requestedFields[0] === "focusAreas" || requestedFields[0] === "initializeFocusAreas") {
      const requestedFocusAreas = requestedFields[0] === "focusAreas"
        ? body.focusAreas
        : body.initializeFocusAreas;
      if (!Array.isArray(requestedFocusAreas)) {
        return NextResponse.json({ error: "focusAreas must be an array" }, { status: 400 });
      }
      if (requestedFocusAreas.length > 2) {
        return NextResponse.json({ error: "Choose up to two focus areas" }, { status: 400 });
      }

      const focusAreas = requestedFocusAreas
        .map((value) => typeof value === "string" ? value.trim() : "")
        .filter(Boolean);
      if (
        focusAreas.length !== requestedFocusAreas.length
        || focusAreas.some((value) => value.length > 160)
      ) {
        return NextResponse.json(
          { error: "Focus areas must be non-empty text up to 160 characters" },
          { status: 400 }
        );
      }

      profile = requestedFields[0] === "initializeFocusAreas"
        ? await initializeCompanionFocusAreas(authentication.uid, focusAreas)
        : await updateCompanionFocusAreas(authentication.uid, focusAreas);
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
        authentication.uid,
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
      profile = await updateCompanionTimezone(authentication.uid, timezone);
    }

    const responseProfile = requestedFields[0] === "completedIntro"
      ? { ...profile, introVideos: await getIntroCompletions(authentication.uid) }
      : profile;
    return NextResponse.json({ profile: responseProfile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Companion profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update companion profile" }, { status: 500 });
  }
}
