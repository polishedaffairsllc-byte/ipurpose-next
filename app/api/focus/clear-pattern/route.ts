import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { getProductionRateLimiter, logSecurityEvent } from "@/lib/security";

interface ClearPatternPayload {
  date?: string;
}

// Default baseline AI posture for reset
const DEFAULT_AI_BASELINE = {
  tone: 45,
  detail: 55,
  initiative: "suggest",
  modules: {
    calendarSync: true,
    workflowBuilder: true,
    reflections: false,
    labs: false,
  },
};

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
      const limiter = getProductionRateLimiter("/api/focus/clear-pattern");
      const identifier = `${userId}`;
      const result = limiter.check(identifier);
      if (!result.allowed) {
        logSecurityEvent({ type: "rate_limit", userId, details: { endpoint: "/api/focus/clear-pattern" } });
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    const body = (await request.json()) as ClearPatternPayload;
    const { date } = body;

    if (!date || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("user-preferences").doc(userId);
    await docRef.set(
      {
        focusRituals: {
          todayPattern: null,
          ai: {
            ...DEFAULT_AI_BASELINE,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
        },
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: { 
        date, 
        cleared: true,
        ai: DEFAULT_AI_BASELINE,
      } 
    });
  } catch (error) {
    console.error("Clear focus pattern error:", error);
    return NextResponse.json({ error: "Unable to clear pattern" }, { status: 500 });
  }
}
