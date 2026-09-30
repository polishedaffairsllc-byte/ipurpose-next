import { completeLab, getLabCompletion, type LabKey } from "@/lib/labs/completion";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";

const validLabKeys = new Set(["identity", "meaning", "agency"]);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const data = await getLabCompletion(firebaseAdmin.firestore(), decoded.uid);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Lab completion GET error:", error);
    return NextResponse.json({ error: "Failed to load completion" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const rateLimit = await checkRateLimit(decoded.uid);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason || "Rate limited" }, { status: 429 });
    }

    const body = await request.json();
    const labKey = typeof body?.labKey === "string" ? body.labKey : "";

    if (!validLabKeys.has(labKey)) {
      return NextResponse.json({ error: "Invalid labKey" }, { status: 400 });
    }

    await completeLab(firebaseAdmin.firestore(), decoded.uid, labKey as LabKey, "legacy_endpoint");

    await recordRequest(decoded.uid, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lab completion error:", error);
    return NextResponse.json({ error: "Failed to update completion" }, { status: 500 });
  }
}
