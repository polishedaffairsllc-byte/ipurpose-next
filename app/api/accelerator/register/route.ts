import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/accelerator/register
 * Saves cohort registration data to Firestore.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      uid,
      cohortId,
      firstName,
      lastName,
      email,
      phone,
      birthdate,
      birthTime,
      birthTimeUnknown,
      birthCity,
      birthState,
      genderIdentity,
      genderCustom,
      ethnicity,
      lifeStage,
      intentionStatement,
      referralSource,
      preferredCallTime,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !birthdate || !cohortId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Resolve uid from session if not provided
    let resolvedUid = uid;
    if (!resolvedUid) {
      const cookieStore = await cookies();
      const session = cookieStore.get("FirebaseSession")?.value;
      if (session) {
        try {
          const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
          resolvedUid = decoded.uid;
        } catch {
          // No valid session — proceed without uid (guest registration)
        }
      }
    }

    const db = firebaseAdmin.firestore();
    const registrationData = {
      cohortId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      birthdate,
      birthTime: birthTimeUnknown ? null : birthTime || null,
      birthTimeUnknown: !!birthTimeUnknown,
      birthCity: birthCity?.trim() || null,
      birthState: birthState?.trim() || null,
      genderIdentity: genderIdentity || null,
      genderCustom: genderCustom?.trim() || null,
      ethnicity: ethnicity?.length ? ethnicity : [],
      lifeStage: lifeStage || null,
      intentionStatement: intentionStatement?.trim() || null,
      referralSource: referralSource || null,
      preferredCallTime: preferredCallTime || null,
      registeredAt: new Date().toISOString(),
      status: "registered",
    };

    if (resolvedUid) {
      // Authenticated user — save under their user document
      await db
        .collection("users")
        .doc(resolvedUid)
        .collection("accelerator")
        .doc("registration")
        .set(registrationData, { merge: true });

      // Also add to the central cohort registrations collection
      await db
        .collection("cohort-registrations")
        .doc(`${cohortId}_${resolvedUid}`)
        .set({ ...registrationData, uid: resolvedUid }, { merge: true });
    } else {
      // Guest / unauthenticated — save to cohort registrations only
      await db.collection("cohort-registrations").add({
        ...registrationData,
        uid: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[REGISTER] Error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
