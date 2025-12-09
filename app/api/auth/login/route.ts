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

    // Dynamically import server-only admin initializer at request time.
    // Use `any` here to be tolerant to different export shapes and avoid TS errors about `.default`.
    let adminModule: any;
    try {
      adminModule = await import("@/lib/firebaseadmin");
    } catch (err) {
      console.error("Firebase admin module failed to load:", err);
      return NextResponse.json(
        { success: false, error: "Server Firebase Admin not configured." },
        { status: 500 }
      );
    }

    // Resolve an adminAuth object from the imported module in a tolerant way.
    const adminAuth = adminModule?.adminAuth ?? adminModule?.admin ?? adminModule;
    if (!adminAuth || typeof adminAuth.createSessionCookie !== "function") {
      console.error("Firebase admin export does not expose createSessionCookie:", adminModule);
      return NextResponse.json(
        { success: false, error: "Server Firebase Admin missing createSessionCookie." },
        { status: 500 }
      );
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN });

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