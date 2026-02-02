import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getProductionRateLimiter, logSecurityEvent } from "@/lib/security";

const ALLOWED_PATTERNS = new Set(["deep_work", "client_day", "recovery_day", "custom"]);
const ALLOWED_INITIATIVE = new Set(["ask", "suggest", "auto"]);

interface AiPreferencePayload {
  tone?: number;
  detail?: number;
  initiative?: string;
  modules?: Record<string, boolean>;
}

interface ApplyPatternPayload {
  patternKey?: string;
  date?: string;
  aiPreferences?: AiPreferencePayload;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    if (process.env.NODE_ENV === "production") {
      const limiter = getProductionRateLimiter("/api/focus/apply-pattern");
      const identifier = `${userId}`;
      const result = limiter.check(identifier);
      if (!result.allowed) {
        logSecurityEvent({ type: "rate_limit", userId, details: { endpoint: "/api/focus/apply-pattern" } });
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    const body = (await request.json()) as ApplyPatternPayload;
    const { patternKey, date, aiPreferences } = body;

    if (!patternKey || !ALLOWED_PATTERNS.has(patternKey)) {
      return NextResponse.json({ error: "Invalid pattern" }, { status: 400 });
    }

    if (!date || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const normalizedAi = normalizeAiPreferences(aiPreferences);

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("user-preferences").doc(userId);
    await docRef.set(
      {
        focusRituals: {
          todayPattern: {
            key: patternKey,
            appliedFor: date,
            appliedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
          ai: {
            ...normalizedAi,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
        },
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, data: { patternKey, date, ai: normalizedAi } });
  } catch (error) {
    console.error("Apply focus pattern error:", error);
    return NextResponse.json({ error: "Unable to apply pattern" }, { status: 500 });
  }
}

function normalizeAiPreferences(preferences?: AiPreferencePayload) {
  const modules = preferences?.modules || {};
  const initiativeInput = preferences?.initiative;
  const safeInitiative = initiativeInput && ALLOWED_INITIATIVE.has(initiativeInput)
    ? (initiativeInput as string)
    : "suggest";
  return {
    tone: clamp(typeof preferences?.tone === "number" ? preferences.tone : 45, 0, 100),
    detail: clamp(typeof preferences?.detail === "number" ? preferences.detail : 55, 0, 100),
    initiative: safeInitiative,
    modules: {
      calendarSync: Boolean(modules.calendarSync),
      workflowBuilder: Boolean(modules.workflowBuilder),
      reflections: Boolean(modules.reflections),
      labs: Boolean(modules.labs),
    },
  };
}
