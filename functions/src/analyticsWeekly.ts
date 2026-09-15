import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { createMetricsService } from './job';
import { fetchEventCounts } from './lib/ga4';
import { TIMEZONE } from './model';

if (!getApps().length) initializeApp();
const service = () => createMetricsService({ db: getFirestore(), fetchCounts: fetchEventCounts, lookupUser: uid => getAuth().getUser(uid), now: () => new Date() });
export const weeklyLaunchMetrics = onSchedule({ schedule: '0 20 * * 1', timeZone: TIMEZONE, retryCount: 3, maxInstances: 1 }, async () => {
  console.info('weeklyLaunchMetrics', await service().run());
});
export const getLaunchMetrics = onCall({ maxInstances: 3 }, request => service().read(request.auth));
export const runLaunchMetricsNow = onCall({ maxInstances: 1 }, request => service().manual(request.auth, request.data));
