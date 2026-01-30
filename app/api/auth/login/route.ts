import { NextResponse } from "next/server";

// Force Node.js runtime so we can set HttpOnly cookies reliably (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const response = NextResponse.json({ success: true, isFounder, message: "Login successful" }, { status: 200 });

    const maxAgeSeconds = Math.floor(SESSION_EXPIRES_IN / 1000);
    const secure = process.env.NODE_ENV === "production";
    const sameSite = secure ? "none" : "lax";

    const setCookieOpts = {
      maxAge: maxAgeSeconds,
      path: "/",
      httpOnly: true,
      secure,
      sameSite,
    } as const;

    console.log("[LOGIN] Setting FirebaseSession cookie via response.cookies.set");
    response.cookies.set("FirebaseSession", sessionCookie, setCookieOpts);

    if (isFounder) {
      console.log("[LOGIN] Setting x-founder cookie via response.cookies.set");
      response.cookies.set("x-founder", "true", {
        maxAge: maxAgeSeconds,
        path: "/",
        secure,
        sameSite,
      });
    }

    // Also append Set-Cookie headers manually as a fallback for dev/turbopack
    response.headers.append(
      "Set-Cookie",
      `FirebaseSession=${encodeURIComponent(sessionCookie)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}; HttpOnly`
    );
    if (isFounder) {
      response.headers.append(
        "Set-Cookie",
        `x-founder=true; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}`
      );
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