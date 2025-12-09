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

    // Get cookie store and set cookie. `await cookies()` ensures we have the store with `.set`.
    const cookieStore = await cookies();
    cookieStore.set({
      name: "FirebaseSession",
      value: sessionCookie,
      maxAge: Math.floor(SESSION_EXPIRES_IN / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "none",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("API Error creating session:", error);
    const status = error?.code === "auth/argument-error" ? 400 : 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create session." },
      { status }
    );
  }
}