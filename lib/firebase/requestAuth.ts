import { headers } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export interface RequestBearerAuth {
  attempted: boolean;
  uid: string | null;
  error?: string;
}

/**
 * Verify a Firebase ID token supplied by a native client.
 * Website requests normally have no Authorization header and continue to use
 * the existing FirebaseSession cookie path in entitlementCheck.ts.
 */
export async function getRequestBearerAuth(): Promise<RequestBearerAuth> {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization) {
    return { attempted: false, uid: null };
  }

  const parts = authorization.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
    return {
      attempted: true,
      uid: null,
      error: "Invalid bearer authorization header",
    };
  }

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(parts[1], true);
    return { attempted: true, uid: decoded.uid };
  } catch {
    return {
      attempted: true,
      uid: null,
      error: "Invalid or expired bearer token",
    };
  }
}
