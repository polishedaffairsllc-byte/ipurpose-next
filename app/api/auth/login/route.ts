import { NextResponse } from "next/server";
import { deriveFounderContext } from "@/lib/isFounder";
import crypto from 'crypto';

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

    const db = firebaseAdmin.firestore();

    // Verify the idToken to extract custom claims and check for founder status
    let uid = '';
    let founderContext = deriveFounderContext(null, null);
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() : null;

      console.log(`[LOGIN] User ${decoded.email} UID ${uid}`);
      console.log(`[LOGIN] ID Token Custom Claims:`, decoded.customClaims);

      founderContext = deriveFounderContext(decoded, userData);
      console.log(`[LOGIN] Founder context resolved:`, founderContext);

      // If founder detected, ensure Firestore is synced with canonical founder fields
      if (founderContext.isFounder) {
        await userRef.set(
          {
            isFounder: true,
            role: 'founder',
            entitlementTier: 'founder',
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        // Ensure role/tier are not null for downstream consumers
        founderContext = {
          isFounder: true,
          role: founderContext.role ?? 'founder',
          entitlementTier: founderContext.entitlementTier ?? 'founder',
        };
        console.log(`[LOGIN] Synced founder fields to Firestore for UID ${uid}`);
      }

      // Reconciliation: migrate any pending entitlements keyed by email hash
      try {
        const email = decoded.email;
        if (email) {
          const normalized = String(email).trim().toLowerCase();
          const emailHash = crypto.createHash('sha256').update(normalized).digest('hex');
          const pendingRef = db.collection('pending_entitlements').doc(emailHash);
          const pendingDoc = await pendingRef.get();
          if (pendingDoc.exists) {
            const pending = pendingDoc.data();
            const pendingEntitlements = pending?.entitlements || {};

            if (Object.keys(pendingEntitlements).length > 0) {
              // Merge pending entitlements onto the canonical user doc
              await userRef.set(
                {
                  entitlements: {
                    ...(userData?.entitlements || {}),
                    ...pendingEntitlements,
                  },
                  // If there were recorded sessions, copy the last one
                  starterPackPurchaseSessionId: (pending.sessions && pending.sessions.length && pending.sessions[pending.sessions.length - 1]) || undefined,
                  updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );

              await pendingRef.set(
                {
                  claimed: true,
                  claimedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                  claimedByUid: uid,
                },
                { merge: true }
              );

              console.log(`migrated pending entitlement for email=${email} to uid=${uid}`);
            }
          }
        }
      } catch (reconErr) {
        console.error('[LOGIN] Pending entitlement reconciliation failed:', reconErr);
      }
    } catch (err) {
      console.error("[LOGIN] Error verifying idToken for custom claims:", err);
    }

    const maxAgeSeconds = Math.floor(SESSION_EXPIRES_IN / 1000);
    const secure = process.env.NODE_ENV === "production";
    const sameSite = secure ? "None" : "Lax"; // Capitalization required for browsers

    // Manually serialize cookies to avoid any framework bugs
    const cookies: string[] = [];

    cookies.push(
      `FirebaseSession=${encodeURIComponent(sessionCookie)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}; HttpOnly`
    );

    // Dev helper cookie (non-HttpOnly) to unblock local testing if HttpOnly is dropped
    if (!secure) {
      cookies.push(
        `FirebaseSessionDev=${encodeURIComponent(sessionCookie)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}`
      );
    }

    // Non-sensitive flag cookie (not HttpOnly) so client-side JS can detect auth state
    cookies.push(
      `ipurpose_logged_in=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}`
    );

    if (founderContext.isFounder) {
      cookies.push(
        `x-founder=true; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}${secure ? "; Secure" : ""}`
      );
    }

    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });

    for (const cookie of cookies) {
      responseHeaders.append("Set-Cookie", cookie);
    }

    const responsePayload = {
      success: true,
      isFounder: founderContext.isFounder,
      role: founderContext.role,
      entitlementTier: founderContext.entitlementTier,
      message: "Login successful",
    };

    const response = new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: responseHeaders,
    });

    console.log("[LOGIN] Response Set-Cookie headers:", cookies);
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