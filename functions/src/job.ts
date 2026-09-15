import { HttpsError } from 'firebase-functions/v2/https';
import type { Firestore } from 'firebase-admin/firestore';
import { addCounts, computeRates, getPreviousWeekRange, rangeEnding, TIMEZONE, type WeeklyMetrics } from './model';
import { assertIsAdmin, type Caller, type LookupUser } from './lib/auth';
import type { fetchEventCounts } from './lib/ga4';

export interface Dependencies {
  db: Firestore;
  fetchCounts: typeof fetchEventCounts;
  lookupUser: LookupUser;
  now: () => Date;
}

export function createMetricsService(deps: Dependencies) {
  async function run(ending?: string) {
    const now = deps.now();
    const previous = getPreviousWeekRange(now);
    let range;
    try { range = ending === undefined ? previous : rangeEnding(ending); }
    catch { throw new HttpsError('invalid-argument', 'Choose a completed week ending on Sunday (YYYY-MM-DD).'); }
    if (range.weekEnding > previous.weekEnding) throw new HttpsError('invalid-argument', 'That week is not complete yet.');
    const ref = deps.db.collection('analytics_weekly').doc(range.weekEnding);
    if ((await ref.get()).exists) return { skipped: true, weekEnding: range.weekEnding };
    const { byPlatform, property } = await deps.fetchCounts(range.weekStart, range.weekEnding);
    const native = addCounts(byPlatform.Android, byPlatform.iOS);
    const doc: WeeklyMetrics = {
      schemaVersion: 1, ...range, byPlatform, counts: addCounts(native, byPlatform.web), rates: computeRates(native),
      computedAt: now.toISOString(), reportingTimezone: TIMEZONE, property,
    };
    try { await ref.create(doc); }
    catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      if (code !== 6 && code !== 'already-exists' && code !== 'ALREADY_EXISTS') throw error;
      return { skipped: true, weekEnding: range.weekEnding };
    }
    return { skipped: false, weekEnding: range.weekEnding };
  }

  return {
    run,
    async manual(auth: Caller | undefined, data: unknown) {
      await assertIsAdmin(auth, deps.lookupUser);
      if (data !== undefined && data !== null && (typeof data !== 'object' || Array.isArray(data))) throw new HttpsError('invalid-argument', 'Expected an object.');
      const ending = (data as { weekEnding?: unknown } | null)?.weekEnding;
      if (ending !== undefined && typeof ending !== 'string') throw new HttpsError('invalid-argument', 'Invalid weekEnding.');
      return run(ending);
    },
    async read(auth: Caller | undefined) {
      await assertIsAdmin(auth, deps.lookupUser);
      const snap = await deps.db.collection('analytics_weekly').orderBy('weekEnding', 'desc').limit(52).get();
      return snap.docs.map(doc => doc.data() as WeeklyMetrics);
    },
  };
}
