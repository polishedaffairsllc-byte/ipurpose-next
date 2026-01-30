import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function requireUid() {
  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value;
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

  if (!roleKeys.includes(roleKey)) {
    const error = new Error("Forbidden");
    (error as { status?: number }).status = 403;
    throw error;
  }
}
