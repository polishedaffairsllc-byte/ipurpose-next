export const ACTIVITY_KINDS = ['accounts', 'profiles', 'leads', 'clarity', 'registrations', 'cohorts', 'emails'] as const;
export type ActivityKind = typeof ACTIVITY_KINDS[number];
export type ActivityTarget = { kind: ActivityKind; id: string };
export interface ActivityRow extends ActivityTarget {
  email: string | null;
  name: string | null;
  date: string | null;
  source: string | null;
  status: string | null;
  score: number | null;
  identity: string | null;
}
export interface ActivityPage { rows: ActivityRow[]; cursor: string | null }
export interface PurgePreview {
  target: ActivityTarget;
  email: string | null;
  uid: string | null;
  loginExists: boolean;
  fingerprint: string;
  confirmation: string;
  counts: Record<string, number>;
  pendingEmails: number;
  records: { path: string; action: 'delete' | 'tombstone' | 'delink' }[];
}
