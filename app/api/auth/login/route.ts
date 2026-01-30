import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Login route: accepts an idToken from the client, exchanges it for a
 * Firebase session cookie via the Admin SDK, and sets an HttpOnly cookie.
 */

const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000; // 5 days in ms

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      console.error("[LOGIN] Missing idToken");
      return NextResponse.json({ success: false, error: "missing-idToken" }, { status: 400 });
    }

    console.log("[LOGIN] idToken received, length:", idToken.length);

    // Import the firebaseAdmin instance
    const { firebaseAdmin } = await import("@/lib/firebaseAdmin");
    
    if (!firebaseAdmin || !firebaseAdmin.auth) {
      console.error("[LOGIN] Firebase admin not properly initialized");
      return NextResponse.json(
        { success: false, error: "Server Firebase Admin not configured." },
        { status: 500 }
      );
    }

    // Create session cookie using auth().createSessionCookie()
    console.log("[LOGIN] Creating session cookie...");
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN });
    console.log("[LOGIN] Session cookie created, length:", sessionCookie.length);

    // Verify the idToken to extract custom claims and check for founder status
    let isFounder = false;
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
      isFounder = decoded.customClaims?.isFounder === true || decoded.customClaims?.role === 'founder';
      console.log(`[LOGIN] User ${decoded.email} UID ${decoded.uid}`);
      console.log(`[LOGIN] ID Token Custom Claims:`, decoded.customClaims);
      console.log(`[LOGIN] Founder status from token: ${isFounder}`);
      
      // Also check Firestore for founder status as a fallback
      const userDoc = await firebaseAdmin.firestore().collection('users').doc(decoded.uid).get();
      if (userDoc.exists) {
        const firestoreIsFounder = userDoc.data()?.isFounder || userDoc.data()?.role === 'founder';
        console.log(`[LOGIN] Firestore founder status: ${firestoreIsFounder}`);
        if (firestoreIsFounder && !isFounder) {
          isFounder = true;
          console.log("[LOGIN] Using Firestore founder status");
        }
      }
    } catch (err) {
      console.error("[LOGIN] Error verifying idToken for custom claims:", err);
    }

    // Create response and set cookies via Set-Cookie headers
    const response = NextResponse.json(
      { success: true, isFounder, message: "Login successful" },
      { status: 200 }
    );

    // Set the FirebaseSession cookie
    const cookieOptions: Partial<ResponseCookie> = {
      maxAge: Math.floor(SESSION_EXPIRES_IN / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "strict" | "lax" | "none",
    };

    console.log("[LOGIN] Setting FirebaseSession cookie with options:", { ...cookieOptions, value: "***" });
    response.cookies.set("FirebaseSession", sessionCookie, cookieOptions);

    // Set founder cookie if applicable
    if (isFounder) {
      console.log("[LOGIN] Setting x-founder cookie");
      response.cookies.set("x-founder", "true", {
        maxAge: Math.floor(SESSION_EXPIRES_IN / 1000),
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "strict" | "lax" | "none",
      });
    }

    console.log("[LOGIN] Response Set-Cookie headers:", response.headers.getSetCookie());
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