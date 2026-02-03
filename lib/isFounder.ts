import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData } from "firebase-admin/firestore";

interface DecodedLike extends Partial<DecodedIdToken> {
  customClaims?: Record<string, any> | null;
  role?: string;
  entitlementTier?: string;
  isFounder?: boolean;
}

export interface FounderContext {
  isFounder: boolean;
  role: string | null;
  entitlementTier: string | null;
}

/**
 * Derive founder-related context from decoded Firebase claims plus Firestore user data.
 */
export function deriveFounderContext(
  decoded: DecodedLike | null | undefined,
  userData?: DocumentData | null
): FounderContext {
  const fallbackDecoded = decoded ?? ({} as DecodedLike);
  const customClaims = fallbackDecoded.customClaims ?? {};
  const doc = userData ?? {};

  const founder =
    customClaims?.isFounder === true ||
    fallbackDecoded?.isFounder === true ||
    customClaims?.role === "founder" ||
    fallbackDecoded?.role === "founder" ||
    customClaims?.entitlementTier === "founder" ||
    fallbackDecoded?.entitlementTier === "founder" ||
    doc?.isFounder === true ||
    doc?.role === "founder" ||
    doc?.entitlementTier === "founder";

  const role =
    fallbackDecoded?.role ??
    customClaims?.role ??
    doc?.role ??
    (founder ? "founder" : null);

  const entitlementTier =
    fallbackDecoded?.entitlementTier ??
    customClaims?.entitlementTier ??
    doc?.entitlementTier ??
    (founder ? "founder" : null);

  return {
    isFounder: founder,
    role: role ?? null,
    entitlementTier: entitlementTier ?? null,
  };
}

export function isFounder(decoded: DecodedLike | null | undefined, userData?: DocumentData | null): boolean {
  return deriveFounderContext(decoded, userData).isFounder;
}
