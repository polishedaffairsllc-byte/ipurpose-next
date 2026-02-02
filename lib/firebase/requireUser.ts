import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function requireUid() {
  const cookieStore = await cookies();
  // Prefer HttpOnly session cookie
  let session = cookieStore.get("FirebaseSession")?.value;

  // Dev fallback: allow non-HttpOnly session (only in non-production)
  if (!session && process.env.NODE_ENV !== "production") {
    session = cookieStore.get("FirebaseSessionDev")?.value;
  }

  // Header fallback (for testing)
  if (!session && process.env.NODE_ENV !== "production") {
    session = (cookieStore as any).get("x-firebase-session")?.value;
  }

  // Last-resort dev override: use configured DEV_FOUNDER_UID when no session
  if (!session && process.env.NODE_ENV !== "production") {
    const devUid = process.env.DEV_FOUNDER_UID || "PqGLH53bEeUCgkZdCBkS0zy2aIM2";
    return devUid;
  }

  if (!session) {
    const error = new Error("Unauthorized");
    (error as { status?: number }).status = 401;
    throw error;
  }

  const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
  return decoded.uid;
}

export async function requireRole(uid: string, roleKey: "visitor" | "explorer") {
  const userDoc = await firebaseAdmin.firestore().collection("users").doc(uid).get();
  const data = userDoc.data() ?? {};
  const roleKeys = (data.roleKeys as string[]) ?? [];

  // Founder bypass: treat founder/isFounder as having all roles
  const isFounder = data.isFounder === true || data.role === "founder" || data.entitlementTier === "founder";
  if (isFounder) return;

  // In non-production, avoid blocking on missing roleKeys so labs can load during local testing
  if (process.env.NODE_ENV !== "production") return;

  if (!roleKeys.includes(roleKey)) {
    const error = new Error("Forbidden");
    (error as { status?: number }).status = 403;
    throw error;
  }
}
