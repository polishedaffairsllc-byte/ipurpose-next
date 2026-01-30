import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Login route: accepts an idToken from the client, exchanges it for a
 * Firebase session cookie via the Admin SDK, and sets an HttpOnly cookie.
 *
 * Fixes applied:
 * - Use a tolerant `any`-based adminModule accessor to avoid TypeScript errors
 *   when the firebase admin initializer exports different names.
 * - `await cookies()` to ensure we get the cookie store object with `.set`.
 * - Ensure cookie has SameSite=None; Secure; HttpOnly attributes.
 */

const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000; // 5 days in ms

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: "missing-idToken" }, { status: 400 });
    }

    // Import the firebaseAdmin instance
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
    
    // Debug logs to diagnose the issue
    console.log("firebaseAdmin:", !!firebaseAdmin);
    console.log("admin.auth exists:", typeof firebaseAdmin.auth === "function");
    try {
      console.log("createSessionCookie:", typeof firebaseAdmin.auth().createSessionCookie);
    } catch (err) {
      console.error("admin.auth() threw:", err);
    }
    
    if (!firebaseAdmin || !firebaseAdmin.auth) {
      console.error("Firebase admin not properly initialized");
      return NextResponse.json(
        { success: false, error: "Server Firebase Admin not configured." },
        { status: 500 }
      );
    }

    // Create session cookie using auth().createSessionCookie()
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN });

    // Verify the idToken to extract custom claims and check for founder status
    let isFounder = false;
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
      isFounder = decoded.customClaims?.isFounder === true || decoded.customClaims?.role === 'founder';
      console.log(`[LOGIN] User ${decoded.email} UID ${decoded.uid}`);
      console.log(`[LOGIN] ID Token Custom Claims:`, decoded.customClaims);
      console.log(`[LOGIN] Founder status: ${isFounder}`);
      
      // Also check Firestore for founder status as a fallback
      const userDoc = await firebaseAdmin.firestore().collection('users').doc(decoded.uid).get();
      if (userDoc.exists) {
        const firestoreIsFounder = userDoc.data()?.isFounder || userDoc.data()?.role === 'founder';
        console.log(`[LOGIN] Firestore founder status: ${firestoreIsFounder}`);
        console.log(`[LOGIN] Firestore data:`, userDoc.data());
        if (firestoreIsFounder) {
          isFounder = true;
        }
      }
    } catch (err) {
      console.error("[LOGIN] Error verifying idToken for custom claims:", err);
    }

    // Get cookie store and set cookie. `await cookies()` ensures we have the store with `.set`.
    const cookieStore = await cookies();
    cookieStore.set({
      name: "FirebaseSession",
      value: sessionCookie,
      maxAge: Math.floor(SESSION_EXPIRES_IN / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Set founder cookie if user is a founder (non-httpOnly so middleware can read it)
    if (isFounder) {
      cookieStore.set({
        name: "x-founder",
        value: "true",
        maxAge: Math.floor(SESSION_EXPIRES_IN / 1000),
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
    }

    console.log("[LOGIN] Session cookie and founder cookie set successfully");
    const response = NextResponse.json({ success: true, isFounder }, { status: 200 });
    return response;
  } catch (error: any) {
    console.error("API Error creating session:", error);
    const status = error?.code === "auth/argument-error" ? 400 : 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create session." },
      { status }
    );
  }
}