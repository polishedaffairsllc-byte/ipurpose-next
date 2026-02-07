import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { getDateKey } from "@/lib/journal/dateUtils";

export async function POST(request: Request) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };

    const body = await request.json();
    const { content, title } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const now = firebaseAdmin.firestore.Timestamp.now();
    const dateKey = getDateKey();

    // Get or create today's session
    const sessionsRef = db.collection("users").doc(uid).collection("sessions");
    const sessionSnapshot = await sessionsRef
      .where("dateKey", "==", dateKey)
      .limit(1)
      .get();

    let sessionId: string;
    if (!sessionSnapshot.empty) {
      sessionId = sessionSnapshot.docs[0].id;
    } else {
      // Create new session if doesn't exist
      const newSessionRef = sessionsRef.doc();
      await newSessionRef.set({
        startedAt: now,
        endedAt: null,
        dateKey,
      });
      sessionId = newSessionRef.id;
    }

    // Create journal entry
    const journalEntryRef = db
      .collection("users")
      .doc(uid)
      .collection("journalEntries")
      .doc();

    const journalEntry = {
      type: "integration_reflection",
      status: "final",
      content,
      createdAt: now,
      updatedAt: now,
      dateKey,
      sessionId,
      source: "overview",
      promptText: title || "Integration Reflection",
    };

    await journalEntryRef.set(journalEntry);

    return NextResponse.json({
      success: true,
      entryId: journalEntryRef.id,
      message: "Integration saved to journal",
    });

  } catch (error) {
    console.error("Save to journal error:", error);
    return NextResponse.json({ error: "Failed to save to journal" }, { status: 500 });
  }
}
