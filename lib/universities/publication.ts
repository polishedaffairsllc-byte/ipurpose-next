import 'server-only';
import { createHash } from 'node:crypto';

/** Separate from private review state: only explicitly approved token hashes can open in production. */
export const PUBLICATION_COLLECTION = 'proposalOutreachPublications';
export type UniversityPublication = { presentation_id: string; presentation_sha256: string };

function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, ordered(item)]));
  return value;
}

/** Pin the complete approved slide copy and asset manifest, independent of Firestore key order. */
export function presentationFingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(ordered(value))).digest('hex');
}
