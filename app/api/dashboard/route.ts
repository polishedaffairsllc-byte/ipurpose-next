import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

function labStatus(text?: string, completed?: boolean) {
  if (completed) return "complete";
  if (text && text.trim().length > 0) return "in_progress";
  return "not_started";
}

function integrationComplete(data?: {
  coreTruth?: string;
  primaryDirection?: string;
  internalShift?: string;
  sevenDayPlan?: string[];
} | null) {
  if (!data) return false;
  const hasCore = data.coreTruth?.trim().length;
  const hasDirection = data.primaryDirection?.trim().length;
  const hasShift = data.internalShift?.trim().length;
  const hasPlan = Array.isArray(data.sevenDayPlan) && data.sevenDayPlan.some((item) => item?.trim().length);
  return Boolean(hasCore && hasDirection && hasShift && hasPlan);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();

    const [
      identityDoc,
      meaningDoc,
      agencyDoc,
      completionDoc,
      progressDoc,
      integrationDoc,
    ] = await Promise.all([
      db.collection("users").doc(decoded.uid).collection("labs").doc("identity").get(),
      db.collection("users").doc(decoded.uid).collection("labs").doc("meaning").get(),
      db.collection("users").doc(decoded.uid).collection("labs").doc("agency").get(),
      db.collection("labCompletion").doc(decoded.uid).get(),
      db.collection("userProgress").doc(decoded.uid).collection("orientation").doc("status").get(),
      db.collection("integration").doc(decoded.uid).get(),
    ]);

    const completion = completionDoc.exists ? completionDoc.data() : {};
    const identityText = identityDoc.exists ? identityDoc.data()?.text : "";
    const meaningText = meaningDoc.exists ? meaningDoc.data()?.text : "";
    const agencyText = agencyDoc.exists ? agencyDoc.data()?.text : "";

    const progress = progressDoc.exists ? progressDoc.data() : null;
    const integration = integrationDoc.exists ? integrationDoc.data() : null;

    return NextResponse.json({
      success: true,
      data: {
        orientation: progress,
        labs: {
          identity: labStatus(identityText, completion?.identity),
          meaning: labStatus(meaningText, completion?.meaning),
          agency: labStatus(agencyText, completion?.agency),
        },
        integration: {
          complete: integrationComplete(integration),
        },
      },
    });
  } catch (error) {
    console.error("/api/dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
