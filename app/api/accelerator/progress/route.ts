import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const { week, completed } = await req.json();

    if (typeof week !== "number" || week < 1 || week > 6) {
      return NextResponse.json({ error: "Invalid week" }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const progressRef = db
      .collection("users")
      .doc(decoded.uid)
      .collection("accelerator")
      .doc("progress");

    const progressDoc = await progressRef.get();
    const currentData = progressDoc.data() ?? { completedWeeks: [] };
    let completedWeeks: number[] = currentData.completedWeeks || [];

    if (completed && !completedWeeks.includes(week)) {
      completedWeeks.push(week);
      completedWeeks.sort();
    } else if (!completed) {
      completedWeeks = completedWeeks.filter((w: number) => w !== week);
    }

    await progressRef.set(
      {
        completedWeeks,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, completedWeeks });
  } catch (error: any) {
    console.error("Accelerator progress error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const progressRef = db
      .collection("users")
      .doc(decoded.uid)
      .collection("accelerator")
      .doc("progress");

    const progressDoc = await progressRef.get();
    const data = progressDoc.data() ?? { completedWeeks: [] };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Accelerator progress fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
